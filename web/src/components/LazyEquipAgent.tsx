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
}: {
  style?: CSSProperties;
  label?: string;
}) {
  return (
    <div className="min-h-14">
      <EquipAgent label={label} />
      <noscript>
        <div
          className="inline-flex items-center gap-3 px-8 py-4 rounded-lg bg-[#8fa34e] text-[#f4f5f0] text-[13px] font-bold tracking-[1px]"
          style={style}
        >
          {label}
        </div>
      </noscript>
    </div>
  );
}
