"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Youtube,
  Sparkles,
  RotateCcw,
  Play,
} from "lucide-react";

interface SummaryResult {
  summary: string;
  keyPoints: string[];
  timestamps: string[];
}

export function YouTubeSummarizer() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // ✅ ONLY call backend (NO YouTube calls here)
      const response = await fetch(
        "https://yt-summarizer-backend-abjt.onrender.com/api/summarize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: url, // ✅ send URL only
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to summarize video");
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUrl("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
              <Youtube className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-lg text-foreground">
              YouTube Summarizer
            </span>
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
                Paste a YouTube URL and get a concise summary instantly.
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

                <Button type="submit" disabled={isLoading || !url.trim()}>
                  {isLoading ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Summarizing...
                    </>
                  ) : (
                    "Summarize"
                  )}
                </Button>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
            </form>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Video Summary</h2>
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{result.summary}</p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Key Points</CardTitle>
              </CardHeader>
              <CardContent>
                <ul>
                  {result.keyPoints.map((point, i) => (
                    <li key={i}>• {point}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timestamps</CardTitle>
              </CardHeader>
              <CardContent>
                <ul>
                  {result.timestamps.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}