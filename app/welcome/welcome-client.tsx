"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function WelcomeClient({
  email,
  name,
  avatar,
}: {
  email: string;
  name: string;
  avatar: string | null;
}) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/summarize");
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="text-center">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-5">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              width={56}
              height={56}
              className="rounded-full border-2 border-[#2a2a2a]"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-white text-xl font-medium">
              {email[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Message */}
        <h1 className="text-white text-2xl font-medium mb-2">
          You are now signed in
        </h1>
        <p className="text-[#666] text-[14px] mb-1">as</p>
        <p className="text-white text-[16px] font-medium mb-8">{email}</p>

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-[#444] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-1.5 h-1.5 bg-[#444] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-1.5 h-1.5 bg-[#444] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <p className="text-[#555] text-[12px] mt-3">Taking you to the app...</p>
      </div>
    </div>
  );
}
