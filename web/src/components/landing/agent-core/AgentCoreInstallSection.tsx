"use client";

import { useRef, useState } from "react";

import { AgentCoreScene } from "./AgentCoreScene";
import { formatAgentCoreValue, getAgentCoreStats } from "./agent-core-stats";
import type { AgentCorePhase } from "./agent-core-state";
import { CapabilityTelemetry } from "./CapabilityTelemetry";
import styles from "./agent-core.module.css";
import { useAgentCoreTimeline } from "./useAgentCoreTimeline";

const stats = getAgentCoreStats();

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
    onPhaseChange,
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
