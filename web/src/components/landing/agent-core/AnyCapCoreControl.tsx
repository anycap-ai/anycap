import Image from "next/image";
import type React from "react";

import styles from "./agent-core.module.css";

export type AnyCapCoreControlProps = {
  coreRef: React.RefObject<HTMLButtonElement | null>;
  onPointerDown: React.PointerEventHandler<HTMLButtonElement>;
  onPointerMove: React.PointerEventHandler<HTMLButtonElement>;
  onPointerUp: React.PointerEventHandler<HTMLButtonElement>;
  onLostPointerCapture: React.PointerEventHandler<HTMLButtonElement>;
  onPointerCancel: React.PointerEventHandler<HTMLButtonElement>;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLButtonElement>;
};

export function AnyCapCoreControl({
  coreRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onLostPointerCapture,
  onPointerCancel,
  onClick,
  onKeyDown,
}: AnyCapCoreControlProps) {
  return (
    <button
      ref={coreRef}
      type="button"
      className={styles.core}
      aria-label="Install the AnyCap Core"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onLostPointerCapture={onLostPointerCapture}
      onPointerCancel={onPointerCancel}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <Image
        src="/visuals/agent-core/anycap-core.webp"
        alt=""
        width={512}
        height={512}
        sizes="(min-width: 1280px) 10vw, (min-width: 768px) 8vw, 16vw"
        draggable={false}
        className={styles.layerImage}
      />
    </button>
  );
}
