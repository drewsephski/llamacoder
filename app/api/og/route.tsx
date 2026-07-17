import { ImageResponse } from "next/og";
import { domain } from "@/lib/domain";

const SITE_HEADLINE = "Turn ideas into apps";
const SITE_DESCRIPTION =
  "Research the web. Approve the plan. Build, verify, and ship React code you own.";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get("prompt")?.trim();
  const title = prompt
    ? prompt.length > 110
      ? `${prompt.slice(0, 107)}...`
      : prompt
    : SITE_HEADLINE;

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#07090d",
        backgroundImage:
          "radial-gradient(circle at 50% 26%, rgba(0, 149, 255, 0.22), transparent 35%), radial-gradient(circle at 8% 92%, rgba(12, 168, 255, 0.12), transparent 30%)",
        color: "#f8fafc",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          opacity: 0.14,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.65), transparent 78%)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          padding: "48px 64px 52px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexShrink: 0,
            alignItems: "center",
            fontSize: 27,
            fontWeight: 700,
            letterSpacing: "-0.03em",
          }}
        >
          <img
            src={`${domain}/squidagent-logo.svg`}
            alt=""
            width={54}
            height={54}
            style={{ marginRight: 15 }}
          />
          Squid Agent
          <span
            style={{
              display: "flex",
              marginLeft: 15,
              padding: "6px 11px",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: 999,
              backgroundColor: "rgba(14, 165, 233, 0.08)",
              color: "#7dd3fc",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Research to shipped app
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexShrink: 0,
            flexDirection: "column",
            marginTop: prompt ? 44 : 62,
            maxWidth: prompt ? 1010 : 860,
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#7dd3fc",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {prompt ? "Built with Squid Agent" : "AI app builder"}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 12,
              fontSize: prompt ? 58 : 76,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.055em",
            }}
          >
            {title}
          </div>
          {!prompt && (
            <div
              style={{
                display: "flex",
                marginTop: 22,
                maxWidth: 820,
                color: "#a7b0c0",
                fontSize: 24,
                lineHeight: 1.4,
              }}
            >
              {SITE_DESCRIPTION}
            </div>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            right: 64,
            bottom: 52,
            left: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            border: "1px solid rgba(125, 211, 252, 0.28)",
            borderRadius: 18,
            backgroundColor: "rgba(12, 17, 27, 0.88)",
            boxShadow: "0 22px 70px rgba(0, 98, 255, 0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#a7b0c0",
              fontSize: 18,
            }}
          >
            <span style={{ color: "#38bdf8", marginRight: 12 }}>●</span>
            Research
            <span style={{ margin: "0 11px", color: "#465063" }}>→</span>
            Plan
            <span style={{ margin: "0 11px", color: "#465063" }}>→</span>
            Build
            <span style={{ margin: "0 11px", color: "#465063" }}>→</span>
            Verify
          </div>
          <div
            style={{
              display: "flex",
              padding: "11px 18px",
              borderRadius: 12,
              backgroundImage:
                "linear-gradient(135deg, #0062ff 0%, #0ca8ff 100%)",
              color: "white",
              fontSize: 17,
              fontWeight: 700,
            }}
          >
            Build →
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    },
  );
}
