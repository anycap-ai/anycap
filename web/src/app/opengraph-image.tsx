import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt =
  "AnyCap gives AI agents image, video, music, speech, search, and crawl capabilities through one command.";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#f4f5f0",
          color: "#1c1f17",
          position: "relative",
          padding: "56px 64px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 20%, rgba(107,125,58,0.16), transparent 30%), radial-gradient(circle at 80% 25%, rgba(107,125,58,0.14), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.55), rgba(244,245,240,0.95))",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            position: "relative",
            border: "2px solid rgba(28,31,23,0.12)",
            padding: "44px",
            background: "rgba(255,255,255,0.48)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                border: "6px solid #6b7d3a",
                boxSizing: "border-box",
              }}
            />
            <div
              style={{
                fontSize: "38px",
                fontWeight: 700,
                letterSpacing: "-0.04em",
              }}
            >
              anycap
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div
              style={{
                fontSize: "78px",
                lineHeight: 1,
                letterSpacing: "-0.06em",
                maxWidth: "980px",
              }}
            >
              Every capability your agent needs. One command.
            </div>
            <div
              style={{
                fontSize: "28px",
                lineHeight: 1.4,
                color: "#4d5145",
                maxWidth: "920px",
              }}
            >
              Image, video, music, speech, search, and crawl through one
              interface. Built for agents, not adapted from human tools.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
              color: "#6b7d3a",
              fontSize: "20px",
              textTransform: "uppercase",
              letterSpacing: "0.22em",
            }}
          >
            <div>Image</div>
            <div>Video</div>
            <div>Music</div>
            <div>Speech</div>
            <div>Search</div>
            <div>Crawl</div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
