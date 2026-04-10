"use client";

import dynamic from "next/dynamic";

const GrainOverlay = dynamic(
  () => import("./GrainOverlay").then((m) => ({ default: m.GrainOverlay })),
  { ssr: false },
);

export function LazyGrainOverlay() {
  return <GrainOverlay />;
}
