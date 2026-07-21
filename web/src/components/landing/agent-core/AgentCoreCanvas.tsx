"use client";

import dynamic from "next/dynamic";
import React, { Component, useEffect, useState, type ErrorInfo, type ReactNode } from "react";

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

function useDprCap(): number {
  const [dprCap, setDprCap] = useState(DESKTOP_DPR_CAP);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const updateDprCap = () => {
      setDprCap(mobileQuery.matches ? MOBILE_DPR_CAP : DESKTOP_DPR_CAP);
    };

    updateDprCap();
    mobileQuery.addEventListener("change", updateDprCap);
    return () => mobileQuery.removeEventListener("change", updateDprCap);
  }, []);

  return dprCap;
}

export function AgentCoreCanvas({ bridge, fallback }: AgentCoreCanvasProps) {
  const [ready, setReady] = useState(false);
  const dprCap = useDprCap();

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {!ready ? (
        <div style={{ position: "absolute", inset: 0, zIndex: 1 }} aria-hidden="true">
          {fallback}
        </div>
      ) : null}
      <AgentCoreCanvasErrorBoundary fallback={fallback}>
        <LazyAgentCoreCanvas
          bridge={bridge}
          fallback={fallback}
          dprCap={dprCap}
          onReady={() => setReady(true)}
          onUnavailable={() => setReady(false)}
        />
      </AgentCoreCanvasErrorBoundary>
    </div>
  );
}
