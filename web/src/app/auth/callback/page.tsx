import { Suspense } from "react";
import { CallbackClient } from "./CallbackClient";

export default function CallbackPage() {
  return (
    <Suspense>
      <CallbackClient />
    </Suspense>
  );
}
