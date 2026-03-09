// Aliveo — Landing Page (PRD v2)
// Design: Neo-Museological
//
// Features:
//   - Chinese copy: "文物，开口说话了。"
//   - 7 floating speech bubbles with drift + parallax
//   - Artifact cards: hover speech bubble + gold bar + scale effect
//   - Cursor parallax on hero background
//   - Staggered entrance animations
//   - "三步唤醒文物" how-it-works section

import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "@/contexts/AppContext";
import { ARTIFACTS } from "@/lib/artifacts";

// ── Floating bubble data ──────────────────────────────────────────────────
const HERO_BUBBLES = [
  { id: 1, text: "等等，你刚刚是在拍我吗？", x: 8,  y: 20, delay: 0,   duration: 7.2, depth: 0.6 },
  { id: 2, text: "我已经在这里站了三百年……",  x: 62, y: 14, delay: 1.4, duration: 8.5, depth: 1.0 },
  { id: 3, text: "终于有人来看我了！✨",       x: 72, y: 52, delay: 0.8, duration: 6.8, depth: 0.4 },
  { id: 4, text: "你想知道我的故事吗？",       x: 5,  y: 60, delay: 2.1, duration: 9.0, depth: 0.8 },
  { id: 5, text: "拍一张，我就开口说话。",     x: 38, y: 7,  delay: 3.0, duration: 7.6, depth: 1.2 },
  { id: 6, text: "两千年的秘密，只说给你听。", x: 50, y: 70, delay: 1.8, duration: 8.2, depth: 0.5 },
  { id: 7, text: "Snap a pic—I'm talking back!", x: 18, y: 78, delay: 2.5, duration: 7.0, depth: 0.7 },
];

// Card speech bubbles (Chinese per PRD)
const CARD_BUBBLES: Record<string, string> = {
  "winged-victory": "海风吹过，我就是胜利本身。",
  "the-thinker":    "……我还在想。",
  "venus-de-milo":  "美，不需要解释。",
  "david":          "我不害怕，我只是专注。",
  "laocoon":        "说出真相，是需要代价的。",
};

