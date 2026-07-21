import Image from "next/image";
import type React from "react";

import assetManifest from "../../../../public/visuals/agent-core/asset-manifest.json";
import { AgentHeadTracker } from "./AgentHeadTracker";
import { AnyCapCoreControl } from "./AnyCapCoreControl";
import styles from "./agent-core.module.css";

export type AgentCoreSceneProps = {
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

const { artboard, assets, anchors } = assetManifest;
const sceneLeft = assets.body.canonicalPlacement.x;
const sceneWidth = artboard.width - sceneLeft;
const socketSize = 16;

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
const corePlacement = getPlacement(assets.core);
const dockPlacement = getPlacement(assets.dock);
const socketCenterX = ((anchors.socketCenter.x * artboard.width - sceneLeft) / sceneWidth) * 100;
const socketCenterY = anchors.socketCenter.y * 100;

const sceneStyle = {
  "--agent-body-left": bodyPlacement.left,
  "--agent-body-top": bodyPlacement.top,
  "--agent-body-width": bodyPlacement.width,
  "--agent-head-left": headPlacement.left,
  "--agent-head-top": headPlacement.top,
  "--agent-head-width": headPlacement.width,
  "--agent-core-left": corePlacement.left,
  "--agent-core-top": corePlacement.top,
  "--agent-core-width": corePlacement.width,
  "--agent-dock-left": dockPlacement.left,
  "--agent-dock-top": dockPlacement.top,
  "--agent-dock-width": dockPlacement.width,
  "--agent-socket-left": `${socketCenterX - socketSize / 2}%`,
  "--agent-socket-top": `${socketCenterY - socketSize / 2}%`,
  "--agent-socket-size": `${socketSize}%`,
} as React.CSSProperties;

export function AgentCoreScene({
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
  onKeyDown,
}: AgentCoreSceneProps) {
  return (
    <div
      ref={sceneRef}
      className={`${styles.scene} ${styles.awaitingVisual}${
        connected ? ` ${styles.sceneConnected}` : ""
      }`}
      style={sceneStyle}
      data-connected={connected}
    >
      <div className={styles.table} aria-hidden="true" />

      <div className={styles.body} aria-hidden="true">
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

      <div ref={socketRef} className={styles.socket} aria-hidden="true" />
      <canvas
        ref={activationCanvasRef}
        className={styles.activationCanvas}
        width={160}
        height={160}
        aria-hidden="true"
      />

      <div ref={dockRef} className={styles.dock} aria-hidden="true">
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

      <AnyCapCoreControl
        coreRef={coreRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
