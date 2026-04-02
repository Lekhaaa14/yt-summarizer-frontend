
import Link from "next/link";
import { Youtube } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#111] border border-[#2a2a2a] rounded-lg flex items-center justify-center">
            <Youtube className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-[15px]">SummarizeAI</span>
        </div>
        <Link
          href="/login"
          className="bg-white text-black text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        {/* Badge */}
        <div className="flex items-center gap-2 bg-[#111] border border-[#2a2a2a] rounded-full px-4 py-1.5 text-[12px] text-[#888] mb-10">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
          Powered by Gemini 2.5 Flash
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-6xl font-medium leading-[1.1] tracking-tight mb-6 max-w-2xl">
          Summarize any{" "}
          <span className="text-[#555]">YouTube video</span>{" "}
          instantly
        </h1>

        <p className="text-[#666] text-lg max-w-md mb-10 leading-relaxed">
          Paste a link. Get a full summary, key points, and timestamps in seconds. Works in any language.
        </p>

        {/* CTA */}
        <Link
          href="/login"
          className="bg-white text-black font-medium text-[15px] px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
        >
          Get started free
          <span>→</span>
        </Link>

        {/* Feature strip */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#1a1a1a] border border-[#1a1a1a] rounded-xl overflow-hidden max-w-2xl w-full">
          <div className="bg-[#0a0a0a] px-6 py-6 text-left">
            <div className="w-8 h-8 bg-[#111] border border-[#222] rounded-lg flex items-center justify-center mb-3 text-sm">⚡</div>
            <h3 className="text-[13px] font-medium text-white mb-1">Fast</h3>
            <p className="text-[12px] text-[#555] leading-relaxed">Summary in under 30 seconds for most videos</p>
          </div>
          <div className="bg-[#0a0a0a] px-6 py-6 text-left">
            <div className="w-8 h-8 bg-[#111] border border-[#222] rounded-lg flex items-center justify-center mb-3 text-sm">🌐</div>
            <h3 className="text-[13px] font-medium text-white mb-1">Any language</h3>
            <p className="text-[12px] text-[#555] leading-relaxed">Works with videos in any language automatically</p>
          </div>
          <div className="bg-[#0a0a0a] px-6 py-6 text-left">
            <div className="w-8 h-8 bg-[#111] border border-[#222] rounded-lg flex items-center justify-center mb-3 text-sm">📁</div>
            <h3 className="text-[13px] font-medium text-white mb-1">Saved history</h3>
            <p className="text-[12px] text-[#555] leading-relaxed">Every summary saved to your account automatically</p>
          </div>
        </div>
      </main>
    </div>
  );
}
