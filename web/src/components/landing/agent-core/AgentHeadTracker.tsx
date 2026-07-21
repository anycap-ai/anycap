import Image from "next/image";
import type React from "react";

import styles from "./agent-core.module.css";

export type AgentHeadTrackerProps = {
  headRef: React.RefObject<HTMLDivElement | null>;
};

export function AgentHeadTracker({ headRef }: AgentHeadTrackerProps) {
  return (
    <div ref={headRef} className={styles.head} aria-hidden="true">
      <Image
        src="/visuals/agent-core/robot-head.webp"
        alt=""
        width={768}
        height={768}
        sizes="(min-width: 1280px) 24vw, (min-width: 768px) 22vw, 42vw"
        draggable={false}
        className={styles.layerImage}
      />
    </div>
  );
}
