import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "AnyCap — One CLI. Any capability.",
  description:
    "One CLI, all capabilities. No SDK. No docs. No UI. AnyCap gives AI agents zero-friction access to image, video, music, TTS, ASR, search, and crawl.",
  icons: {
    icon: "/anycap-mark.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-[#e0e0e0] font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
