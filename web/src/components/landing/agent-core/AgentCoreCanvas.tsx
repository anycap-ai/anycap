"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from "react";

import type { AgentCore3DBridge } from "./agent-core-3d-state";

export const DESKTOP_DPR_CAP = 1.5;
export const MOBILE_DPR_CAP = 1.25;

type AgentCoreCanvasProps = {
  bridge: AgentCore3DBridge;
  onReady: () => void;
  onUnavailable: () => void;
};

type AgentCoreCanvasErrorBoundaryProps = {
  onUnavailable: () => void;
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
    this.props.onUnavailable();
  }

  render() {
    if (this.state.failed) return null;
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

export function AgentCoreCanvas({ bridge, onReady, onUnavailable }: AgentCoreCanvasProps) {
  const dprCap = useDprCap();

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <AgentCoreCanvasErrorBoundary onUnavailable={onUnavailable}>
        <LazyAgentCoreCanvas
          bridge={bridge}
          dprCap={dprCap}
          onReady={onReady}
          onUnavailable={onUnavailable}
        />
      </AgentCoreCanvasErrorBoundary>
    </div>
  );
}
