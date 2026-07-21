import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import type React from "react";

import assetManifest from "../../../../public/visuals/agent-core/asset-manifest.json";
import {
  mapAgentCorePointerDeltaToWorld,
  type AgentCore3DBridge,
} from "./agent-core-3d-state";
import { formatAgentCoreValue, getAgentCoreStats } from "./agent-core-stats";
import {
  beginAgentCorePointerSession,
  clampHeadRotation,
  finishAgentCorePointerSession,
  isCoreDropAccepted,
  nextAgentCorePhase,
  type AgentCoreEvent,
  type AgentCorePhase,
  type AgentCorePointerSession,
} from "./agent-core-state";
import styles from "./agent-core.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const stats = getAgentCoreStats();
const TELEMETRY_CELL_COUNT = 12;
const PARTICLE_COUNT = 40;
const BURST_DURATION_MS = 900;
const DRAG_THRESHOLD_PX = 5;

type UseAgentCoreTimelineOptions = {
  bridge: AgentCore3DBridge;
  sectionRef: React.RefObject<HTMLElement | null>;
  sceneRef: React.RefObject<HTMLDivElement | null>;
  headRef: React.RefObject<HTMLDivElement | null>;
  coreRef: React.RefObject<HTMLButtonElement | null>;
  socketRef: React.RefObject<HTMLDivElement | null>;
  dockRef: React.RefObject<HTMLDivElement | null>;
  statusRef: React.RefObject<HTMLSpanElement | null>;
  valueRefs: React.MutableRefObject<Array<HTMLSpanElement | null>>;
  fillRefs: React.MutableRefObject<Array<HTMLSpanElement | null>>;
  activationCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  onPhaseChange: (phase: AgentCorePhase) => void;
};

type CorePointerEvent = React.PointerEvent<HTMLButtonElement>;

type InteractionBridge = {
  install: () => void;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLButtonElement>;
  onLostPointerCapture: React.PointerEventHandler<HTMLButtonElement>;
  onPointerCancel: React.PointerEventHandler<HTMLButtonElement>;
  onPointerDown: React.PointerEventHandler<HTMLButtonElement>;
  onPointerMove: React.PointerEventHandler<HTMLButtonElement>;
  onPointerUp: React.PointerEventHandler<HTMLButtonElement>;
};

type DragSession = AgentCorePointerSession & {
  pointerX: number;
  pointerY: number;
  coreCenterX: number;
  coreCenterY: number;
  coreX: number;
  coreY: number;
  dockX: number;
  dockY: number;
  moved: boolean;
};

type SocketTarget = {
  x: number;
  y: number;
  scale: number;
  currentScale: number;
  centerX: number;
  centerY: number;
};

const noop = () => undefined;

function numericGsapProperty(element: Element, property: string): number {
  const value = Number(gsap.getProperty(element, property));
  return Number.isFinite(value) ? value : 0;
}

function rectShape(rect: DOMRect) {
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
}

function clampNormalized(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

function measureSocketTarget(
  core: HTMLButtonElement,
  socket: HTMLDivElement,
): SocketTarget {
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
    scale: currentScale * scaleRatio,
    currentScale,
    centerX,
    centerY,
  };
}

function measureDockTarget(
  core: HTMLButtonElement,
  dock: HTMLDivElement,
): Pick<DragSession, "coreCenterX" | "coreCenterY" | "coreX" | "coreY" | "dockX" | "dockY"> {
  const coreBounds = core.getBoundingClientRect();
  const dockBounds = dock.getBoundingClientRect();
  const coreX = numericGsapProperty(core, "x");
  const coreY = numericGsapProperty(core, "y");
  const coreCenterX = coreBounds.left + coreBounds.width / 2;
  const coreCenterY = coreBounds.top + coreBounds.height / 2;
  const dockCenterX = dockBounds.left + dockBounds.width / 2;
  const dockCenterY = dockBounds.top + dockBounds.height / 2;

  return {
    coreCenterX,
    coreCenterY,
    coreX,
    coreY,
    dockX: coreX + dockCenterX - coreCenterX,
    dockY: coreY + dockCenterY - coreCenterY,
  };
}

