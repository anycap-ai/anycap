"use client";

import dynamic from "next/dynamic";
import React, { Component, type ErrorInfo, type ReactNode } from "react";

import type { AgentCore3DBridge } from "./agent-core-3d-state";

export const DESKTOP_DPR_CAP = 1.5;
export const MOBILE_DPR_CAP = 1.25;

type AgentCoreCanvasProps = {
  bridge: AgentCore3DBridge;
  fallback: ReactNode;
};

type AgentCoreCanvasErrorBoundaryProps = {
  fallback: ReactNode;
  children: ReactNode;
};

type AgentCoreCanvasErrorBoundaryState = {
  failed: boolean;
};

const LazyAgentCoreCanvas = dynamic(
  () => import("./AgentCoreRobot3D").then((module) => module.AgentCoreCanvasLeaf),
  {
    ssr: false,
    loading: () => null,
  },
);

class AgentCoreCanvasErrorBoundary extends Component<
  AgentCoreCanvasErrorBoundaryProps,
  AgentCoreCanvasErrorBoundaryState
> {
  state: AgentCoreCanvasErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): AgentCoreCanvasErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // The approved WebP composition remains visible through the fallback.
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

function getDprCap(): number {
  if (typeof window === "undefined") return DESKTOP_DPR_CAP;
  return window.matchMedia("(max-width: 767px)").matches ? MOBILE_DPR_CAP : DESKTOP_DPR_CAP;
}

export function AgentCoreCanvas({ bridge, fallback }: AgentCoreCanvasProps) {
  return (
    <AgentCoreCanvasErrorBoundary fallback={fallback}>
      <LazyAgentCoreCanvas bridge={bridge} fallback={fallback} dprCap={getDprCap()} />
    </AgentCoreCanvasErrorBoundary>
  );
}
