"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Youtube,
  Sparkles,
  ListChecks,
  Clock,
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
      const response = await fetch(
        "https://yt-summarizer-backend.onrender.com/api/summarize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to summarize video. Please check the URL and try again.");
      }

      const data = await response.json();
      setResult(data);
    } catch {
      setError("Something went wrong. Please check the URL and try again.");
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
      {/* Header */}
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
          /* Input State */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Summaries
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
                Summarize any YouTube video instantly
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto text-pretty">
                Paste a YouTube URL and get a concise summary, key points, and
                timestamps in seconds.
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
                    className="pl-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !url.trim()}
                  className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
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
                <p className="text-destructive text-sm text-center">{error}</p>
              )}
            </form>

            {isLoading && (
              <div className="mt-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-card border border-border mb-4">
                  <Spinner className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  Analyzing video content...
                </p>
                <p className="text-muted-foreground/70 text-sm mt-1">
                  This may take a moment
                </p>
              </div>
            )}

            {/* Feature Cards */}
            {!isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">
                    Quick Summary
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get a concise overview of the video content
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <ListChecks className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">
                    Key Points
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Extract the most important takeaways
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">
                    Timestamps
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Jump to specific sections easily
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Results State */
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                Video Summary
              </h2>
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-border hover:bg-secondary text-foreground"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Summarize Another
              </Button>
            </div>

            <div className="space-y-6">
              {/* Summary Card */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/90 leading-relaxed">
                    {result.summary}
                  </p>
                </CardContent>
              </Card>

              {/* Key Points Card */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ListChecks className="w-4 h-4 text-primary" />
                    </div>
                    Key Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-foreground/90">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Timestamps Card */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    Timestamps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.timestamps.map((timestamp, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <span className="font-mono text-sm text-primary bg-primary/10 px-2 py-1 rounded">
                          {timestamp.split(" - ")[0] || timestamp.split(" ")[0]}
                        </span>
                        <span className="text-foreground/90 text-sm">
                          {timestamp.includes(" - ")
                            ? timestamp.split(" - ").slice(1).join(" - ")
                            : timestamp.split(" ").slice(1).join(" ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Powered by AI. Paste any YouTube video URL to get started.
          </p>
        </div>
      </footer>
    </div>
  );
}
