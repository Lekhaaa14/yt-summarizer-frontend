"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Youtube, Trash2, Clock, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface Summary {
  id: string;
  title: string;
  video_url: string;
  video_id: string;
  summary: string;
  key_points: string[];
  timestamps: string[];
  created_at: string;
}

export default function HistoryPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    const { data, error } = await supabase
      .from("summaries")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setSummaries(data);
    setLoading(false);
  };

  const deleteSummary = async (id: string) => {
    await supabase.from("summaries").delete().eq("id", id);
    setSummaries((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
              <Youtube className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-lg">YouTube Summarizer</span>
          </Link>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">History</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Your Summaries</h1>
          <span className="text-muted-foreground text-sm">{summaries.length} saved</span>
        </div>

        {summaries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No summaries yet.</p>
            <Link href="/">
              <Button>Summarize a video</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {summaries.map((s) => (
              <Card key={s.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base leading-snug truncate">
                        <a
                          href={s.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors"
                        >
                          {s.title || s.video_id}
                        </a>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(s.created_at).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                      >
                        {expanded === s.id
                          ? <ChevronUp className="w-4 h-4" />
                          : <ChevronDown className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSummary(s.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expanded === s.id && (
                  <CardContent className="pt-0 space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Summary</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{s.summary}</p>
                    </div>
                    {s.key_points?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Key Points</p>
                        <ul className="space-y-1">
                          {s.key_points.map((p, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex gap-2">
                              <span className="text-primary">•</span>{p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
