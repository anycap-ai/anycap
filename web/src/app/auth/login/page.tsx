import { Suspense } from "react";
import { LoginClient } from "./LoginClient";

export const runtime = "edge";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}
