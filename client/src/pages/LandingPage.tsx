// Aliveo — Landing Page
// Design: Neo-Museological
// - Warm ivory background with hero museum image
// - Playfair Display title, DM Sans body
// - Artifact cards with speech bubble hover effect (✦ fun detail)
// - Gold accent decorators, museum label typography

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { ARTIFACTS } from "@/lib/artifacts";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663370025872/i7dgeZXx4vm8TcJvhWSQ7v/hero-bg-QFQXDYt5RbpmFMX4yu4ipj.webp";

// Fun speech bubbles for each artifact — the "interesting small design" detail
const SPEECH_BUBBLES: Record<string, string> = {
  "winged-victory": "Ready to fly?",
  "the-thinker": "Hmm...",
  "venus-de-milo": "I see you!",
  "david": "Giant? What giant?",
  "laocoon": "It's a long story...",
};

export default function LandingPage() {
  const { setCurrentPage } = useApp();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const featuredArtifacts = ARTIFACTS.slice(0, 3);

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.012_80)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[oklch(0.97_0.012_80)]/90 backdrop-blur-sm border-b border-[oklch(0.88_0.01_75)]">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-semibold tracking-tight text-[oklch(0.22_0.01_65)]">
            SculptTalk
            <span className="text-[oklch(0.58_0.1_72)]">.</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="font-body text-sm text-[oklch(0.45_0.01_65)] hover:text-[oklch(0.22_0.01_65)] transition-colors tracking-wide">
            Collections
          </a>
          <a href="#" className="font-body text-sm text-[oklch(0.45_0.01_65)] hover:text-[oklch(0.22_0.01_65)] transition-colors tracking-wide">
            About
          </a>
          <a href="#" className="font-body text-sm text-[oklch(0.45_0.01_65)] hover:text-[oklch(0.22_0.01_65)] transition-colors tracking-wide">
            Visit
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        {/* Hero background image */}
        <div className="relative h-[55vh] min-h-[360px] overflow-hidden">
          <img
            src={HERO_BG}
            alt="Museum gallery"
            className="w-full h-full object-cover object-center"
          />
          {/* Warm overlay gradient — stronger at bottom for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.97_0.012_80)]/10 via-[oklch(0.97_0.012_80)]/5 to-[oklch(0.97_0.012_80)]" />
          {/* Subtle vignette on sides */}
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.97_0.012_80)]/30 via-transparent to-[oklch(0.97_0.012_80)]/30" />
        </div>

        {/* Hero text — overlapping the image bottom */}
        <div className="relative -mt-20 px-6 pb-10 text-center animate-fade-up">
          {/* Decorative diamond */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-[oklch(0.72_0.09_75)]" />
            <span className="text-[oklch(0.72_0.09_75)] text-xs">✦</span>
            <div className="h-px w-12 bg-[oklch(0.72_0.09_75)]" />
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[oklch(0.22_0.01_65)] leading-tight mb-4">
            Art is waiting<br />
            <em className="not-italic text-[oklch(0.58_0.1_72)]">to speak.</em>
          </h1>
          <p className="font-body text-base md:text-lg text-[oklch(0.45_0.01_65)] max-w-md mx-auto mb-8 leading-relaxed">
            Pick a sculpture to start a conversation across centuries.
          </p>

          <button
            onClick={() => setCurrentPage("camera")}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[oklch(0.22_0.01_65)] text-[oklch(0.97_0.012_80)] font-body font-medium text-sm tracking-widest uppercase hover:bg-[oklch(0.35_0.01_65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span>Start Exploring</span>
            <span className="text-[oklch(0.72_0.09_75)]">→</span>
          </button>
        </div>
      </section>

      {/* Gold divider */}
      <div className="gold-line mx-6 my-2 opacity-60" />

      {/* Featured Artifacts Section */}
      <section className="px-4 py-10">
        {/* Section header */}
        <div className="text-center mb-8 animate-fade-up-delay-1">
          <p className="exhibit-label mb-2 text-[oklch(0.58_0.1_72)]">Featured Collection</p>
          <h2 className="font-display text-2xl font-semibold text-[oklch(0.22_0.01_65)]">
            Masterpieces Await
          </h2>
        </div>

        {/* Artifact Cards */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          {featuredArtifacts.map((artifact, index) => (
            <div
              key={artifact.id}
              className="relative flex-shrink-0 w-[260px] snap-center animate-fade-up-delay-2"
              style={{ animationDelay: `${0.1 * index}s` }}
              onMouseEnter={() => setHoveredCard(artifact.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Speech bubble — fun detail! */}
              {hoveredCard === artifact.id && (
                <div className="absolute -top-10 left-4 z-10 speech-bubble px-3 py-1.5 text-xs font-body font-medium text-[oklch(0.22_0.01_65)] whitespace-nowrap animate-fade-up">
                  {SPEECH_BUBBLES[artifact.id] || "Hello there!"}
                </div>
              )}

              {/* Card */}
              <div
                className="artifact-card bg-white rounded-sm overflow-hidden shadow-sm border border-[oklch(0.88_0.01_75)] cursor-pointer"
                onClick={() => setCurrentPage("camera")}
              >
                {/* Image */}
                <div className="relative h-[300px] overflow-hidden bg-[oklch(0.93_0.008_75)]">
                  <img
                    src={artifact.image}
                    alt={artifact.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {/* Catalog number badge */}
                  <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-0.5">
                    <span className="exhibit-label text-[0.6rem] text-[oklch(0.55_0.012_70)]">
                      {artifact.catalogNumber}
                    </span>
                  </div>
                </div>

                {/* Exhibit label */}
                <div className="p-4 border-t border-[oklch(0.88_0.01_75)]">
                  {/* Thin gold top accent */}
                  <div className="h-px w-8 bg-[oklch(0.72_0.09_75)] mb-3" />
                  <h3 className="font-display text-lg font-semibold text-[oklch(0.22_0.01_65)] leading-tight mb-1">
                    {artifact.name}
                  </h3>
                  <p className="exhibit-label text-[oklch(0.55_0.012_70)]">
                    {artifact.artist} · {artifact.year}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom hint */}
        <div className="text-center mt-8 animate-fade-up-delay-4">
          <p className="exhibit-label text-[oklch(0.72_0.09_75)] tracking-[0.2em]">
            ✦ Click a masterpiece to whisper hello ✦
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-[oklch(0.88_0.01_75)] mt-4">
        <div className="flex flex-col items-center gap-3">
          <span className="font-display text-lg font-semibold text-[oklch(0.22_0.01_65)]">
            SculptTalk<span className="text-[oklch(0.58_0.1_72)]">.</span>
          </span>
          <p className="font-body text-xs text-[oklch(0.55_0.012_70)] text-center max-w-xs">
            Bridging millennia through conversation. Every sculpture has a story to tell.
          </p>
          <div className="flex items-center gap-3 mt-1">
            <div className="h-px w-8 bg-[oklch(0.72_0.09_75)]/40" />
            <span className="text-[oklch(0.72_0.09_75)]/60 text-xs">✦</span>
            <div className="h-px w-8 bg-[oklch(0.72_0.09_75)]/40" />
          </div>
        </div>
      </footer>
    </div>
  );
}