export function useAgentCoreTimeline({
  bridge,
  sectionRef,
  sceneRef,
  headRef,
  coreRef,
  socketRef,
  dockRef,
  statusRef,
  valueRefs,
  fillRefs,
  activationCanvasRef,
  onPhaseChange,
}: UseAgentCoreTimelineOptions): InteractionBridge {
  const phaseRef = useRef<AgentCorePhase>("awaiting");
  const bridgeRef = useRef<InteractionBridge>({
    install: noop,
    onClick: noop,
    onKeyDown: noop,
    onLostPointerCapture: noop,
    onPointerCancel: noop,
    onPointerDown: noop,
    onPointerMove: noop,
    onPointerUp: noop,
  });

  useGSAP(
    (_, contextSafe) => {
      const section = sectionRef.current;
      const scene = sceneRef.current;
      const head = headRef.current;
      const core = coreRef.current;
      const socket = socketRef.current;
      const dock = dockRef.current;
      const canvas = activationCanvasRef.current;
      const fallbackCore = scene?.querySelector<HTMLElement>("[data-agent-core-fallback-core]");

      if (!section || !scene || !head || !core || !socket || !dock || !canvas || !contextSafe) {
        return;
      }

      const coreVisualTargets: HTMLElement[] = fallbackCore ? [core, fallbackCore] : [core];

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const finePointer = window.matchMedia("(any-pointer: fine)");
      let sceneBounds = scene.getBoundingClientRect();
      let canvasFrame: number | null = null;
      let drag: DragSession | null = null;
      let suppressNextClick = false;
      let isReturning = false;
      let sectionIsVisible = false;
      let installationTimeline: gsap.core.Timeline | null = null;

      const invalidateBridge = () => {
        bridge.invalidate?.();
      };

      const resetBridge = () => {
        bridge.pointerTarget.x = 0;
        bridge.pointerTarget.y = 0;
        bridge.pointerCurrent.yaw = 0;
        bridge.pointerCurrent.pitch = 0;
        bridge.installProgress = 0;
        bridge.connected = false;
        bridge.dragOffset.x = 0;
        bridge.dragOffset.y = 0;
        bridge.dragOffset.z = 0;
        invalidateBridge();
      };

      const setBridgeConnected = () => {
        bridge.pointerTarget.x = 0;
        bridge.pointerTarget.y = 0;
        bridge.pointerCurrent.yaw = 0;
        bridge.pointerCurrent.pitch = 0;
        bridge.installProgress = 1;
        bridge.connected = true;
        bridge.dragOffset.x = 0;
        bridge.dragOffset.y = 0;
        bridge.dragOffset.z = 0;
        invalidateBridge();
      };

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
            const radius =
              progress < 0.62
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
            if (canvasFrame !== null) cancelAnimationFrame(canvasFrame);
            canvasFrame = null;
            return;
          }
          canvasFrame = requestAnimationFrame(drawFrame);
        };

        canvasFrame = requestAnimationFrame(drawFrame);
      };

      const setPhase = (event: AgentCoreEvent) => {
        const nextPhase = nextAgentCorePhase(phaseRef.current, event);
        if (nextPhase === phaseRef.current) return;
        phaseRef.current = nextPhase;
        onPhaseChange(nextPhase);
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

      const pivot = assetManifest.assets.head.localAnchors.headPivot;
      const headTransformOrigin = `${(pivot.x / assetManifest.assets.head.width) * 100}% ${(pivot.y / assetManifest.assets.head.height) * 100}%`;

      if (reducedMotion.matches) {
        const target = measureSocketTarget(core, socket);
        gsap.set(head, { rotationX: -2, rotationY: 0, transformOrigin: headTransformOrigin });
        gsap.set(coreVisualTargets, { x: target.x, y: target.y, scale: target.scale, rotation: 0 });
        setBridgeConnected();
        setFinalTelemetry();
        phaseRef.current = "connected";
        onPhaseChange("connected");
        return () => {
          resetBridge();
          clearCanvas();
          return;
        };
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
      const setCoreX = gsap.quickSetter(core, "x", "px");
      const setCoreY = gsap.quickSetter(core, "y", "px");
      const setFallbackCoreX = fallbackCore
        ? gsap.quickSetter(fallbackCore, "x", "px")
        : noop;
      const setFallbackCoreY = fallbackCore
        ? gsap.quickSetter(fallbackCore, "y", "px")
        : noop;

      const setPointerTarget = (x: number, y: number, amplitude = 1) => {
        const normalizedX =
          clampNormalized(((x - sceneBounds.left) / sceneBounds.width) * 2 - 1) * amplitude;
        const normalizedY =
          clampNormalized(((y - sceneBounds.top) / sceneBounds.height) * 2 - 1) * amplitude;
        bridge.pointerTarget.x = normalizedX;
        bridge.pointerTarget.y = normalizedY;
        invalidateBridge();
      };

      const pointHeadAt = (x: number, y: number, amplitude = 1) => {
        const rotation = clampHeadRotation({ x, y }, rectShape(sceneBounds));
        headYawTo(rotation.yaw * amplitude);
        headPitchTo(rotation.pitch * amplitude);
        setPointerTarget(x, y, amplitude);
      };

      const onScenePointerMove = contextSafe((event: PointerEvent) => {
        const isFinePointerEvent =
          event.isPrimary && (event.pointerType === "mouse" || event.pointerType === "pen");
        if (
          !sectionIsVisible ||
          !finePointer.matches ||
          !isFinePointerEvent ||
          phaseRef.current === "dragging" ||
          phaseRef.current === "installing"
        ) return;
        pointHeadAt(event.clientX, event.clientY, phaseRef.current === "connected" ? 0.55 : 1);
      });

      const onScenePointerLeave = contextSafe(() => {
        if (phaseRef.current === "dragging" || phaseRef.current === "installing") return;
        headYawTo(0);
        headPitchTo(phaseRef.current === "connected" ? -2 : 0);
        bridge.pointerTarget.x = 0;
        bridge.pointerTarget.y = 0;
        invalidateBridge();
      });

      section.addEventListener("pointermove", onScenePointerMove);
      section.addEventListener("pointerleave", onScenePointerLeave);
      window.addEventListener("resize", refreshSceneBounds, { passive: true });

      const install = contextSafe(() => {
        if (
          isReturning ||
          phaseRef.current !== "awaiting" &&
          phaseRef.current !== "dragging"
        ) return;

        const target = measureSocketTarget(core, socket);
        const targetRotation = clampHeadRotation(
          { x: target.centerX, y: target.centerY },
          rectShape(sceneBounds),
        );

        if (phaseRef.current === "awaiting") setPhase("drag-start");
        setPhase("drop-accepted");
        bridge.connected = false;
        invalidateBridge();

        installationTimeline = gsap.timeline({
          paused: true,
          defaults: { ease: "power2.out" },
          onComplete: () => {
            setBridgeConnected();
            setFinalTelemetry();
            setPhase("install-complete");
          },
        });

        installationTimeline
          .addLabel("scene-in", 0)
          .addLabel("pickup", 0)
          .to(
            bridge,
            {
              installProgress: 1,
              duration: 0.68,
              ease: "power3.inOut",
              onUpdate: invalidateBridge,
            },
            "pickup",
          )
          .to(
            bridge.dragOffset,
            {
              x: 0,
              y: 0,
              z: 0,
              duration: 0.32,
              ease: "power2.inOut",
              onUpdate: invalidateBridge,
            },
            "pickup",
          )
          .to(
            coreVisualTargets,
            {
              y: target.y - 20,
              scale: Math.max(target.currentScale, target.scale * 1.08),
              rotation: -2,
              duration: 0.22,
            },
            "pickup",
          )
          .to(
            head,
            {
              rotationY: targetRotation.yaw,
              rotationX: targetRotation.pitch,
              duration: 0.22,
            },
            "pickup",
          )
          .addLabel("dock", ">")
          .to(
            coreVisualTargets,
            {
              x: target.x,
              y: target.y,
              scale: target.scale,
              rotation: 0,
              duration: 0.46,
              ease: "power3.inOut",
            },
            "dock",
          )
          .addLabel("activate", ">")
          .call(startParticleBurst, [], "activate")
          .to(
            coreVisualTargets,
            { scale: target.scale * 0.92, duration: 0.14, ease: "power2.in" },
            "activate",
          )
          .to(
            coreVisualTargets,
            { scale: target.scale, duration: 0.2, ease: "back.out(1.35)" },
            ">",
          )
          .to(head, { rotationX: -2, rotationY: 0, duration: 0.34 }, "activate")
          .call(() => {
            if (statusRef.current) statusRef.current.textContent = "Connected";
          }, [], "activate+=0.1")
          .addLabel("capabilities", "activate+=0.18");

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
                if (valueNode) {
                  valueNode.textContent = formatAgentCoreValue(Math.round(counter.value));
                }
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
          .addLabel("hold", "capabilities+=0.82")
          .to(coreVisualTargets, { scale: target.scale, duration: 0.2 }, "hold")
          .play(0);
      });

      const onPointerDown = contextSafe((event: CorePointerEvent) => {
        if (phaseRef.current !== "awaiting") return;
        const start = beginAgentCorePointerSession(drag, {
          pointerId: event.pointerId,
          pointerType: event.pointerType,
          isPrimary: event.isPrimary,
          button: event.button,
        });
        if (start.action === "ignore" || !start.session) return;

        suppressNextClick = false;
        if (start.action === "capture-touch") {
          drag = {
            ...start.session,
            pointerX: event.clientX,
            pointerY: event.clientY,
            coreCenterX: 0,
            coreCenterY: 0,
            coreX: 0,
            coreY: 0,
            dockX: 0,
            dockY: 0,
            moved: false,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
          return;
        }

        const measuredDock = measureDockTarget(core, dock);
        drag = {
          ...start.session,
          pointerX: event.clientX,
          pointerY: event.clientY,
          ...measuredDock,
          moved: false,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
        setPhase("drag-start");
      });

      const onPointerMove = contextSafe((event: CorePointerEvent) => {
        if (!drag || event.pointerId !== drag.pointerId || drag.kind !== "drag") return;
        const deltaX = event.clientX - drag.pointerX;
        const deltaY = event.clientY - drag.pointerY;
        if (Math.hypot(deltaX, deltaY) >= DRAG_THRESHOLD_PX) drag.moved = true;
        setCoreX(drag.coreX + deltaX);
        setCoreY(drag.coreY + deltaY);
        setFallbackCoreX(drag.coreX + deltaX);
        setFallbackCoreY(drag.coreY + deltaY);
        const worldDelta = mapAgentCorePointerDeltaToWorld(
          { x: deltaX, y: deltaY },
          sceneBounds.width,
        );
        bridge.dragOffset.x = worldDelta.x;
        bridge.dragOffset.y = worldDelta.y;
        bridge.dragOffset.z = Math.min(0.28, Math.hypot(worldDelta.x, worldDelta.y) * 0.09);
        invalidateBridge();
        pointHeadAt(drag.coreCenterX + deltaX, drag.coreCenterY + deltaY);
      });

      const rejectDrop = (session: DragSession) => {
        const { dockX, dockY } = session;
        isReturning = true;
        gsap.to(coreVisualTargets, {
          x: dockX,
          y: dockY,
          scale: 1,
          rotation: 0,
          duration: 0.46,
          ease: "back.out(1.35)",
          overwrite: true,
          onComplete: () => {
            isReturning = false;
            setPhase("drop-rejected");
          },
        });
        gsap.to(bridge.dragOffset, {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.46,
          ease: "back.out(1.35)",
          overwrite: true,
          onUpdate: invalidateBridge,
        });
        headYawTo(0);
        headPitchTo(0);
        bridge.pointerTarget.x = 0;
        bridge.pointerTarget.y = 0;
        invalidateBridge();
      };

      const finalizePointerSession = contextSafe((
        event: CorePointerEvent,
        reason: "up" | "cancel" | "lost-capture",
      ) => {
        const session = drag;
        if (!session) return;

        let dropAccepted = false;
        if (reason === "up" && session.kind === "drag" && session.moved) {
          const coreBounds = core.getBoundingClientRect();
          const socketBounds = socket.getBoundingClientRect();
          dropAccepted = isCoreDropAccepted(
            {
              x: coreBounds.left + coreBounds.width / 2,
              y: coreBounds.top + coreBounds.height / 2,
            },
            rectShape(socketBounds),
          );
        }

        const finished = finishAgentCorePointerSession(session, {
          pointerId: event.pointerId,
          reason,
          moved: session.moved,
          dropAccepted,
        });
        if (finished.action === "ignore") return;

        drag = null;
        suppressNextClick = true;
        if (reason !== "lost-capture" && core.hasPointerCapture(session.pointerId)) {
          core.releasePointerCapture(session.pointerId);
        }

        if (finished.action === "install") install();
        else if (finished.action === "return-dock") rejectDrop(session);
      });

      const onPointerUp = contextSafe((event: CorePointerEvent) => {
        finalizePointerSession(event, "up");
      });

      const onPointerCancel = contextSafe((event: CorePointerEvent) => {
        finalizePointerSession(event, "cancel");
      });

      const onLostPointerCapture = contextSafe((event: CorePointerEvent) => {
        finalizePointerSession(event, "lost-capture");
      });

      const onClick = contextSafe(() => {
        if (suppressNextClick) {
          suppressNextClick = false;
          return;
        }
        install();
      });

      const onKeyDown = contextSafe((event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        install();
      });

      bridgeRef.current = {
        install,
        onClick,
        onKeyDown,
        onLostPointerCapture,
        onPointerCancel,
        onPointerDown,
        onPointerMove,
        onPointerUp,
      };

      return () => {
        bridgeRef.current = {
          install: noop,
          onClick: noop,
          onKeyDown: noop,
          onLostPointerCapture: noop,
          onPointerCancel: noop,
          onPointerDown: noop,
          onPointerMove: noop,
          onPointerUp: noop,
        };
        section.removeEventListener("pointermove", onScenePointerMove);
        section.removeEventListener("pointerleave", onScenePointerLeave);
        window.removeEventListener("resize", refreshSceneBounds);
        observer.disconnect();
        entranceTrigger.kill();
        entranceTimeline.kill();
        installationTimeline?.kill();
        headYawTo.tween.kill();
        headPitchTo.tween.kill();
        if (drag && core.hasPointerCapture(drag.pointerId)) {
          core.releasePointerCapture(drag.pointerId);
        }
        drag = null;
        cancelCanvasBurst();
        resetBridge();
      };
    },
    { scope: sectionRef },
  );

  return {
    install: () => bridgeRef.current.install(),
    onClick: (event) => bridgeRef.current.onClick(event),
    onKeyDown: (event) => bridgeRef.current.onKeyDown(event),
    onLostPointerCapture: (event) => bridgeRef.current.onLostPointerCapture(event),
    onPointerCancel: (event) => bridgeRef.current.onPointerCancel(event),
    onPointerDown: (event) => bridgeRef.current.onPointerDown(event),
    onPointerMove: (event) => bridgeRef.current.onPointerMove(event),
    onPointerUp: (event) => bridgeRef.current.onPointerUp(event),
  };
}
