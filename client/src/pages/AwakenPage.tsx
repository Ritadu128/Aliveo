// Aliveo — Awaken Page (PRD v2 核心体验起点)
// Design: Neo-Museological
//
// PRD 规格：
//   类型A（惊喜互动型）：文物微动画 + 突然说话
//     示例台词："等等，你刚刚是在拍我吗？"
//   类型B（沉浸叙事型）：背景渐暗 + 文物缓慢浮现 + 低沉开场
//     示例台词："我已经在这里站了三百年……"
//
// 根据文物 ID 自动分配类型（奇数→A，偶数→B）

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";

// Type A artifacts: surprise/playful
const TYPE_A_IDS = new Set(["the-thinker", "david", "laocoon"]);

// Opening lines per artifact
const AWAKEN_LINES: Record<string, { typeA: string; typeB: string }> = {
  "winged-victory": {
    typeA: "嘿——你刚刚是在拍我吗？",
    typeB: "海风……我听见了海风的声音……",
  },
  "the-thinker": {
    typeA: "等等，你刚刚是在拍我吗？",
    typeB: "……我已经在这里坐了一百多年了。",
  },
  "venus-de-milo": {
    typeA: "哦？终于有人注意到我了！",
    typeB: "两千年的时光，如白驹过隙……",
  },
  "david": {
    typeA: "哈！你也来看我的吗？",
    typeB: "我已经在这里站了五百年……",
  },
  "laocoon": {
    typeA: "你——你也感受到了吗？",
    typeB: "我已经在这里站了三百年……",
  },
};

const DEFAULT_LINES = {
  typeA: "等等，你刚刚是在拍我吗？",
  typeB: "我已经在这里站了三百年……",
};

