"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Youtube, Sparkles, RotateCcw, Play, CheckCircle2, Loader2 } from "lucide-react";

interface SummaryResult {
  summary: string;
  keyPoints: string[];
  timestamps: string[];
  title: string;
}

const SUPADATA_API_KEY = process.env.NEXT_PUBLIC_SUPADATA_API_KEY!;
const BACKEND_URL = "https://yt-summarizer-backend-abjt.onrender.com";

const LOADING_STEPS = [
  "Fetching transcript...",
  "Analyzing content...",
  "Identifying key points...",
  "Generating summary...",
  "Almost done...",
];

/** Strip markdown fences and extract clean JSON, then parse fields */
function extractJSON(str: string): any | null {
  // Strip markdown fences
  str = str.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  // Try direct parse
  try { return JSON.parse(str); } catch {}
  // Try slicing from first { to last }
  const start = str.indexOf("{");
  const end = str.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try { return JSON.parse(str.slice(start, end + 1)); } catch {}
  }
  return null;
}

function parseResponse(raw: any): SummaryResult {
  // If summary looks like leaked JSON, extract it
  const summaryStr = raw.summary || "";
  if (summaryStr.trim().startsWith("{") || summaryStr.trim().startsWith("```")) {
    const parsed = extractJSON(summaryStr);
    if (parsed?.summary) {
      return {
        title: parsed.title || raw.title || "Video Summary",
        summary: parsed.summary,
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        timestamps: Array.isArray(parsed.timestamps) ? parsed.timestamps : [],
      };
    }
  }
  // If title looks like leaked JSON key, extract from summary
  if (raw.title?.includes('"') || raw.title?.startsWith("{")) {
    const parsed = extractJSON(raw.title + raw.summary);
    if (parsed?.summary) {
      return {
        title: parsed.title || "Video Summary",
        summary: parsed.summary,
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        timestamps: Array.isArray(parsed.timestamps) ? parsed.timestamps : [],
      };
    }
  }
  // All good — return as-is
  return {
    title: raw.title && !raw.title.startsWith("Video ") ? raw.title : raw.title || "Video Summary",
    summary: summaryStr,
    keyPoints: Array.isArray(raw.keyPoints) ? raw.keyPoints : [],
    timestamps: Array.isArray(raw.timestamps) ? raw.timestamps : [],
  };
}

export function YouTubeSummarizer() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) return;
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 8000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const fetchTranscript = async (videoUrl: string): Promise<string> => {
    const encoded = encodeURIComponent(videoUrl);

    // Try native captions first (fast, 1 credit)
    const nativeRes = await fetch(
      `https://api.supadata.ai/v1/transcript?url=${encoded}&text=true&lang=en&mode=native`,
      { headers: { "x-api-key": SUPADATA_API_KEY } }
    );

    if (nativeRes.ok) {
      const data = await nativeRes.json();
      if (data.jobId) return await pollTranscriptJob(data.jobId);
      if (data.content) return data.content;
    }

    // No native captions — fall back to AI generation (works for any video)
    const aiRes = await fetch(
      `https://api.supadata.ai/v1/transcript?url=${encoded}&text=true&mode=generate`,
      { headers: { "x-api-key": SUPADATA_API_KEY } }
    );

    if (!aiRes.ok) {
      const err = await aiRes.json().catch(() => ({}));
      throw new Error(err.message || err.detail || `Could not fetch transcript (${aiRes.status})`);
    }

    const aiData = await aiRes.json();
    if (aiData.jobId) return await pollTranscriptJob(aiData.jobId);
    if (aiData.content) return aiData.content;

    throw new Error("No transcript could be generated for this video. It may be private or age-restricted.");
  };

  const pollTranscriptJob = async (jobId: string): Promise<string> => {
    for (let i = 0; i < 90; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const res = await fetch(`https://api.supadata.ai/v1/transcript/${jobId}`, {
        headers: { "x-api-key": SUPADATA_API_KEY },
      });
      const data = await res.json();
      if (data.status === "completed") return data.content;
      if (data.status === "failed") throw new Error(`Transcript job failed: ${data.error}`);
    }
    throw new Error("Transcript timed out. Please try again.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      let transcript = "";
      try {
        transcript = await fetchTranscript(url);
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        setError(fetchErr.message || "Failed to fetch transcript. Check your video URL.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, transcript }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to summarize video");

      try { setResult(parseResponse(data)); } catch { setResult(data); }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const msg = err.message || "";
      const isQuota = msg.includes("429") || msg.includes("quota") || msg.includes("Quota");
      const isTimeout = err.name === "AbortError";
      setError(
        isTimeout ? "Request timed out. Please try again." :
        isQuota ? "Gemini API daily quota reached (20 requests/day on free tier). Please try again after midnight Pacific Time, or use a different API key." :
        msg || "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => { setUrl(""); setResult(null); setError(null); };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
              <Youtube className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-lg text-foreground">YouTube Summarizer</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-20">
        {!result ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Summaries
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Summarize any YouTube video instantly
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Paste a YouTube URL and get a detailed summary. Works in any language.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Play className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="url"
                    placeholder="Paste YouTube URL here..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pl-10 h-12"
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" disabled={isLoading || !url.trim()} className="h-12 px-6">
                  {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Summarizing...</> : "Summarize"}
                </Button>
              </div>

              {isLoading && (
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  {LOADING_STEPS.map((step, i) => (
                    <div key={i} className={`flex items-center gap-2 text-sm transition-opacity duration-500 ${i <= loadingStep ? "opacity-100" : "opacity-30"}`}>
                      {i < loadingStep ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      ) : i === loadingStep ? (
                        <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-muted-foreground shrink-0" />
                      )}
                      <span className={i === loadingStep ? "text-foreground font-medium" : "text-muted-foreground"}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </form>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">{result.title}</h2>
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />New Video
              </Button>
            </div>

            <Card className="mb-6">
              <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
              <CardContent>
                {result.summary.split("\n\n").filter(Boolean).map((para, i) => (
                  <p key={i} className="leading-relaxed mb-3 last:mb-0">{para}</p>
                ))}
              </CardContent>
            </Card>

            {result.keyPoints?.length > 0 && (
              <Card className="mb-6">
                <CardHeader><CardTitle>Key Points</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {result.timestamps?.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Timestamps</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.timestamps.map((t, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm font-mono">
                        <span className="text-primary font-semibold">{t.split(" - ")[0]}</span>
                        <span className="text-muted-foreground">—</span>
                        <span>{t.split(" - ").slice(1).join(" - ")}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
