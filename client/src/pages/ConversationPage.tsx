// Aliveo — Conversation Page
// Design: Neo-Museological
// - Artifact image as blurred/dimmed background
// - Bottom floating dialog panel with speech bubble
// - Typewriter text effect for artifact dialogue
// - Museum-style progress dots
// - Fun detail: artifact "mood" indicator changes per dialogue segment

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/contexts/AppContext";

// Mood labels for each dialogue segment — fun personality detail
const MOODS = ["Contemplative", "Nostalgic", "Philosophical", "Inviting"];
const MOOD_COLORS = [
  "text-[oklch(0.55_0.08_220)]",
  "text-[oklch(0.55_0.08_50)]",
  "text-[oklch(0.55_0.08_280)]",
  "text-[oklch(0.55_0.08_140)]",
];

export default function ConversationPage() {
  const { setCurrentPage, selectedArtifact } = useApp();
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const dialogue = selectedArtifact?.dialogue ?? [];
  const currentText = dialogue[dialogueIndex] ?? "";
  const isLastDialogue = dialogueIndex >= dialogue.length - 1;

  const startTyping = useCallback((text: string) => {
    setDisplayedText("");
    setIsTyping(true);
    setIsComplete(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setIsComplete(true);
      }
    }, 28); // Typing speed
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentText) {
      const cleanup = startTyping(currentText);
      return cleanup;
    }
  }, [dialogueIndex, currentText, startTyping]);

  const handleContinue = () => {
    if (isTyping) {
      // Skip typing animation
      setDisplayedText(currentText);
      setIsTyping(false);
      setIsComplete(true);
      return;
    }
    if (isLastDialogue) {
      setCurrentPage("result");
      return;
    }
    setDialogueIndex(prev => prev + 1);
  };

  if (!selectedArtifact) {
    setCurrentPage("camera");
    return null;
  }

  const currentMood = MOODS[dialogueIndex % MOODS.length];
  const currentMoodColor = MOOD_COLORS[dialogueIndex % MOOD_COLORS.length];

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      {/* Background: artifact image, blurred and dimmed */}
      <div className="absolute inset-0">
        <img
          src={selectedArtifact.image}
          alt={selectedArtifact.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[oklch(0.15_0.01_65)]/70 backdrop-blur-[2px]" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-safe pt-6 pb-4">
        <button
          onClick={() => setCurrentPage("result")}
          className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 3L5 9L11 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-body text-sm tracking-wide">Back</span>
        </button>

        <div className="text-center">
          <p className="font-display text-white/90 text-sm font-medium">
            {selectedArtifact.name}
          </p>
        </div>

        <div className="w-12" />
      </div>

      {/* Artifact name overlay — centered on image */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-4">
        <div className="text-center animate-fade-up">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-8 bg-white/40" />
            <span className="text-[oklch(0.72_0.09_75)] text-xs">✦</span>
            <div className="h-px w-8 bg-white/40" />
          </div>
          <p className="font-label text-white/50 text-xs tracking-[0.2em] uppercase mb-2">
            {selectedArtifact.catalogNumber}
          </p>
          <h2 className="font-display text-3xl font-bold text-white/90 leading-tight">
            {selectedArtifact.name}
          </h2>
          <p className="font-label italic text-white/50 text-sm mt-1">
            {selectedArtifact.artist} · {selectedArtifact.year}
          </p>
        </div>
      </div>

      {/* Dialogue panel — bottom floating */}
      <div className="relative z-10 mx-4 mb-8 animate-fade-up-delay-2">
        <div className="bg-[oklch(0.97_0.012_80)] rounded-sm overflow-hidden shadow-2xl">
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-[oklch(0.88_0.01_75)]">
            <div className="flex items-center gap-2">
              {/* Artifact avatar indicator */}
              <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-[oklch(0.72_0.09_75)]/40">
                <img
                  src={selectedArtifact.image}
                  alt={selectedArtifact.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-display text-xs font-semibold text-[oklch(0.22_0.01_65)] leading-none">
                  {selectedArtifact.name.split(" ").slice(0, 2).join(" ")}
                </p>
                <p className={`font-label text-[0.6rem] italic ${currentMoodColor} leading-none mt-0.5`}>
                  {currentMood}
                </p>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {dialogue.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === dialogueIndex
                      ? "w-4 h-1.5 bg-[oklch(0.58_0.1_72)]"
                      : i < dialogueIndex
                      ? "w-1.5 h-1.5 bg-[oklch(0.72_0.09_75)]/60"
                      : "w-1.5 h-1.5 bg-[oklch(0.88_0.01_75)]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Dialogue text */}
          <div className="px-5 py-4 min-h-[100px]">
            <p className="font-label text-base text-[oklch(0.22_0.01_65)] leading-relaxed italic">
              "{displayedText}
              {isTyping && (
                <span className="animate-blink text-[oklch(0.72_0.09_75)]">|</span>
              )}
              {!isTyping && isComplete && (
                <span className="text-[oklch(0.72_0.09_75)]">"</span>
              )}
            </p>
          </div>

          {/* Continue button */}
          <div className="px-5 pb-5">
            <button
              onClick={handleContinue}
              className={`w-full py-3 font-body font-medium text-sm tracking-widest uppercase transition-all duration-300 ${
                isComplete
                  ? "bg-[oklch(0.22_0.01_65)] text-white hover:bg-[oklch(0.35_0.01_65)] hover:-translate-y-0.5 hover:shadow-md"
                  : "bg-[oklch(0.93_0.008_75)] text-[oklch(0.55_0.012_70)] hover:bg-[oklch(0.88_0.01_75)]"
              }`}
            >
              {isTyping
                ? "Skip →"
                : isLastDialogue
                ? "Return to Gallery"
                : "Continue →"}
            </button>
          </div>
        </div>

        {/* Decorative bottom element */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="h-px w-8 bg-white/30" />
          <span className="text-white/30 text-xs">✦</span>
          <div className="h-px w-8 bg-white/30" />
        </div>
      </div>
    </div>
  );
}