export default function AwakenPage() {
  const { setCurrentPage, selectedArtifact } = useApp();
  const [phase, setPhase] = useState<"enter" | "awaken" | "speak" | "done">("enter");
  const [displayedText, setDisplayedText] = useState("");

  if (!selectedArtifact) {
    setCurrentPage("result");
    return null;
  }

  const isTypeA = TYPE_A_IDS.has(selectedArtifact.id);
  const lines = AWAKEN_LINES[selectedArtifact.id] ?? DEFAULT_LINES;
  const openingLine = isTypeA ? lines.typeA : lines.typeB;

  // Phase sequence
  useEffect(() => {
    // Phase 1: enter (show artifact)
    const t1 = setTimeout(() => setPhase("awaken"), isTypeA ? 800 : 1400);
    return () => clearTimeout(t1);
  }, [isTypeA]);

  useEffect(() => {
    if (phase !== "awaken") return;
    const t = setTimeout(() => setPhase("speak"), isTypeA ? 600 : 1200);
    return () => clearTimeout(t);
  }, [phase, isTypeA]);

  // Typewriter for opening line
  useEffect(() => {
    if (phase !== "speak") return;
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(openingLine.slice(0, i));
      if (i >= openingLine.length) {
        clearInterval(interval);
        setTimeout(() => setPhase("done"), 600);
      }
    }, isTypeA ? 55 : 75);
    return () => clearInterval(interval);
  }, [phase, openingLine, isTypeA]);

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        background: isTypeA
          ? "oklch(0.97 0.012 80)"
          : "oklch(0.12 0.01 65)",
      }}
    >
      {/* ── TYPE A: Surprise / Playful ── */}
      {isTypeA && <TypeAAwaken artifact={selectedArtifact} phase={phase} displayedText={displayedText} />}

      {/* ── TYPE B: Immersive / Narrative ── */}
      {!isTypeA && <TypeBAwaken artifact={selectedArtifact} phase={phase} displayedText={displayedText} />}

      {/* ── Continue button (both types) ── */}
      {phase === "done" && (
        <div
          className="absolute bottom-12 left-0 right-0 flex justify-center z-30"
          style={{ animation: "awakenFadeUp 0.6s ease both" }}
        >
          <button
            onClick={() => setCurrentPage("conversation")}
            className={`px-10 py-4 font-body font-medium tracking-widest uppercase text-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97] ${
              isTypeA
                ? "bg-[oklch(0.22_0.01_65)] text-white hover:bg-[oklch(0.35_0.01_65)] shadow-xl"
                : "bg-white/15 backdrop-blur-sm text-white border border-white/30 hover:bg-white/25"
            }`}
          >
            开始对话 →
          </button>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => setCurrentPage("result")}
        className={`absolute top-6 left-5 z-40 flex items-center gap-1.5 transition-colors ${
          isTypeA
            ? "text-[oklch(0.45_0.01_65)] hover:text-[oklch(0.22_0.01_65)]"
            : "text-white/60 hover:text-white"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M11 3L5 9L11 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="font-body text-sm">返回</span>
      </button>

      <style>{`
        @keyframes awakenFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes awakenShake {
          0%, 100% { transform: rotate(0deg); }
          20%       { transform: rotate(-3deg); }
          40%       { transform: rotate(3deg); }
          60%       { transform: rotate(-2deg); }
          80%       { transform: rotate(2deg); }
        }
        @keyframes awakenFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes awakenGlow {
          0%, 100% { box-shadow: 0 0 20px oklch(0.72 0.09 75 / 0.3); }
          50%       { box-shadow: 0 0 40px oklch(0.72 0.09 75 / 0.6); }
        }
        @keyframes awakenPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1; transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}

// ── Type A: Surprise / Playful ────────────────────────────────────────────

function TypeAAwaken({
  artifact,
  phase,
  displayedText,
}: {
  artifact: { name: string; image: string; artist: string; year: string };
  phase: string;
  displayedText: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 pt-16 pb-24">
      {/* Artifact image with shake animation */}
      <div
        className="relative mb-8"
        style={{
          animation:
            phase === "awaken"
              ? "awakenShake 0.5s ease-in-out, awakenFloat 3s ease-in-out 0.5s infinite"
              : phase === "speak" || phase === "done"
              ? "awakenFloat 3s ease-in-out infinite"
              : "none",
          opacity: phase === "enter" ? 0 : 1,
          transform: phase === "enter" ? "scale(0.85)" : "scale(1)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        {/* Decorative ring */}
        <div
          className="absolute -inset-3 rounded-full border-2 border-dashed border-[oklch(0.72_0.09_75)]/40"
          style={{ animation: "awakenGlow 2s ease-in-out infinite" }}
        />
        <div className="w-52 h-52 overflow-hidden border-4 border-white shadow-2xl"
          style={{ borderRadius: "50%" }}>
          <img
            src={artifact.image}
            alt={artifact.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Surprise emoji burst */}
        {(phase === "awaken" || phase === "speak" || phase === "done") && (
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-[oklch(0.72_0.09_75)] rounded-full flex items-center justify-center shadow-lg"
            style={{ animation: "awakenFadeUp 0.4s ease both" }}>
            <span className="text-lg">!</span>
          </div>
        )}
      </div>

      {/* Artifact name */}
      <div
        className="text-center mb-6"
        style={{
          opacity: phase === "enter" ? 0 : 1,
          transition: "opacity 0.6s ease 0.3s",
        }}
      >
        <p className="font-display text-2xl font-bold text-[oklch(0.22_0.01_65)] mb-1">
          {artifact.name}
        </p>
        <p className="exhibit-label text-[oklch(0.65_0.02_65)] text-xs tracking-[0.15em]">
          {artifact.artist.toUpperCase()} · {artifact.year}
        </p>
      </div>

      {/* Speech bubble */}
      {(phase === "speak" || phase === "done") && (
        <div
          className="relative bg-white border-2 border-[oklch(0.22_0.01_65)] px-5 py-3.5 max-w-xs shadow-xl"
          style={{
            borderRadius: "12px 12px 12px 2px",
            animation: "awakenFadeUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both",
          }}
        >
          {/* Tail */}
          <div className="absolute -top-3 left-4 w-4 h-4 bg-white border-t-2 border-l-2 border-[oklch(0.22_0.01_65)]"
            style={{ transform: "rotate(45deg)" }} />
          <p className="font-body text-base text-[oklch(0.22_0.01_65)] leading-relaxed">
            {displayedText}
            {phase === "speak" && <span className="animate-blink">|</span>}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Type B: Immersive / Narrative ─────────────────────────────────────────

function TypeBAwaken({
  artifact,
  phase,
  displayedText,
}: {
  artifact: { name: string; image: string; artist: string; year: string };
  phase: string;
  displayedText: string;
}) {
  return (
    <div className="relative flex flex-col items-center justify-end h-full pb-32">
      {/* Full-screen artifact image */}
      <div
        className="absolute inset-0"
        style={{
          opacity: phase === "enter" ? 0 : phase === "awaken" ? 0.5 : 0.35,
          transition: "opacity 1.8s ease",
        }}
      >
        <img
          src={artifact.image}
          alt={artifact.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.08_0.01_65)] via-[oklch(0.12_0.01_65)]/60 to-transparent" />
      </div>

      {/* Artifact name — floats up */}
      <div
        className="relative z-10 text-center mb-8 px-6"
        style={{
          opacity: phase === "enter" ? 0 : 1,
          transform: phase === "enter" ? "translateY(20px)" : "translateY(0)",
          transition: "all 1.2s ease 0.6s",
        }}
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="h-px w-8 bg-[oklch(0.72_0.09_75)]/60" />
          <span className="text-[oklch(0.72_0.09_75)] text-xs">✦</span>
          <div className="h-px w-8 bg-[oklch(0.72_0.09_75)]/60" />
        </div>
        <p className="font-display text-3xl font-bold text-white leading-tight mb-2">
          {artifact.name}
        </p>
        <p className="exhibit-label text-white/50 text-xs tracking-[0.2em]">
          {artifact.artist.toUpperCase()} · {artifact.year}
        </p>
      </div>

      {/* Narrative speech bubble */}
      {(phase === "speak" || phase === "done") && (
        <div
          className="relative z-10 mx-6 px-5 py-4 bg-black/50 backdrop-blur-md border border-white/20 max-w-sm"
          style={{
            animation: "awakenFadeUp 0.8s ease both",
            borderRadius: "2px 12px 12px 12px",
          }}
        >
          <div className="flex items-start gap-3">
            {/* Small artifact avatar */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border border-white/30">
              <img src={artifact.image} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="exhibit-label text-[oklch(0.72_0.09_75)] text-[0.62rem] tracking-[0.15em] mb-1.5">
                {artifact.name.toUpperCase()}
              </p>
              <p className="font-body text-sm text-white/90 leading-relaxed italic">
                "{displayedText}
                {phase === "speak" && <span className="animate-blink not-italic">|</span>}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ambient glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(0.72 0.09 75 / 0.15) 0%, transparent 70%)",
          animation: "awakenPulse 3s ease-in-out infinite",
          opacity: phase === "enter" ? 0 : 1,
          transition: "opacity 1s ease",
        }}
      />
    </div>
  );
}
