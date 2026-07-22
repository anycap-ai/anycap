import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import type React from "react";

import assetManifest from "../../../../public/visuals/agent-core/asset-manifest.json";
import {
  commitAgentCoreRestPoseBeforeConnected,
  resolveAgentCoreLegacyInstallGaze,
  type AgentCore3DBridge,
  type AgentCoreLegacyGazeOwnership,
  type AgentCoreLegacyHeadTarget,
  type GazeMode,
} from "./agent-core-3d-bridge";
import {
  initialInstallState,
  nextInstallState,
  type AgentCoreInstallEvent,
  type AgentCoreInstallPhase,
  type AgentCoreInstallState,
} from "./agent-core-install-state";
import { formatAgentCoreValue, getAgentCoreStats } from "./agent-core-stats";
import { clampHeadRotation } from "./agent-core-state";
import styles from "./agent-core.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const stats = getAgentCoreStats();
const INSTALL_DURATION_SECONDS = 3;
const TELEMETRY_CELL_COUNT = 12;
const PARTICLE_COUNT = 40;
const BURST_DURATION_MS = 900;

type UseAgentCoreTimelineOptions = {
  sectionRef: React.RefObject<HTMLElement | null>;
  sceneRef: React.RefObject<HTMLDivElement | null>;
  headRef: React.RefObject<HTMLDivElement | null>;
  coreRef: React.RefObject<HTMLButtonElement | null>;
  socketRef: React.RefObject<HTMLDivElement | null>;
  statusRef: React.RefObject<HTMLSpanElement | null>;
  valueRefs: React.MutableRefObject<Array<HTMLSpanElement | null>>;
  fillRefs: React.MutableRefObject<Array<HTMLSpanElement | null>>;
  activationCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  bridge: AgentCore3DBridge;
  legacyGazeOwnership: AgentCoreLegacyGazeOwnership;
  onPhaseChange: (phase: AgentCoreInstallPhase) => void;
};

type InteractionBridge = {
  install: () => void;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLButtonElement>;
};

type SocketTarget = {
  x: number;
  y: number;
  scale: number;
  centerX: number;
  centerY: number;
};

const noop = () => undefined;

function emptyInteractionBridge(): InteractionBridge {
  return {
    install: noop,
    onClick: noop,
    onKeyDown: noop,
  };
}

function numericGsapProperty(element: Element, property: string): number {
  const value = Number(gsap.getProperty(element, property));
  return Number.isFinite(value) ? value : 0;
}

function rectShape(rect: DOMRect) {
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
}

function measureSocketTarget(core: HTMLButtonElement, socket: HTMLDivElement): SocketTarget {
  const coreBounds = core.getBoundingClientRect();
  const socketBounds = socket.getBoundingClientRect();
  const currentX = numericGsapProperty(core, "x");
  const currentY = numericGsapProperty(core, "y");
  const currentScale = numericGsapProperty(core, "scale") || 1;
  const centerX = socketBounds.left + socketBounds.width / 2;
  const centerY = socketBounds.top + socketBounds.height / 2;
  const scaleRatio = Math.min(
    socketBounds.width / coreBounds.width,
    socketBounds.height / coreBounds.height,
  );

  return {
    x: currentX + centerX - (coreBounds.left + coreBounds.width / 2),
    y: currentY + centerY - (coreBounds.top + coreBounds.height / 2),
    scale: currentScale * scaleRatio * 0.82,
    centerX,
    centerY,
  };
}

function narrativeGaze(phase: AgentCoreInstallPhase): GazeMode {
  if (phase === "awaiting" || phase === "connected") return "user";
  if (phase === "targeting" || phase === "reaching" || phase === "grasping" || phase === "carrying") {
    return "core";
  }
  if (phase === "docking" || phase === "activating" || phase === "returning") return "socket";
  return "neutral";
}