export default function LandingPage() {
  const { setCurrentPage } = useApp();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Entrance animation trigger
  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Cursor parallax
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  }, []);

  const featuredArtifacts = ARTIFACTS.slice(0, 4);

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.012_80)] overflow-x-hidden">

      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[oklch(0.97_0.012_80)]/92 backdrop-blur-md border-b border-[oklch(0.88_0.02_75)]/70">
        <div className="flex items-center gap-1">
          <span className="font-display text-xl font-bold text-[oklch(0.22_0.01_65)] tracking-tight">Aliveo</span>
          <span className="text-[oklch(0.72_0.09_75)] text-xl font-display">.</span>
        </div>
        <div className="flex items-center gap-6">
          {["展品", "关于", "参观"].map(label => (
            <button key={label} className="font-body text-sm text-[oklch(0.50_0.02_65)] hover:text-[oklch(0.22_0.01_65)] transition-colors">
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
        style={{ background: "linear-gradient(160deg, oklch(0.97 0.012 80) 0%, oklch(0.93 0.025 75) 55%, oklch(0.90 0.03 70) 100%)" }}
      >
        {/* Background museum image with cursor parallax */}
        <div
          className="absolute inset-0 z-0 opacity-18"
          style={{
            transform: `translate(${mousePos.x * -14}px, ${mousePos.y * -9}px) scale(1.06)`,
            transition: "transform 1.0s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=1600&q=80"
            alt="Museum interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.97_0.012_80)]/50 via-transparent to-[oklch(0.97_0.012_80)]/85" />
        </div>

        {/* Floating speech bubbles layer */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          {HERO_BUBBLES.map(bubble => (
            <FloatingBubble key={bubble.id} bubble={bubble} mousePos={mousePos} isVisible={isVisible} />
          ))}
        </div>

        {/* Hero content — slight counter-parallax */}
        <div
          className="relative z-20 flex flex-col items-center text-center px-6 max-w-xl"
          style={{
            transform: `translate(${mousePos.x * 5}px, ${mousePos.y * 3}px)`,
            transition: "transform 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          {/* Museum label tag */}
          <div
            className="flex items-center gap-2 mb-6"
            style={{ opacity: isVisible ? 1 : 0, animation: isVisible ? "aliveoFadeUp 0.7s ease forwards 0.2s" : "none" }}
          >
            <div className="h-px w-8 bg-[oklch(0.72_0.09_75)]/70" />
            <span className="exhibit-label text-[oklch(0.72_0.09_75)] text-[0.65rem] tracking-[0.22em]">
              博物馆互动导览
            </span>
            <div className="h-px w-8 bg-[oklch(0.72_0.09_75)]/70" />
          </div>

          {/* Main headline */}
          <h1
            className="font-display text-5xl md:text-6xl font-bold text-[oklch(0.22_0.01_65)] leading-[1.08] mb-4"
            style={{ opacity: 0, animation: isVisible ? "aliveoFadeUp 0.85s ease forwards 0.38s" : "none" }}
          >
            文物，
            <br />
            <span className="text-[oklch(0.52_0.09_72)]">开口说话了。</span>
          </h1>

          {/* Sub copy */}
          <p
            className="font-body text-lg text-[oklch(0.45_0.02_65)] leading-relaxed mb-2"
            style={{ opacity: 0, animation: isVisible ? "aliveoFadeUp 0.85s ease forwards 0.55s" : "none" }}
          >
            拍一张，文物就会开始讲自己的故事。
          </p>
          <p
            className="font-body text-sm text-[oklch(0.62_0.02_65)] mb-10"
            style={{ opacity: 0, animation: isVisible ? "aliveoFadeUp 0.85s ease forwards 0.68s" : "none" }}
          >
            Snap a pic, and boom—it's talking back!
          </p>

          {/* CTA Button */}
          <button
            onClick={() => setCurrentPage("camera")}
            className="group relative overflow-hidden px-10 py-4 font-body font-medium tracking-widest uppercase text-sm shadow-xl active:scale-[0.97] transition-transform duration-150"
            style={{
              opacity: 0,
              animation: isVisible ? "aliveoFadeUp 0.85s ease forwards 0.82s" : "none",
              background: "oklch(0.22 0.01 65)",
              color: "oklch(0.97 0.012 80)",
              clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
            }}
          >
            {/* Hover fill */}
            <div
              className="absolute inset-0 transition-transform duration-500 ease-out"
              style={{
                background: "oklch(0.72 0.09 75)",
                transform: "translateX(-105%)",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateX(0)"; }}
            />
            <span className="relative z-10 flex items-center gap-3 group-hover:text-white transition-colors duration-300">
              开始体验
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-1 transition-transform duration-200">
                <path d="M3 8H13M8 3L13 8L8 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>

          {/* Scroll hint */}
          <div
            className="mt-12 flex flex-col items-center gap-2"
            style={{ opacity: 0, animation: isVisible ? "aliveoFadeUp 0.85s ease forwards 1.0s" : "none" }}
          >
            <span className="exhibit-label text-[oklch(0.65_0.02_65)] text-[0.62rem] tracking-[0.22em]">
              ✦ 向下探索展品 ✦
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-[oklch(0.72_0.09_75)]/60 to-transparent animate-pulse" />
          </div>
        </div>
      </section>

      {/* ── Artifact Cards Section ── */}
      <section className="relative z-10 px-5 py-16 bg-[oklch(0.97_0.012_80)]">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1 bg-[oklch(0.88_0.02_75)]" />
          <span className="exhibit-label text-[oklch(0.65_0.02_65)] text-[0.65rem] tracking-[0.22em]">✦ 馆藏精选 ✦</span>
          <div className="h-px flex-1 bg-[oklch(0.88_0.02_75)]" />
        </div>
        <p className="font-display text-2xl font-bold text-[oklch(0.22_0.01_65)] text-center mb-1">
          选一件，听它开口
        </p>
        <p className="font-body text-sm text-[oklch(0.58_0.02_65)] text-center mb-8">
          点击任意展品，开始沉浸式对话体验
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          {featuredArtifacts.map((artifact, i) => (
            <ArtifactCard
              key={artifact.id}
              artifact={artifact}
              bubbleText={CARD_BUBBLES[artifact.id] ?? "……"}
              isHovered={hoveredCard === artifact.id}
              onHover={() => setHoveredCard(artifact.id)}
              onLeave={() => setHoveredCard(null)}
              onClick={() => setCurrentPage("camera")}
              delay={i * 0.12}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-10">
          <div className="h-px w-10 bg-[oklch(0.72_0.09_75)]/50" />
          <span className="exhibit-label text-[oklch(0.72_0.09_75)] text-[0.62rem] tracking-[0.18em]">
            悬停展品，听它说话
          </span>
          <div className="h-px w-10 bg-[oklch(0.72_0.09_75)]/50" />
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-5 py-12 bg-[oklch(0.94_0.02_75)]">
        <p className="font-display text-xl font-bold text-[oklch(0.22_0.01_65)] text-center mb-8">
          三步，唤醒文物
        </p>
        <div className="flex flex-col gap-3 max-w-sm mx-auto">
          {[
            { step: "01", emoji: "📸", title: "拍摄展品", desc: "对准任意文物，按下快门" },
            { step: "02", emoji: "🔍", title: "智能识别", desc: "2–3秒完成展品匹配" },
            { step: "03", emoji: "💬", title: "开口对话", desc: "文物以第一人称讲述故事，你可以自由提问" },
          ].map(item => (
            <div key={item.step} className="flex items-center gap-4 p-4 bg-[oklch(0.97_0.012_80)] border border-[oklch(0.88_0.02_75)] shadow-sm">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[oklch(0.22_0.01_65)]">
                <span className="exhibit-label text-[oklch(0.97_0.012_80)] text-xs">{item.step}</span>
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-[oklch(0.22_0.01_65)]">
                  {item.emoji} {item.title}
                </p>
                <p className="font-body text-xs text-[oklch(0.55_0.02_65)] mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setCurrentPage("camera")}
            className="px-8 py-3.5 bg-[oklch(0.72_0.09_75)] text-white font-body font-medium tracking-widest uppercase text-sm hover:bg-[oklch(0.65_0.1_72)] transition-all active:scale-[0.97] shadow-md"
          >
            立即开始 →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-5 py-8 bg-[oklch(0.22_0.01_65)] text-center">
        <p className="font-display text-lg font-bold text-[oklch(0.97_0.012_80)] mb-1">Aliveo.</p>
        <p className="font-body text-xs text-[oklch(0.65_0.02_65)]">让文物开口，让历史呼吸。</p>
      </footer>

      {/* ── Global keyframes ── */}
      <style>{`
        @keyframes aliveoFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes aliveoDrift {
          0%   { transform: translateY(0px) rotate(0deg); }
          30%  { transform: translateY(-11px) rotate(0.6deg); }
          65%  { transform: translateY(-5px) rotate(-0.4deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes aliveoBubblePop {
          0%   { opacity: 0; transform: scale(0.65) translateY(10px); }
          65%  { transform: scale(1.06) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes aliveoShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}

// ── Floating Bubble ───────────────────────────────────────────────────────

interface BubbleData {
  id: number; text: string; x: number; y: number;
  delay: number; duration: number; depth: number;
}

function FloatingBubble({
  bubble, mousePos, isVisible,
}: { bubble: BubbleData; mousePos: { x: number; y: number }; isVisible: boolean }) {
  const px = mousePos.x * bubble.depth * 22;
  const py = mousePos.y * bubble.depth * 16;

  return (
    <div
      className="absolute"
      style={{
        left: `${bubble.x}%`,
        top: `${bubble.y}%`,
        transform: `translate(${px}px, ${py}px)`,
        transition: "transform 1.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        animation: isVisible ? `aliveoDrift ${bubble.duration}s ease-in-out ${bubble.delay}s infinite` : "none",
      }}
    >
      <div
        className="relative bg-white/88 backdrop-blur-sm border border-[oklch(0.88_0.02_75)]/80 shadow-md font-label text-[oklch(0.35_0.02_65)] text-xs leading-snug px-3.5 py-2 max-w-[180px]"
        style={{
          borderRadius: "2px 10px 10px 10px",
          animation: isVisible
            ? `aliveoBubblePop 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) ${bubble.delay + 0.25}s both`
            : "none",
        }}
      >
        {/* Bubble tail */}
        <div
          className="absolute -top-[7px] left-2.5 w-3 h-3 bg-white/88 border-t border-l border-[oklch(0.88_0.02_75)]/80"
          style={{ transform: "rotate(45deg)" }}
        />
        {bubble.text}
        {/* Hover shimmer */}
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-400 pointer-events-none overflow-hidden"
          style={{
            background: "linear-gradient(90deg, transparent, oklch(0.72 0.09 75 / 0.10), transparent)",
            backgroundSize: "200% 100%",
            animation: "aliveoShimmer 2.2s linear infinite",
          }}
        />
      </div>
    </div>
  );
}

// ── Artifact Card ─────────────────────────────────────────────────────────

interface ArtifactCardProps {
  artifact: { id: string; name: string; artist: string; year: string; image: string; catalogNumber: string };
  bubbleText: string; isHovered: boolean;
  onHover: () => void; onLeave: () => void; onClick: () => void; delay: number;
}

function ArtifactCard({ artifact, bubbleText, isHovered, onHover, onLeave, onClick, delay }: ArtifactCardProps) {
  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onTouchStart={onHover}
      onTouchEnd={() => { onLeave(); onClick(); }}
      onClick={onClick}
      style={{ animation: `aliveoFadeUp 0.7s ease both ${delay + 0.3}s` }}
    >
      {/* Speech bubble (hover) */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{
          bottom: "calc(100% + 6px)",
          left: "50%",
          transform: `translateX(-50%) scale(${isHovered ? 1 : 0.75})`,
          opacity: isHovered ? 1 : 0,
          transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="relative bg-[oklch(0.22_0.01_65)] text-[oklch(0.97_0.012_80)] font-label text-[0.62rem] px-3 py-1.5 whitespace-nowrap shadow-lg"
          style={{ borderRadius: "8px 8px 8px 2px" }}
        >
          {bubbleText}
          <div
            className="absolute -bottom-[5px] left-3 w-2.5 h-2.5 bg-[oklch(0.22_0.01_65)]"
            style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        className="relative overflow-hidden border border-[oklch(0.88_0.02_75)] bg-white"
        style={{
          transform: isHovered ? "translateY(-5px) scale(1.025)" : "translateY(0) scale(1)",
          transition: "transform 0.3s cubic-bezier(0.34, 1.2, 0.64, 1), box-shadow 0.3s ease",
          boxShadow: isHovered
            ? "0 14px 36px oklch(0.52 0.09 72 / 0.20), 0 2px 8px oklch(0.22 0.01 65 / 0.10)"
            : "0 2px 8px oklch(0.22 0.01 65 / 0.06)",
        }}
      >
        {/* Image */}
        <div className="aspect-[3/4] overflow-hidden relative bg-[oklch(0.93_0.008_75)]">
          <img
            src={artifact.image}
            alt={artifact.name}
            className="w-full h-full object-cover"
            style={{
              transform: isHovered ? "scale(1.07)" : "scale(1)",
              transition: "transform 0.5s ease",
            }}
          />
          {/* Catalog badge */}
          <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-1.5 py-0.5">
            <span className="exhibit-label text-[0.55rem] text-[oklch(0.55_0.012_70)]">{artifact.catalogNumber}</span>
          </div>
          {/* Dark overlay on hover */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-[oklch(0.22_0.01_65)]/55 to-transparent"
            style={{ opacity: isHovered ? 1 : 0, transition: "opacity 0.3s ease" }}
          />
          {/* "点击对话" label */}
          <div
            className="absolute bottom-2.5 left-0 right-0 flex justify-center"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? "translateY(0)" : "translateY(5px)",
              transition: "all 0.25s ease",
            }}
          >
            <span className="exhibit-label text-white/90 text-[0.58rem] tracking-[0.18em] bg-[oklch(0.72_0.09_75)]/80 px-2 py-0.5">
              点击对话
            </span>
          </div>
        </div>

        {/* Label */}
        <div className="p-2.5 border-t border-[oklch(0.88_0.02_75)]">
          <p className="font-display text-sm font-semibold text-[oklch(0.22_0.01_65)] leading-tight line-clamp-1">
            {artifact.name}
          </p>
          <p className="exhibit-label text-[oklch(0.65_0.02_65)] text-[0.58rem] mt-0.5 tracking-wide">
            {artifact.artist.split(",")[0].toUpperCase()} · {artifact.year}
          </p>
        </div>

        {/* Gold accent bar (expands on hover) */}
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-[oklch(0.72_0.09_75)]"
          style={{ width: isHovered ? "100%" : "0%", transition: "width 0.35s ease" }}
        />
      </div>
    </div>
  );
}
