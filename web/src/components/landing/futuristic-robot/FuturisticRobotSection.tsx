"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { LazyEquipAgent } from "@/components/landing/LazyEquipAgent";
import { FadeIn } from "@/components/ui/FadeIn";
import { ScrambleText } from "@/components/ui/ScrambleText";
import {
  agentCoreCapabilityGroups,
  agentCoreCapabilityPresentation,
  pricingGenerationGroups,
} from "@/lib/capability-inventory";

import styles from "./futuristic-robot.module.css";

const INSTALL_VIDEO_URL =
  "/visuals/futuristic-robot/futuristic-agent-reactor-stable-install-v3.mp4";
const UNINSTALL_VIDEO_URL =
  "/visuals/futuristic-robot/futuristic-agent-reactor-stable-uninstall-v3.mp4";
const POSTER_URL =
  "/visuals/futuristic-robot/futuristic-agent-stable-idle-poster-v2.png";
const CRISP_FINAL_FRAME_URL =
  "/visuals/futuristic-robot/futuristic-agent-reactor-latch-crisp-final.png";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const REACTOR_MOTION_SECONDS = 6.666667;
const REACTOR_LATCH_SECONDS = 4.85;
const CAPABILITY_LOAD_SECONDS = 1.45;
const CAPABILITY_UNLOAD_START_SECONDS = 1.9;
const CAPABILITY_UNLOAD_SECONDS = 1.35;
const HERO_AUTOPLAY_DELAY_MS = 900;
const HERO_EXPLICIT_INTERACTION_GRACE_MS = 1800;
const GENERATION_MODEL_TOTAL = pricingGenerationGroups.reduce(
  (total, group) => total + group.models.length,
  0,
);
const GENERATION_MODE_TOTAL = pricingGenerationGroups.reduce(
  (total, group) =>
    total +
    group.models.reduce((modeTotal, model) => modeTotal + model.modes.length, 0),
  0,
);
const CAPABILITY_METRICS = agentCoreCapabilityGroups.map((group) => ({
  id: group.id,
  label: `${group.id.charAt(0).toUpperCase()}${group.id.slice(1)}`,
  href: agentCoreCapabilityPresentation[group.id].href,
  summary: agentCoreCapabilityPresentation[group.id].summary,
  unit:
    group.id === "create"
      ? "creation modes"
      : group.id === "understand"
        ? "media readers"
        : group.id === "search"
          ? "retrieval routes"
          : group.id === "manage"
            ? "Drive runtime"
            : "Page runtime",
  routes:
    group.id === "create" ? GENERATION_MODE_TOTAL : group.capabilities.length,
}));
const CAPABILITY_TOTAL = CAPABILITY_METRICS.reduce(
  (total, metric) => total + metric.routes,
  0,
);
const FEATURED_MODEL_BRANDS = [
  {
    name: "Seedance",
    icon: "/visuals/model-brands/seedance.png",
    revealAt: 0.18,
  },
  {
    name: "Kling",
    icon: "/visuals/model-brands/kling.png",
    revealAt: 0.34,
  },
  {
    name: "Suno",
    icon: "/visuals/model-brands/suno.png",
    revealAt: 0.5,
  },
  {
    name: "Gemini Omni",
    icon: "/visuals/model-brands/gemini.png",
    revealAt: 0.68,
  },
  {
    name: "GPT Image 2",
    icon: "/visuals/model-brands/openai.png",
    revealAt: 0.84,
  },
] as const;
type VideoLayer = "install" | "uninstall";
type FuturisticRobotSectionProps = {
  placement?: "hero" | "section";
};

function getMotionProgress(video: HTMLVideoElement) {
  return Math.min(video.currentTime, REACTOR_MOTION_SECONDS) / REACTOR_MOTION_SECONDS;
}

function getCapabilityLoadProgress(video: HTMLVideoElement) {
  return Math.min(
    1,
    Math.max(
      0,
      (video.currentTime - REACTOR_LATCH_SECONDS) / CAPABILITY_LOAD_SECONDS,
    ),
  );
}

function getCapabilityUnloadProgress(video: HTMLVideoElement) {
  return (
    1 -
    Math.min(
      1,
      Math.max(
        0,
        (video.currentTime - CAPABILITY_UNLOAD_START_SECONDS) /
          CAPABILITY_UNLOAD_SECONDS,
      ),
    )
  );
}

