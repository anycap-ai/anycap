import { permanentRedirect } from "next/navigation";

export const runtime = "edge";

export default function ForHumanPage() {
  permanentRedirect("/");
}
