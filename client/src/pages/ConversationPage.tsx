// Aliveo — Conversation Page (Immersive Chat Flow)
// Design: Neo-Museological
//
// Layout:
//   - Full-screen artifact image as blurred/dimmed background
//   - Top bar: back button + artifact name
//   - Chat scroll area: scrollable bubble list (artifact messages only)
//   - Bottom control bar: Skip (during typing) / Continue (after done) / End
//
// Interaction:
//   - Messages appear one by one with typewriter effect
//   - Skip button: instantly completes current typewriter animation
//   - Continue button: triggers next message bubble
//   - Auto-scroll to bottom on new content
//   - Manual scroll up to review history

import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "@/contexts/AppContext";

// Typing speed in ms per character
const TYPING_SPEED = 22;

interface ChatMessage {
  id: number;
  text: string;
  isComplete: boolean;
}

export default function ConversationPage() {
  const { setCurrentPage, selectedArtifact } = useApp();

  // All messages that have been "sent" so far
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Index of the next dialogue segment to show
  const [nextIndex, setNextIndex] = useState(0);
  // Whether the current last message is still typing
  const [isTyping, setIsTyping] = useState(false);
  // Whether all dialogues have been shown
  const [isFinished, setIsFinished] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentMsgIdRef = useRef<number>(0);

  const dialogue = selectedArtifact?.dialogue ?? [];

  // Scroll to bottom of chat
  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: smooth ? "smooth" : "instant",
        });
      }
    });
  }, []);

  // Start typing a new message
  const startTypingMessage = useCallback((text: string, msgId: number) => {
    setIsTyping(true);
    let charIndex = 0;

    // Clear any existing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    typingIntervalRef.current = setInterval(() => {
      charIndex++;
      setMessages(prev =>
        prev.map(m =>
          m.id === msgId
            ? { ...m, text: text.slice(0, charIndex) }
            : m
        )
      );
      scrollToBottom();

      if (charIndex >= text.length) {
        clearInterval(typingIntervalRef.current!);
        typingIntervalRef.current = null;
        setMessages(prev =>
          prev.map(m =>
            m.id === msgId ? { ...m, text, isComplete: true } : m
          )
        );
        setIsTyping(false);
      }
    }, TYPING_SPEED);
  }, [scrollToBottom]);

  // Skip: instantly complete current typing
  const handleSkip = useCallback(() => {
    if (!isTyping) return;
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    const fullText = dialogue[nextIndex - 1] ?? "";
    setMessages(prev =>
      prev.map(m =>
        m.id === currentMsgIdRef.current
          ? { ...m, text: fullText, isComplete: true }
          : m
      )
    );
    setIsTyping(false);
    scrollToBottom();
  }, [isTyping, dialogue, nextIndex, scrollToBottom]);

  // Continue: show next message
  const handleContinue = useCallback(() => {
    if (isTyping || isFinished) return;
    if (nextIndex >= dialogue.length) {
      setIsFinished(true);
      return;
    }

    const msgId = Date.now();
    currentMsgIdRef.current = msgId;
    const fullText = dialogue[nextIndex];

    setMessages(prev => [
      ...prev,
      { id: msgId, text: "", isComplete: false },
    ]);
    setNextIndex(prev => prev + 1);
    scrollToBottom();

    // Small delay so the bubble renders before typing starts
    setTimeout(() => startTypingMessage(fullText, msgId), 80);
  }, [isTyping, isFinished, nextIndex, dialogue, scrollToBottom, startTypingMessage]);

  // Auto-start first message on mount
  useEffect(() => {
    if (dialogue.length > 0 && messages.length === 0) {
      const msgId = Date.now();
      currentMsgIdRef.current = msgId;
      const fullText = dialogue[0];

      setMessages([{ id: msgId, text: "", isComplete: false }]);
      setNextIndex(1);

      setTimeout(() => startTypingMessage(fullText, msgId), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, []);

  if (!selectedArtifact) {
    setCurrentPage("camera");
    return null;
  }

  const isLastMessage = nextIndex >= dialogue.length && !isTyping;
  const showContinue = !isTyping && !isFinished && nextIndex < dialogue.length;
  const showEnd = !isTyping && (isFinished || (nextIndex >= dialogue.length && messages.length > 0));

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[oklch(0.12_0.01_65)]">

      {/* ── Background: artifact image, blurred & dimmed ── */}
      <div className="absolute inset-0 z-0">
        <img
          src={selectedArtifact.image}
          alt={selectedArtifact.name}
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-[oklch(0.10_0.01_65)]/75 backdrop-blur-[3px]" />
        {/* Subtle grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ── Top bar ── */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-safe-top pt-6 pb-3 flex-shrink-0">
        <button
          onClick={() => setCurrentPage("result")}
          className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 3L5 9L11 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-body text-sm">Back</span>
        </button>

        <div className="flex flex-col items-center">
          {/* Artifact avatar + name */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden border border-white/30 flex-shrink-0">
              <img
                src={selectedArtifact.image}
                alt={selectedArtifact.name}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="font-display text-white/90 text-sm font-semibold">
              {selectedArtifact.name.split(" ").slice(0, 3).join(" ")}
            </p>
          </div>
          <p className="exhibit-label text-white/40 text-[0.6rem] mt-0.5">
            {selectedArtifact.catalogNumber} · {selectedArtifact.year}
          </p>
        </div>

        <div className="w-16" />
      </div>

      {/* ── Thin gold divider ── */}
      <div className="relative z-10 mx-5 h-px bg-gradient-to-r from-transparent via-[oklch(0.72_0.09_75)]/40 to-transparent flex-shrink-0" />

      {/* ── Chat scroll area ── */}
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 py-5 space-y-4 overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {messages.map((msg, i) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            artifact={selectedArtifact}
            isLatest={i === messages.length - 1}
          />
        ))}

        {/* Typing indicator — three dots before text starts */}
        {isTyping && messages[messages.length - 1]?.text === "" && (
          <TypingDots />
        )}

        {/* Spacer so last bubble isn't hidden behind bottom bar */}
        <div className="h-4" />
      </div>

      {/* ── Bottom control bar ── */}
      <div className="relative z-10 flex-shrink-0 px-4 pb-safe-bottom pb-8 pt-3">
        {/* Gradient fade above bar */}
        <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-[oklch(0.10_0.01_65)]/60 to-transparent pointer-events-none" />

        <div className="flex items-center gap-3">
          {/* Skip button — visible only while typing */}
          {isTyping && (
            <button
              onClick={handleSkip}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-3 bg-white/10 border border-white/20 text-white/80 font-body text-sm tracking-wide hover:bg-white/20 transition-all active:scale-95 rounded-sm"
            >
              <span>Skip</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 2L9 7L3 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="11" y1="2" x2="11" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}

          {/* Continue button — visible when typing done, more to show */}
          {showContinue && (
            <button
              onClick={handleContinue}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[oklch(0.97_0.012_80)] text-[oklch(0.22_0.01_65)] font-body font-medium text-sm tracking-widest uppercase hover:bg-white transition-all duration-200 active:scale-[0.98] rounded-sm shadow-lg"
            >
              <span>Continue</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7H11M7 3L11 7L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* End / Return button */}
          {showEnd && (
            <button
              onClick={() => setCurrentPage("result")}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white/10 border border-white/25 text-white/80 font-body text-sm tracking-widest uppercase hover:bg-white/20 transition-all duration-200 active:scale-[0.98] rounded-sm"
            >
              <span>Return to Gallery</span>
            </button>
          )}

          {/* Placeholder to keep layout stable while typing with no continue */}
          {isTyping && (
            <div className="flex-1 flex items-center justify-center py-3.5 opacity-0 pointer-events-none">
              <span className="font-body text-sm">—</span>
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {dialogue.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-400 ${
                i < nextIndex
                  ? i === nextIndex - 1 && isTyping
                    ? "w-4 h-1.5 bg-[oklch(0.72_0.09_75)]"
                    : "w-1.5 h-1.5 bg-[oklch(0.72_0.09_75)]/70"
                  : "w-1.5 h-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Chat Bubble Component ──────────────────────────────────────────────────

interface ChatBubbleProps {
  message: { id: number; text: string; isComplete: boolean };
  artifact: { name: string; image: string };
  isLatest: boolean;
}

function ChatBubble({ message, artifact, isLatest }: ChatBubbleProps) {
  return (
    <div className={`flex items-end gap-2.5 transition-opacity duration-300 ${
      isLatest ? "opacity-100" : "opacity-80"
    }`}>
      {/* Artifact avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border-2 border-[oklch(0.72_0.09_75)]/50 self-end mb-0.5">
        <img
          src={artifact.image}
          alt={artifact.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Bubble */}
      <div className="flex-1 max-w-[85%]">
        {/* Sender label — only on first or latest */}
        <p className="exhibit-label text-[oklch(0.72_0.09_75)] text-[0.6rem] mb-1 ml-1">
          {artifact.name.split(" ").slice(0, 2).join(" ")}
        </p>

        <div className="relative bg-[oklch(0.97_0.012_80)]/95 backdrop-blur-sm px-4 py-3 rounded-sm rounded-bl-none shadow-md">
          {/* Decorative left accent line */}
          <div className="absolute left-0 top-3 bottom-3 w-[2px] bg-[oklch(0.72_0.09_75)]/60 rounded-full" />

          <p className="font-label text-[oklch(0.22_0.01_65)] text-[0.92rem] leading-[1.65] pl-2">
            {message.text}
            {/* Blinking cursor while typing */}
            {!message.isComplete && message.text.length > 0 && (
              <span className="animate-blink text-[oklch(0.72_0.09_75)] ml-0.5 font-normal">|</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Typing Dots (before first char appears) ───────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-end gap-2.5">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 border-2 border-[oklch(0.72_0.09_75)]/30 self-end mb-0.5" />
      <div className="bg-[oklch(0.97_0.012_80)]/90 backdrop-blur-sm px-4 py-3 rounded-sm rounded-bl-none shadow-md">
        <div className="flex items-center gap-1 h-5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[oklch(0.58_0.1_72)]"
              style={{
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