export function FuturisticRobotSection({
  placement = "section",
}: FuturisticRobotSectionProps) {
  const isHero = placement === "hero";
  const sectionRef = useRef<HTMLElement | null>(null);
  const installVideoRef = useRef<HTMLVideoElement | null>(null);
  const uninstallVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeLayerRef = useRef<VideoLayer>("install");
  const heroAutoplayStartedRef = useRef(false);
  const equippedRef = useRef(false);
  const explicitInteractionAtRef = useRef(Number.NEGATIVE_INFINITY);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [activeLayer, setActiveLayer] = useState<VideoLayer>("install");
  const [equipped, setEquipped] = useState(false);
  const [coreOnline, setCoreOnline] = useState(false);
  const [capabilityLoadProgress, setCapabilityLoadProgress] = useState(0);
  const activeCapabilityCount = coreOnline
    ? CAPABILITY_TOTAL
    : Math.floor(capabilityLoadProgress * CAPABILITY_TOTAL);

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const updatePreference = () => setReduceMotion(media.matches);
    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "320px 0px", threshold: 0.01 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const showLayer = useCallback((layer: VideoLayer) => {
    activeLayerRef.current = layer;
    setActiveLayer(layer);
  }, []);

  const commitEquipped = useCallback((nextEquipped: boolean) => {
    equippedRef.current = nextEquipped;
    setEquipped(nextEquipped);
  }, []);

  const playVideo = useCallback((video: HTMLVideoElement) => {
    video.playbackRate = 1;
    void video.play().catch(() => {
      // The current frame remains visible when playback is blocked.
    });
  }, []);

  const installReactor = useCallback(() => {
    const installVideo = installVideoRef.current;
    const uninstallVideo = uninstallVideoRef.current;
    if (!shouldLoad || !installVideo || !uninstallVideo) return;

    commitEquipped(true);
    uninstallVideo.pause();

    if (reduceMotion) {
      setCapabilityLoadProgress(1);
      setCoreOnline(true);
      showLayer("install");
      return;
    }

    if (activeLayerRef.current === "uninstall") {
      const progress = 1 - getMotionProgress(uninstallVideo);
      installVideo.currentTime = progress * REACTOR_MOTION_SECONDS;
    }

    const loadProgress = getCapabilityLoadProgress(installVideo);
    setCapabilityLoadProgress(loadProgress);
    setCoreOnline(loadProgress >= 1);
    showLayer("install");
    playVideo(installVideo);
  }, [commitEquipped, playVideo, reduceMotion, shouldLoad, showLayer]);

  const uninstallReactor = useCallback(() => {
    const installVideo = installVideoRef.current;
    const uninstallVideo = uninstallVideoRef.current;
    if (!shouldLoad || !installVideo || !uninstallVideo) return;

    commitEquipped(false);
    installVideo.pause();

    if (reduceMotion) {
      installVideo.currentTime = 0;
      setCapabilityLoadProgress(0);
      setCoreOnline(false);
      showLayer("install");
      return;
    }

    if (activeLayerRef.current === "install") {
      const progress = getMotionProgress(installVideo);
      uninstallVideo.currentTime = (1 - progress) * REACTOR_MOTION_SECONDS;
    }

    const unloadProgress = getCapabilityUnloadProgress(uninstallVideo);
    setCapabilityLoadProgress(unloadProgress);
    setCoreOnline(unloadProgress >= 1);
    showLayer("uninstall");
    playVideo(uninstallVideo);
  }, [commitEquipped, playVideo, reduceMotion, shouldLoad, showLayer]);

  const toggleReactorOnTouch = useCallback(() => {
    if (!window.matchMedia("(hover: none)").matches) return;
    if (equippedRef.current) {
      uninstallReactor();
    } else {
      installReactor();
    }
  }, [installReactor, uninstallReactor]);

  const toggleReactorExplicitly = useCallback(() => {
    explicitInteractionAtRef.current = performance.now();
    if (equippedRef.current) {
      uninstallReactor();
    } else {
      installReactor();
    }
  }, [installReactor, uninstallReactor]);

  useEffect(() => {
    if (
      !isHero ||
      !shouldLoad ||
      equipped ||
      heroAutoplayStartedRef.current
    ) {
      return;
    }
    const timer = window.setTimeout(() => {
      heroAutoplayStartedRef.current = true;
      installReactor();
    }, HERO_AUTOPLAY_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [equipped, installReactor, isHero, shouldLoad]);

  useEffect(() => {
    const target = sectionRef.current;
    if (!isHero || !target || !equipped) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const scrollingPastHero = entry.boundingClientRect.top < 0;
        const explicitInteractionIsRecent =
          performance.now() - explicitInteractionAtRef.current <
          HERO_EXPLICIT_INTERACTION_GRACE_MS;
        if (explicitInteractionIsRecent) return;
        if (scrollingPastHero && entry.intersectionRatio < 0.72) {
          uninstallReactor();
        }
      },
      { threshold: [0.72] },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [equipped, isHero, uninstallReactor]);

  return (
    <section
      ref={sectionRef}
      id="futuristic-agent"
      className={`${styles.section} ${isHero ? `${styles.heroSection} items-start md:items-center` : "items-start md:items-center"} relative flex overflow-hidden px-8 py-20 md:px-16 md:py-24 lg:px-24`}
    >
      <div className={styles.sectionVisual} aria-hidden="true">
        <video
          ref={installVideoRef}
          className={`${styles.video} ${
            activeLayer === "install" ? styles.videoActive : styles.videoInactive
          }`}
          muted
          playsInline
          preload={shouldLoad && !reduceMotion ? "auto" : "none"}
          poster={POSTER_URL}
          onTimeUpdate={(event) => {
            const loadProgress = getCapabilityLoadProgress(event.currentTarget);
            setCapabilityLoadProgress(loadProgress);
            if (loadProgress >= 1) setCoreOnline(true);
          }}
          onEnded={() => {
            commitEquipped(true);
            setCapabilityLoadProgress(1);
            setCoreOnline(true);
          }}
        >
          {shouldLoad ? <source src={INSTALL_VIDEO_URL} type="video/mp4" /> : null}
        </video>
        <video
          ref={uninstallVideoRef}
          className={`${styles.video} ${
            activeLayer === "uninstall" ? styles.videoActive : styles.videoInactive
          }`}
          muted
          playsInline
          preload={shouldLoad && !reduceMotion ? "metadata" : "none"}
          poster={POSTER_URL}
          onTimeUpdate={(event) => {
            const unloadProgress = getCapabilityUnloadProgress(event.currentTarget);
            setCapabilityLoadProgress(unloadProgress);
            setCoreOnline(unloadProgress >= 1);
          }}
          onEnded={() => {
            commitEquipped(false);
            setCapabilityLoadProgress(0);
            setCoreOnline(false);
            uninstallVideoRef.current?.pause();
          }}
        >
          {shouldLoad && !reduceMotion ? (
            <source src={UNINSTALL_VIDEO_URL} type="video/mp4" />
          ) : null}
        </video>
        {reduceMotion ? (
          <Image
            src={CRISP_FINAL_FRAME_URL}
            alt=""
            width={1280}
            height={720}
            priority={false}
            sizes="100vw"
            className={`${styles.crispFinalFrame} ${
              equipped ? styles.crispFinalFrameVisible : ""
            }`}
          />
        ) : null}
      </div>

      <button
        type="button"
        className={styles.interactionZone}
        aria-label={equipped ? "Remove the robot reactor" : "Install the robot reactor"}
        aria-pressed={equipped}
        onMouseEnter={isHero ? undefined : installReactor}
        onMouseLeave={isHero ? undefined : uninstallReactor}
        onFocus={isHero ? undefined : installReactor}
        onBlur={isHero ? undefined : uninstallReactor}
        onClick={isHero ? toggleReactorExplicitly : toggleReactorOnTouch}
      />

      <div className={`${isHero ? styles.heroContent : ""} relative z-10`}>
        {isHero ? (
          <FadeIn from="left" className={styles.heroCopy}>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleLine}>
                <ScrambleText
                  text="Your agent can do more."
                  speed={24}
                  ticks={2}
                />
              </span>
              <span className={styles.heroTitleLine}>
                <ScrambleText text="It just needs " speed={24} ticks={2} />
                <ScrambleText
                  text="AnyCap."
                  className="text-[#6b7d3a]"
                  speed={24}
                  ticks={2}
                />
              </span>
            </h1>
            <p className={styles.heroDescription}>
              Install AnyCap once. Your agent can create, understand, search,
              manage, and deliver.
            </p>
            <LazyEquipAgent
              label="Equip your agent"
              containerClassName={styles.heroAction}
              buttonClassName="w-full justify-center sm:w-auto"
            />
          </FadeIn>
        ) : null}

        <FadeIn
          from="left"
          className={`${styles.telemetryPanel} ${
            isHero ? styles.heroTelemetry : ""
          }`}
        >
          <div
            className={styles.telemetryInner}
            data-online={coreOnline}
            aria-label={`AnyCap capability core: ${
              coreOnline
                ? `${CAPABILITY_TOTAL} capabilities online`
                : capabilityLoadProgress > 0
                  ? `${activeCapabilityCount} of ${CAPABILITY_TOTAL} capabilities ${
                      activeLayer === "uninstall" ? "remaining" : "loading"
                    }`
                  : "offline"
            }`}
          >
            <div className={styles.telemetryHeader}>
              <span>AnyCap capability core</span>
              <span className={styles.telemetryStatus} aria-live="polite">
                <span className={styles.telemetryStatusDot} aria-hidden="true" />
                {coreOnline
                  ? isHero
                    ? "Online. Choose a capability"
                    : "Online"
                  : capabilityLoadProgress > 0
                    ? activeLayer === "uninstall"
                      ? "Unloading"
                      : "Loading"
                    : "Awaiting reactor"}
              </span>
            </div>

            <div className={styles.capabilityStage}>
              {CAPABILITY_METRICS.map((metric, metricIndex) => {
                const stagger = metricIndex * 0.055;
                const metricProgress = Math.min(
                  1,
                  Math.max(
                    0,
                    (capabilityLoadProgress - stagger) / (1 - stagger),
                  ),
                );
                const activeRoutes = coreOnline
                  ? metric.routes
                  : Math.floor(metricProgress * metric.routes);

                if (metric.id === "create") {
                  const activeModels = coreOnline
                    ? GENERATION_MODEL_TOTAL
                    : Math.floor(metricProgress * GENERATION_MODEL_TOTAL);
                  const createContent = (
                    <>
                      <span className={styles.featuredCapabilityTopline}>
                        <span>Model ecosystem</span>
                        <span>
                          {String(activeRoutes).padStart(2, "0")} creation modes
                        </span>
                      </span>
                      <span className={styles.featuredCapabilityValue}>
                        {String(activeModels).padStart(2, "0")}
                        <span>models</span>
                      </span>
                      <span className={styles.featuredCapabilityStatement}>
                        Models, APIs, and runtimes. Choose what each task uses.
                      </span>
                      <span className={styles.featuredModelBrands} aria-hidden="true">
                        {FEATURED_MODEL_BRANDS.map((brand) => (
                          <span
                            key={brand.name}
                            className={styles.featuredModelBrand}
                            data-visible={
                              coreOnline || metricProgress >= brand.revealAt
                            }
                          >
                            <Image
                              src={brand.icon}
                              alt=""
                              width={24}
                              height={24}
                              className={styles.featuredModelBrandIcon}
                            />
                            <span>{brand.name}</span>
                          </span>
                        ))}
                        <span
                          className={styles.featuredModelMore}
                          data-visible={coreOnline || metricProgress >= 0.96}
                        >
                          +
                          {Math.max(
                            0,
                            GENERATION_MODEL_TOTAL - FEATURED_MODEL_BRANDS.length,
                          )}{" "}
                          more
                        </span>
                      </span>
                    </>
                  );

                  return coreOnline && isHero ? (
                    <Link
                      key={metric.id}
                      href={metric.href}
                      className={`${styles.featuredCapability} ${styles.featuredCapabilityLink}`}
                      aria-label={`${metric.label}: ${metric.summary}`}
                    >
                      {createContent}
                    </Link>
                  ) : (
                    <div key={metric.id} className={styles.featuredCapability}>
                      {createContent}
                    </div>
                  );
                }

                const metricContent = (
                  <>
                    <span className={styles.capabilityIndexLabel}>
                      {metric.label}
                    </span>
                    <span className={styles.capabilityIndexValue}>
                      {String(activeRoutes).padStart(2, "0")}
                      <span>{metric.unit}</span>
                    </span>
                    <span className={styles.capabilityIndexAction}>
                      Explore
                    </span>
                  </>
                );

                return coreOnline && isHero ? (
                  <Link
                    key={metric.id}
                    href={metric.href}
                    className={`${styles.capabilityIndexItem} ${styles.capabilityIndexLink}`}
                    aria-label={`${metric.label}: ${metric.summary}`}
                  >
                    {metricContent}
                  </Link>
                ) : (
                  <div key={metric.id} className={styles.capabilityIndexItem}>
                    {metricContent}
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
