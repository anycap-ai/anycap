import { Suspense } from "react";
import { LoginClient } from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<p style={{ padding: "2rem", color: "#707468" }}>Redirecting…</p>}>
      <LoginClient />
    </Suspense>
  );
}
