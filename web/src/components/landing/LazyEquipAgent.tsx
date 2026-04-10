"use client";

import type { CSSProperties } from "react";
import dynamic from "next/dynamic";

const EquipAgent = dynamic(
  () => import("./EquipAgent").then((mod) => mod.EquipAgent),
  { ssr: false }
);

export function LazyEquipAgent({
  style,
  label = "Equip your Agent",
  containerClassName,
  buttonClassName,
}: {
  style?: CSSProperties;
  label?: string;
  containerClassName?: string;
  buttonClassName?: string;
}) {
  return (
    <div
      className={`flex min-h-14 items-center justify-center${containerClassName ? ` ${containerClassName}` : ""}`}
    >
      <EquipAgent label={label} className={buttonClassName} style={style} />
      <noscript>
        <div
          className={`inline-flex items-center gap-3 rounded-lg bg-[#8fa34e] px-8 py-4 text-[13px] font-bold tracking-[1px] text-[#f4f5f0]${buttonClassName ? ` ${buttonClassName}` : ""}`}
          style={style}
        >
          {label}
        </div>
      </noscript>
    </div>
  );
}
