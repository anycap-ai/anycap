"use client";

import type { CSSProperties } from "react";
import dynamic from "next/dynamic";

const EquipAgent = dynamic(
  () => import("./EquipAgent").then((mod) => mod.EquipAgent),
  {
    ssr: false,
    loading: () => (
      <div className="inline-flex items-center gap-3 px-8 py-4 bg-[#6b7d3a] text-[#f4f5f0] text-[13px] font-bold tracking-[1px]">
        Equip your Agent
      </div>
    ),
  }
);

export function LazyEquipAgent({
  style,
}: {
  style?: CSSProperties;
}) {
  return (
    <div className="min-h-14">
      <EquipAgent />
      <noscript>
        <div
          className="inline-flex items-center gap-3 px-8 py-4 bg-[#6b7d3a] text-[#f4f5f0] text-[13px] font-bold tracking-[1px]"
          style={style}
        >
          Equip your Agent
        </div>
      </noscript>
    </div>
  );
}
