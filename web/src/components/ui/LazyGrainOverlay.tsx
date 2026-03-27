"use client";

import dynamic from "next/dynamic";

const GrainOverlay = dynamic(
  () => import("./GrainOverlay").then((mod) => mod.GrainOverlay),
  { ssr: false }
);

export function LazyGrainOverlay() {
  return <GrainOverlay />;
}
