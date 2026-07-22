"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useRef, useState, type ErrorInfo, type ReactNode } from "react";

import { AgentCoreScene } from "./AgentCoreScene";
import {
  createAgentCore3DBridge,
  type AgentCore3DBridge,
} from "./agent-core-3d-bridge";
import { formatAgentCoreValue, getAgentCoreStats } from "./agent-core-stats";
import type { AgentCorePhase } from "./agent-core-state";
import { CapabilityTelemetry } from "./CapabilityTelemetry";
import styles from "./agent-core.module.css";
import { useAgentCoreGaze3D } from "./useAgentCoreGaze3D";
import { useAgentCoreTimeline } from "./useAgentCoreTimeline";

const stats = getAgentCoreStats();
const AgentCoreStage3D = dynamic(() => import("./AgentCoreStage3D").then(({ AgentCoreStage3D }) => AgentCoreStage3D), {
  loading: () => null,
  ssr: false,
});

type StageBoundaryProps = {
  children: ReactNode;
  onError: () => void;
};

class AgentCoreStageBoundary extends Component<StageBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function updateBridgePhase(bridge: AgentCore3DBridge, phase: AgentCorePhase) {
  if (phase === "connected") {
    bridge.phase = "connected";
    bridge.coreOwner = "socket";
    bridge.gazeMode = "user";
    bridge.progress = 1;
  } else if (phase === "installing") {
    bridge.phase = "carrying";
    bridge.coreOwner = "hand";
    bridge.gazeMode = "socket";
    bridge.progress = 0.5;
  } else if (phase === "dragging") {
    bridge.phase = "targeting";
    bridge.coreOwner = "dock";
    bridge.gazeMode = "core";
    bridge.progress = 0;
  } else {
    bridge.phase = "awaiting";
    bridge.coreOwner = "dock";
    bridge.gazeMode = "user";
    bridge.progress = 0;
  }
}

export function AgentCoreInstallSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);
  const coreRef = useRef<HTMLButtonElement | null>(null);
  const activationCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<HTMLDivElement | null>(null);
  const dockRef = useRef<HTMLDivElement | null>(null);
  const statusRef = useRef<HTMLSpanElement | null>(null);
  const valueRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const fillRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [phase, onPhaseChange] = useState<AgentCorePhase>("awaiting");
  const [stageReady, setStageReady] = useState(false);
  const legacyGazeEnabledRef = useRef(true);
  legacyGazeEnabledRef.current = !stageReady;
  const bridgeRef = useRef<AgentCore3DBridge | null>(null);
  if (bridgeRef.current === null) bridgeRef.current = createAgentCore3DBridge();
  const bridge = bridgeRef.current;
  updateBridgePhase(bridge, phase);

  const handleStageReady = useCallback(() => setStageReady(true), []);
  const handleStageError = useCallback(() => setStageReady(false), []);
  const handlePhaseChange = useCallback(
    (nextPhase: AgentCorePhase) => {
      bridge.pointer.active = false;
      updateBridgePhase(bridge, nextPhase);
      bridge.invalidate?.();
      onPhaseChange(nextPhase);
    },
    [bridge, onPhaseChange],
  );

  useAgentCoreGaze3D(sectionRef, bridge, stageReady);

  const {
    onClick,
    onKeyDown,
    onLostPointerCapture,
    onPointerCancel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  } = useAgentCoreTimeline({
    sectionRef,
    sceneRef,
    headRef,
    coreRef,
    activationCanvasRef,
    socketRef,
    dockRef,
    statusRef,
    valueRefs,
    fillRefs,
    legacyGazeEnabledRef,
    onPhaseChange: handlePhaseChange,
  });

  const connected = phase === "connected";

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      data-agent-core-section
      data-agent-core-phase={phase}
      aria-labelledby="agent-core-heading"
    >
      <div className={styles.layout}>
        <div className={styles.copy} data-agent-core-entrance>
          <h2 id="agent-core-heading" className={styles.heading}>
            <span>One capability layer.</span>
            <span>Every way to finish.</span>
          </h2>
          <p className={styles.audience}>Human + agent</p>
          <p className={styles.supporting}>Create. Understand. Find. Manage. Deliver.</p>
          <p className={styles.command}>
            anycap install
            <span className={styles.commandCursor} aria-hidden="true" />
          </p>
        </div>

        <CapabilityTelemetry
          connected={connected}
          statusRef={statusRef}
          valueRefs={valueRefs}
          fillRefs={fillRefs}
        />

        <AgentCoreScene
          connected={connected}
          stage={
            <AgentCoreStageBoundary onError={handleStageError}>
              <AgentCoreStage3D
                bridge={bridge}
                ready={stageReady}
                onReady={handleStageReady}
                onError={handleStageError}
              />
            </AgentCoreStageBoundary>
          }
          sceneRef={sceneRef}
          headRef={headRef}
          coreRef={coreRef}
          activationCanvasRef={activationCanvasRef}
          socketRef={socketRef}
          dockRef={dockRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onLostPointerCapture={onLostPointerCapture}
          onPointerCancel={onPointerCancel}
          onClick={onClick}
          onKeyDown={onKeyDown}
        />

        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {connected ? "AnyCap Core connected. Twelve capabilities are ready." : ""}
        </span>

        <noscript>
          <style>{`[data-agent-core-section] .${styles.awaitingVisual} { display: none !important; }`}</style>
          <div className={styles.noScriptTelemetry}>
            <p className={styles.noScriptStatus}>Core status / Connected</p>
            <div className={styles.noScriptRows}>
              {stats.map((stat) => (
                <p key={stat.id}>
                  <span>{stat.label}</span>
                  <span>{formatAgentCoreValue(stat.value)}</span>
                </p>
              ))}
            </div>
          </div>
        </noscript>
      </div>
    </section>
  );
}
