"use client";

import dynamic from "next/dynamic";

const GlobalTipToast = dynamic(
  () => import("./GlobalTipToast").then((mod) => mod.GlobalTipToast),
  { ssr: false }
);

export function LazyGlobalTipToast() {
  return <GlobalTipToast />;
}
