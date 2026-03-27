import { Suspense } from "react";
import { CLILoginClient } from "./CLILoginClient";

export default function CLILoginPage() {
  return (
    <Suspense>
      <CLILoginClient />
    </Suspense>
  );
}
