"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Youtube } from "lucide-react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://yt-summarizer-frontend-git-main-lekhaaa14s-projects.vercel.app/auth/callback",
        queryParams: {
          prompt: "select_account",
        },
      },
    });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Check your email to confirm your account!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push("/summarize");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#111] border border-[#2a2a2a] rounded-lg flex items-center justify-center">
            <Youtube className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-[15px] text-white">SummarizeAI</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-8 w-full max-w-sm">
          <h2 className="text-white text-xl font-medium mb-2 text-center">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h2>
          <p className="text-[#666] text-[13px] text-center mb-7">
            {isSignUp
              ? "Sign up to start summarizing and saving videos"
              : "Sign in to start summarizing and saving videos"}
          </p>

          <button
            onClick={handleGoogle}
            className="w-full bg-white text-black font-medium text-[14px] py-3 rounded-xl flex items-center justify-center gap-2.5 hover:bg-gray-100 transition-colors mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#2a2a2a]" />
            <span className="text-[12px] text-[#444]">or</span>
            <div className="flex-1 h-px bg-[#2a2a2a]" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white text-[13px] placeholder-[#444] outline-none focus:border-[#444] transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white text-[13px] placeholder-[#444] outline-none focus:border-[#444] transition-colors"
            />
            {error && <p className="text-red-400 text-[12px]">{error}</p>}
            {message && <p className="text-green-400 text-[12px]">{message}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1a1a] border border-[#333] text-white text-[13px] font-medium py-3 rounded-lg hover:bg-[#222] transition-colors disabled:opacity-50"
            >
              {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="text-center text-[12px] text-[#555] mt-5">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
              className="text-white hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
