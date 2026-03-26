import { Suspense } from "react";
import { CallbackClient } from "./CallbackClient";

export default function CallbackPage() {
  return (
    <Suspense fallback={<p style={{ padding: "2rem", color: "#707468" }}>Processing…</p>}>
      <CallbackClient />
    </Suspense>
  );
}
