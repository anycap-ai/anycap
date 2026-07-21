"use client";

import Image from "next/image";
import { useCallback, useState, type CSSProperties } from "react";
import type React from "react";

import assetManifest from "../../../../public/visuals/agent-core/asset-manifest.json";
import {
  projectAgentCoreInteractiveTargets,
  type AgentCore3DBridge,
} from "./agent-core-3d-state";
import { AgentCoreCanvas } from "./AgentCoreCanvas";
import { AgentHeadTracker } from "./AgentHeadTracker";
import { AnyCapCoreControl } from "./AnyCapCoreControl";
import styles from "./agent-core.module.css";

export type AgentCoreSceneProps = {
  bridge: AgentCore3DBridge;
  connected: boolean;
  sceneRef: React.RefObject<HTMLDivElement | null>;
  headRef: React.RefObject<HTMLDivElement | null>;
  coreRef: React.RefObject<HTMLButtonElement | null>;
  activationCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  socketRef: React.RefObject<HTMLDivElement | null>;
  dockRef: React.RefObject<HTMLDivElement | null>;
  onPointerDown: React.PointerEventHandler<HTMLButtonElement>;
  onPointerMove: React.PointerEventHandler<HTMLButtonElement>;
  onPointerUp: React.PointerEventHandler<HTMLButtonElement>;
  onLostPointerCapture: React.PointerEventHandler<HTMLButtonElement>;
  onPointerCancel: React.PointerEventHandler<HTMLButtonElement>;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLButtonElement>;
};

type ManifestAsset = {
  width: number;
  height: number;
  canonicalPlacement: {
    x: number;
    y: number;
    scale: number;
  };
};

const { artboard, assets } = assetManifest;
const sceneLeft = assets.body.canonicalPlacement.x;
const sceneWidth = artboard.width - sceneLeft;

function toPercent(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

function getPlacement(asset: ManifestAsset) {
  return {
    left: toPercent(asset.canonicalPlacement.x - sceneLeft, sceneWidth),
    top: toPercent(asset.canonicalPlacement.y, artboard.height),
    width: toPercent(asset.width * asset.canonicalPlacement.scale, sceneWidth),
  };
}

const bodyPlacement = getPlacement(assets.body);
const headPlacement = getPlacement(assets.head);
const dockPlacement = getPlacement(assets.dock);
const { tableCore, chestSocket } = projectAgentCoreInteractiveTargets(100);

const sceneStyle = {
  "--agent-body-left": bodyPlacement.left,
  "--agent-body-top": bodyPlacement.top,
  "--agent-body-width": bodyPlacement.width,
  "--agent-head-left": headPlacement.left,
  "--agent-head-top": headPlacement.top,
  "--agent-head-width": headPlacement.width,
  "--agent-table-core-left": `${tableCore.normalized.left * 100}%`,
  "--agent-table-core-top": `${tableCore.normalized.top * 100}%`,
  "--agent-table-core-size": `${tableCore.normalized.width * 100}%`,
  "--agent-dock-left": dockPlacement.left,
  "--agent-dock-top": dockPlacement.top,
  "--agent-dock-width": dockPlacement.width,
  "--agent-socket-left": `${chestSocket.normalized.left * 100}%`,
  "--agent-socket-top": `${chestSocket.normalized.top * 100}%`,
  "--agent-socket-size": `${chestSocket.normalized.width * 100}%`,
} as CSSProperties;

export function AgentCoreScene({
  bridge,
  connected,
  sceneRef,
  headRef,
  coreRef,
  activationCanvasRef,
  socketRef,
  dockRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onLostPointerCapture,
  onPointerCancel,
  onClick,
  onKeyDown,
}: AgentCoreSceneProps) {
  const [canvasReady, setCanvasReady] = useState(false);
  const showCanvas = useCallback(() => setCanvasReady(true), []);
  const showFallback = useCallback(() => setCanvasReady(false), []);

  return (
    <div
      ref={sceneRef}
      className={`${styles.scene} ${styles.awaitingVisual}${
        connected ? ` ${styles.sceneConnected}` : ""
      }`}
      style={sceneStyle}
      data-connected={connected}
      data-agent-core-entrance
    >
      <div className={styles.table} aria-hidden="true" />

      <div className={styles.canvasLayer} aria-hidden="true">
        <AgentCoreCanvas
          bridge={bridge}
          onReady={showCanvas}
          onUnavailable={showFallback}
        />
      </div>

      <div
        className={`${styles.fallbackVisual}${canvasReady ? ` ${styles.fallbackHidden}` : ""}`}
        data-agent-core-fallback
        aria-hidden="true"
      >
        <div className={styles.body}>
          <Image
            src="/visuals/agent-core/robot-body.webp"
            alt=""
            width={1024}
            height={1024}
            sizes="(min-width: 1280px) 50vw, (min-width: 768px) 52vw, calc(100vw - 64px)"
            draggable={false}
            className={styles.layerImage}
          />
        </div>

        <AgentHeadTracker headRef={headRef} />

        <div className={styles.dock}>
          <Image
            src="/visuals/agent-core/core-dock.webp"
            alt=""
            width={640}
            height={320}
            sizes="(min-width: 1280px) 14vw, (min-width: 768px) 13vw, 23vw"
            draggable={false}
            className={styles.layerImage}
          />
        </div>

        <div className={styles.fallbackCore} data-agent-core-fallback-core>
          <Image
            src="/visuals/agent-core/anycap-core.webp"
            alt=""
            width={512}
            height={512}
            sizes="(min-width: 1280px) 10vw, (min-width: 768px) 8vw, 16vw"
            draggable={false}
            className={styles.layerImage}
          />
        </div>
      </div>

      <div ref={socketRef} className={styles.socket} aria-hidden="true" />
      <canvas
        ref={activationCanvasRef}
        className={styles.activationCanvas}
        width={160}
        height={160}
        aria-hidden="true"
      />

      <div ref={dockRef} className={styles.dockTarget} aria-hidden="true" />

      <AnyCapCoreControl
        coreRef={coreRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onLostPointerCapture={onLostPointerCapture}
        onPointerCancel={onPointerCancel}
        onClick={onClick}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
