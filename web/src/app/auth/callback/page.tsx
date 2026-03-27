import { Suspense } from "react";
import { CallbackClient } from "./CallbackClient";

export const runtime = "edge";

export default function CallbackPage() {
  return (
    <Suspense>
      <CallbackClient />
    </Suspense>
  );
}
