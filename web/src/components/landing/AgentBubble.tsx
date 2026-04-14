"use client";

import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0";
import { LoginButton } from "@/components/auth/LoginButton";

const bubbleStyles = `
@keyframes bubble-breathe {
  0%, 100% {
    transform: scale(1);
    box-shadow:
      0 14px 30px rgba(0,0,0,0.08),
      0 0 0 0 rgba(0,0,0,0);
  }
  50% {
    transform: scale(1.035);
    box-shadow:
      0 18px 40px rgba(0,0,0,0.12),
      0 0 32px 4px rgba(107,125,58,0.10);
  }
}

@keyframes dot-pop {
  0%   { transform: scale(0); opacity: 0; }
  60%  { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes bubble-enter {
  0%   { transform: scale(0.88); opacity: 0; }
  60%  { transform: scale(1.025); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.agent-dot-1 {
  opacity: 0;
  animation: dot-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s forwards;
}
.agent-dot-2 {
  opacity: 0;
  animation: dot-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 0.9s forwards;
}
.agent-bubble-main {
  opacity: 0;
  animation: bubble-enter 0.45s cubic-bezier(0.34, 1.4, 0.64, 1) 1.2s forwards;
}
.agent-bubble-main.entered {
  opacity: 1;
  animation: bubble-breathe 3.4s ease-in-out infinite;
}
`;

export function AgentBubble() {
  const { user, isLoading } = useUser();

  if (isLoading) return null;

  return (
    <div className="absolute right-[112px] top-4 z-20 hidden max-w-[320px] xl:block">
      <style dangerouslySetInnerHTML={{ __html: bubbleStyles }} />

      {/* thought dots — appear first */}
      <div
        aria-hidden
        className="agent-dot-2 absolute bottom-[-40px] right-[46px] h-3 w-3 rounded-full border border-[#e8e8e8] bg-white shadow-[0_6px_12px_rgba(0,0,0,0.06)]"
      />
      <div
        aria-hidden
        className="agent-dot-1 absolute bottom-[-24px] right-[68px] h-4.5 w-4.5 rounded-full border border-[#e8e8e8] bg-white shadow-[0_8px_16px_rgba(0,0,0,0.06)]"
      />

      {/* main bubble */}
      {user ? (
        <Link
          href="/dashboard"
          prefetch={false}
          className="agent-bubble-main group relative block rounded-[30px] border border-[#e6e6e6] bg-white px-5 py-4 text-[#1c1f17] transition-[border-color] duration-300 ease-out hover:border-[#d0d0d0]"
          onAnimationEnd={(e) => {
            if (e.animationName === "bubble-enter") {
              e.currentTarget.classList.add("entered");
            }
          }}
        >
          <div
            aria-hidden
            className="absolute bottom-[-10px] right-[88px] h-5 w-5 rotate-45 rounded-[8px] border-r border-b border-[#e6e6e6] bg-white shadow-[6px_8px_14px_rgba(0,0,0,0.05)]"
          />
          <p className="text-[15px] font-semibold leading-[1.35] text-[#182012]">
            Let me show you what I can do<span className="text-[#5f7a29]">.</span>
          </p>
          <p className="mt-1.5 text-[12px] leading-[1.55] text-[#495240]">
            250 free credits (<span className="font-semibold text-[#1f2619]">$5 value</span>) for new sign-ups. Ends <span className="font-semibold text-[#1f2619]">Apr 30</span>.
          </p>
          <span className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.3px] text-[#5f7a29] transition-colors duration-200 group-hover:text-[#4a6520]">
            Go to dashboard
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="translate-x-0 transition-transform duration-300 group-hover:translate-x-1">
              <path d="M3 1.5L7 5L3 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </Link>
      ) : (
        <LoginButton
          className="agent-bubble-main group relative block rounded-[30px] border border-[#e6e6e6] bg-white px-5 py-4 text-[#1c1f17] transition-[border-color] duration-300 ease-out hover:border-[#d0d0d0]"
          onAnimationEnd={(e) => {
            if (e.animationName === "bubble-enter") {
              e.currentTarget.classList.add("entered");
            }
          }}
        >
          <div
            aria-hidden
            className="absolute bottom-[-10px] right-[88px] h-5 w-5 rotate-45 rounded-[8px] border-r border-b border-[#e6e6e6] bg-white shadow-[6px_8px_14px_rgba(0,0,0,0.05)]"
          />
          <p className="text-[15px] font-semibold leading-[1.35] text-[#182012]">
            Let me show you what I can do<span className="text-[#5f7a29]">.</span>
          </p>
          <p className="mt-1.5 text-[12px] leading-[1.55] text-[#495240]">
            250 free credits (<span className="font-semibold text-[#1f2619]">$5 value</span>) for new sign-ups. Ends <span className="font-semibold text-[#1f2619]">Apr 30</span>.
          </p>
          <span className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.3px] text-[#5f7a29] transition-colors duration-200 group-hover:text-[#4a6520]">
            Try it free
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="translate-x-0 transition-transform duration-300 group-hover:translate-x-1">
              <path d="M3 1.5L7 5L3 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </LoginButton>
      )}
    </div>
  );
}