export function useAgentCoreTimeline({
  sectionRef,
  sceneRef,
  headRef,
  coreRef,
  socketRef,
  statusRef,
  valueRefs,
  fillRefs,
  legacyGazeOwnership,
  activationCanvasRef,
  bridge,
  onPhaseChange,
}: UseAgentCoreTimelineOptions): InteractionBridge {
  const stateRef = useRef<AgentCoreInstallState>(initialInstallState());
  const bridgeRef = useRef<InteractionBridge>(emptyInteractionBridge());

  useGSAP(
    (_, contextSafe) => {
      const section = sectionRef.current;
      const scene = sceneRef.current;
      const head = headRef.current;
      const core = coreRef.current;
      const socket = socketRef.current;
      const canvas = activationCanvasRef.current;

      if (!section || !scene || !head || !core || !socket || !canvas || !contextSafe) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const finePointer = window.matchMedia("(any-pointer: fine)");
      let sceneBounds = scene.getBoundingClientRect();
      let canvasFrame: number | null = null;
      let sectionIsVisible = false;
      let installationTimeline: gsap.core.Timeline | null = null;
      let installHeadFocus: AgentCoreLegacyHeadTarget | null = null;

      const clearCanvas = () => {
        const canvasContext = canvas.getContext("2d");
        canvasContext?.clearRect(0, 0, canvas.width, canvas.height);
      };

      const cancelCanvasBurst = () => {
        if (canvasFrame !== null) {
          cancelAnimationFrame(canvasFrame);
          canvasFrame = null;
        }
        clearCanvas();
      };

      const startParticleBurst = () => {
        cancelCanvasBurst();
        const canvasContext = canvas.getContext("2d");
        if (!canvasContext) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const particles = Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
          angle: (Math.PI * 2 * index) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.18,
          radius: 34 + Math.random() * 38,
          outwardRadius: 12 + Math.random() * 22,
          size: 2 + Math.random() * 3,
        }));
        const startedAt = performance.now();

        const drawFrame = (timestamp: number) => {
          const progress = Math.min(1, (timestamp - startedAt) / BURST_DURATION_MS);
          canvasContext.clearRect(0, 0, canvas.width, canvas.height);
          canvasContext.fillStyle = "#6b7d3a";

          for (const particle of particles) {
            const inwardProgress = Math.min(1, progress / 0.62);
            const outwardProgress = Math.max(0, (progress - 0.62) / 0.38);
            const radius = progress < 0.62
              ? particle.radius * (1 - inwardProgress)
              : particle.outwardRadius * outwardProgress;
            const x = centerX + Math.cos(particle.angle) * radius;
            const y = centerY + Math.sin(particle.angle) * radius;
            canvasContext.globalAlpha = progress < 0.62 ? 0.82 : 0.82 * (1 - outwardProgress);
            canvasContext.fillRect(
              Math.round(x - particle.size / 2),
              Math.round(y - particle.size / 2),
              particle.size,
              particle.size,
            );
          }

          canvasContext.globalAlpha = 1;
          if (progress >= 1) {
            canvasContext.clearRect(0, 0, canvas.width, canvas.height);
            canvasFrame = null;
            return;
          }
          canvasFrame = requestAnimationFrame(drawFrame);
        };

        canvasFrame = requestAnimationFrame(drawFrame);
      };

      const setFinalTelemetry = () => {
        if (statusRef.current) statusRef.current.textContent = "Connected";
        stats.forEach((stat, rowIndex) => {
          const valueNode = valueRefs.current[rowIndex];
          if (valueNode) valueNode.textContent = formatAgentCoreValue(stat.value);
          for (let cellIndex = 0; cellIndex < stat.value; cellIndex += 1) {
            const cell = fillRefs.current[rowIndex * TELEMETRY_CELL_COUNT + cellIndex];
            if (!cell) continue;
            cell.classList.add(styles.telemetryCellConnected);
            gsap.set(cell, { opacity: 1, scaleX: 1 });
          }
        });
      };

      const placeFallbackCoreAtSocket = () => {
        const target = measureSocketTarget(core, socket);
        gsap.set(core, { x: target.x, y: target.y, scale: target.scale, rotation: 0 });
      };

      const commitState = (nextState: AgentCoreInstallState) => {
        if (nextState === stateRef.current) return;
        stateRef.current = nextState;
        bridge.pointer.active = false;
        bridge.phase = nextState.phase;
        bridge.coreOwner = nextState.coreOwner;
        bridge.gazeMode = narrativeGaze(nextState.phase);
        onPhaseChange(nextState.phase);
        bridge.invalidate?.();
      };

      const transition = (event: AgentCoreInstallEvent) => {
        commitState(nextInstallState(stateRef.current, event));
      };

      const pivot = assetManifest.assets.head.localAnchors.headPivot;
      const headTransformOrigin = `${(pivot.x / assetManifest.assets.head.width) * 100}% ${(pivot.y / assetManifest.assets.head.height) * 100}%`;

      if (reducedMotion.matches) {
        const connectedState = nextInstallState(stateRef.current, "activate", {
          reducedMotion: true,
        });
        stateRef.current = connectedState;
        Object.assign(bridge, {
          phase: "connected",
          coreOwner: "socket",
          gazeMode: "user",
          progress: 1,
        });
        placeFallbackCoreAtSocket();
        setFinalTelemetry();
        onPhaseChange("connected");
        bridge.invalidate?.();
        return;
      }

      gsap.set(head, { transformOrigin: headTransformOrigin, transformPerspective: 900 });

      const refreshSceneBounds = () => {
        sceneBounds = scene.getBoundingClientRect();
      };

      const entranceTargets = section.querySelectorAll<HTMLElement>("[data-agent-core-entrance]");
      const entranceTimeline = gsap.timeline({
        paused: true,
        onComplete: refreshSceneBounds,
      }).fromTo(
        entranceTargets,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.08 },
      );
      const entranceTrigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 72%",
        once: true,
        onEnter: () => entranceTimeline.play(),
        onRefresh: refreshSceneBounds,
      });

      const observer = new IntersectionObserver(
        ([entry]) => {
          sectionIsVisible = entry?.isIntersecting ?? false;
        },
        { threshold: 0.08 },
      );
      observer.observe(section);

      const headYawTo = gsap.quickTo(head, "rotationY", {
        duration: 0.24,
        ease: "power2.out",
        overwrite: "auto",
      });
      const headPitchTo = gsap.quickTo(head, "rotationX", {
        duration: 0.24,
        ease: "power2.out",
        overwrite: "auto",
      });
      let legacyHeadTarget: AgentCoreLegacyHeadTarget = { yaw: 0, pitch: 0, duration: 0.24 };

      const writeLegacyHeadTarget = (target: AgentCoreLegacyHeadTarget) => {
        legacyHeadTarget = target;
        if (!legacyGazeOwnership.legacyEnabled) return;
        headYawTo.tween.duration(target.duration);
        headPitchTo.tween.duration(target.duration);
        headYawTo(target.yaw);
        headPitchTo(target.pitch);
        headYawTo.tween.play();
        headPitchTo.tween.play();
      };

      const detachLegacyGazeRuntime = legacyGazeOwnership.attach({
        suspend: () => {
          headYawTo.tween.pause();
          headPitchTo.tween.pause();
        },
        reconcile: () => {
          if (stateRef.current.started && stateRef.current.phase !== "connected" && installationTimeline && installHeadFocus) {
            legacyHeadTarget = resolveAgentCoreLegacyInstallGaze(
              installationTimeline.time(),
              installationTimeline.labels.activating ?? Number.POSITIVE_INFINITY,
              installHeadFocus,
            );
          }
          writeLegacyHeadTarget(legacyHeadTarget);
        },
      });

      const pointHeadAt = (x: number, y: number, amplitude = 1) => {
        if (!legacyGazeOwnership.legacyEnabled) return;
        const rotation = clampHeadRotation({ x, y }, rectShape(sceneBounds));
        writeLegacyHeadTarget({
          yaw: rotation.yaw * amplitude,
          pitch: rotation.pitch * amplitude,
          duration: 0.24,
        });
      };

      const onScenePointerMove = contextSafe((event: PointerEvent) => {
        const isFinePointerEvent =
          event.isPrimary && (event.pointerType === "mouse" || event.pointerType === "pen");
        const phase = stateRef.current.phase;
        if (
          !sectionIsVisible ||
          !finePointer.matches ||
          !isFinePointerEvent ||
          (phase !== "awaiting" && phase !== "connected")
        ) return;
        pointHeadAt(event.clientX, event.clientY, phase === "connected" ? 0.6 : 1);
      });

      const onScenePointerLeave = contextSafe(() => {
        const phase = stateRef.current.phase;
        if (phase !== "awaiting" && phase !== "connected") return;
        writeLegacyHeadTarget({
          yaw: 0,
          pitch: phase === "connected" ? -2 : 0,
          duration: 0.24,
        });
      });

      section.addEventListener("pointermove", onScenePointerMove);
      section.addEventListener("pointerleave", onScenePointerLeave);
      window.addEventListener("resize", refreshSceneBounds, { passive: true });

      const install = contextSafe(() => {
        if (stateRef.current.started) return;
        transition("activate");

        const coreBounds = core.getBoundingClientRect();
        const coreCenter = {
          x: coreBounds.left + coreBounds.width / 2,
          y: coreBounds.top + coreBounds.height / 2,
        };
        const target = measureSocketTarget(core, socket);
        installHeadFocus = {
          ...clampHeadRotation(coreCenter, rectShape(sceneBounds)),
          duration: 0.22,
        };

        installationTimeline = gsap.timeline({
          paused: true,
          defaults: { ease: "none" },
          onComplete: () => {
            installHeadFocus = null;
          },
        });

        installationTimeline
          .to(
            bridge,
            {
              progress: 1,
              duration: INSTALL_DURATION_SECONDS,
              ease: "none",
              onUpdate: () => bridge.invalidate?.(),
            },
            0,
          )
          .addLabel("targeting", 0)
          .call(() => {
            if (installHeadFocus) writeLegacyHeadTarget(installHeadFocus);
          }, [], "targeting")
          .addLabel("reaching", 0.18)
          .call(() => transition("targeted"), [], "reaching")
          .addLabel("grasping", 0.78)
          .call(() => transition("reached"), [], "grasping")
          .addLabel("carrying", 1)
          .call(() => transition("grasped"), [], "carrying")
          .addLabel("docking", 1.68)
          .call(() => {
            transition("carried");
            installHeadFocus = {
              ...clampHeadRotation(
                { x: target.centerX, y: target.centerY },
                rectShape(sceneBounds),
              ),
              duration: 0.22,
            };
            if (installHeadFocus) writeLegacyHeadTarget(installHeadFocus);
          }, [], "docking")
          .addLabel("activating", 2)
          .call(() => {
            transition("docked");
            placeFallbackCoreAtSocket();
            startParticleBurst();
            if (statusRef.current) statusRef.current.textContent = "Connected";
          }, [], "activating")
          .addLabel("capabilities", 2.15);

        stats.forEach((stat, rowIndex) => {
          const counter = { value: 0 };
          const rowStart = `capabilities+=${rowIndex * 0.07}`;
          installationTimeline?.to(
            counter,
            {
              value: stat.value,
              duration: 0.48,
              ease: "power2.out",
              onUpdate: () => {
                const valueNode = valueRefs.current[rowIndex];
                if (valueNode) valueNode.textContent = formatAgentCoreValue(Math.round(counter.value));
              },
            },
            rowStart,
          );

          for (let cellIndex = 0; cellIndex < stat.value; cellIndex += 1) {
            const cell = fillRefs.current[rowIndex * TELEMETRY_CELL_COUNT + cellIndex];
            if (!cell) continue;
            installationTimeline?.fromTo(
              cell,
              { opacity: 0.35, scaleX: 0.2, transformOrigin: "left center" },
              {
                opacity: 1,
                scaleX: 1,
                duration: 0.28,
                ease: "power2.out",
                onStart: () => cell.classList.add(styles.telemetryCellConnected),
              },
              `capabilities+=${rowIndex * 0.07 + cellIndex * 0.035}`,
            );
          }
        });

        installationTimeline
          .addLabel("returning", 2.35)
          .call(() => transition("activated"), [], "returning")
          .addLabel("hold", INSTALL_DURATION_SECONDS)
          .call(() => {
            commitAgentCoreRestPoseBeforeConnected(
              bridge,
              () => transition("returned"),
            );
            setFinalTelemetry();
            writeLegacyHeadTarget({ yaw: 0, pitch: -2, duration: 0.34 });
          }, [], "hold")
          .play(0);
      });

      const onClick = contextSafe(() => install());
      const onKeyDown = contextSafe((event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        install();
      });

      bridgeRef.current = {
        install,
        onClick,
        onKeyDown,
      };

      return () => {
        bridgeRef.current = emptyInteractionBridge();
        section.removeEventListener("pointermove", onScenePointerMove);
        section.removeEventListener("pointerleave", onScenePointerLeave);
        window.removeEventListener("resize", refreshSceneBounds);
        observer.disconnect();
        entranceTrigger.kill();
        entranceTimeline.kill();
        installationTimeline?.kill();
        detachLegacyGazeRuntime();
        headYawTo.tween.kill();
        headPitchTo.tween.kill();
        cancelCanvasBurst();
      };
    },
    { scope: sectionRef },
  );

  return {
    install: () => bridgeRef.current.install(),
    onClick: (event) => bridgeRef.current.onClick(event),
    onKeyDown: (event) => bridgeRef.current.onKeyDown(event),
  };
}
