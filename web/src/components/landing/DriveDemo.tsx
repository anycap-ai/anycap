"use client";

import { CapabilityDemo, type DemoLine } from "./CapabilityDemo";

const lines: DemoLine[] = [
  { type: "header", delay: 0 },
  {
    type: "prompt",
    content: "Upload the launch video and share a public link",
    delay: 500,
  },
  {
    type: "text",
    content: "I'll upload the file to AnyCap Drive and create a share link.",
    delay: 800,
  },
  {
    type: "tool",
    content: `run("anycap drive upload launch.mp4")`,
    delay: 600,
  },
  {
    type: "text",
    content: "Uploaded — launch.mp4 (12.4 MB) → dn_xKmP123",
    sub: "✓",
    delay: 1200,
  },
  {
    type: "tool",
    content: `run("anycap drive share dn_xKmP123")`,
    delay: 600,
  },
  {
    type: "text",
    content: "Public link created — https://drive.anycap.ai/s/xKmP123",
    sub: "✓",
    delay: 1000,
  },
  {
    type: "tool",
    content: `run("anycap drive list")`,
    delay: 600,
  },
  {
    type: "drive",
    delay: 400,
    driveFiles: [
      { name: "launch.mp4", size: "12.4 MB", date: "Apr 03", shared: true },
      { name: "hero.png", size: "1.2 MB", date: "Apr 02", shared: true },
      { name: "brand-assets/", size: "—", date: "Apr 01", shared: false },
      { name: "prototype-v2.fig", size: "8.7 MB", date: "Mar 30", shared: false },
    ],
  },
  {
    type: "text",
    content: "Video uploaded and shared. Here's the public link: https://drive.anycap.ai/s/xKmP123",
    delay: 600,
  },
  { type: "cursor", delay: 500 },
];

export function DriveDemo() {
  return <CapabilityDemo lines={lines} />;
}
