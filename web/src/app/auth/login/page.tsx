import { Suspense } from "react";
import { LoginClient } from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}
