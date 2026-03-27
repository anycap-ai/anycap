import { Suspense } from "react";
import { CLILoginClient } from "./CLILoginClient";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default function CLILoginPage() {
  return (
    <Suspense fallback={null}>
      <CLILoginClient />
    </Suspense>
  );
}
