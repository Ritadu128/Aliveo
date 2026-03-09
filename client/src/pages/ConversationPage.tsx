// Aliveo — Conversation Page (Immersive Chat Flow with LLM)
// Design: Neo-Museological
//
// Layout:
//   - Full-screen artifact image as blurred/dimmed background
//   - Top bar: back button + artifact name
//   - Chat scroll area: scrollable bubble list (artifact + user messages)
//   - Bottom: text input + send button (after intro complete)
//              OR Skip / Continue buttons (during intro)
//
// Interaction:
//   - Intro: artifact sends 4 pre-written messages one by one with typewriter effect
//   - Skip: instantly completes current typewriter animation
//   - Continue: triggers next intro message
//   - After intro: user can type messages, LLM responds as the artifact
//   - Auto-scroll to bottom on new content

import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "@/contexts/AppContext";
import { trpc } from "@/lib/trpc";

// Typing speed in ms per character
const TYPING_SPEED = 20;

type MessageRole = "artifact" | "user";

interface ChatMessage {
  id: number;
  role: MessageRole;
  text: string;
  isComplete: boolean;
}

export default function ConversationPage() {
  const { setCurrentPage, selectedArtifact } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nextIntroIndex, setNextIntroIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isLLMLoading, setIsLLMLoading] = useState(false);

  // Conversation history for LLM context (role: user/assistant)
  const llmHistoryRef = useRef<Array<{ role: "user" | "assistant"; content: string }>>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentMsgIdRef = useRef<number>(0);

  const dialogue = selectedArtifact?.dialogue ?? [];

  const chatMutation = trpc.artifact.chat.useMutation();

  // Scroll to bottom
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

  // Typewriter effect for a message
  const startTyping = useCallback((text: string, msgId: number, onDone?: () => void) => {
    setIsTyping(true);
    let charIndex = 0;

    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    typingIntervalRef.current = setInterval(() => {
      charIndex++;
      setMessages(prev =>
        prev.map(m => m.id === msgId ? { ...m, text: text.slice(0, charIndex) } : m)
      );
      scrollToBottom();

      if (charIndex >= text.length) {
        clearInterval(typingIntervalRef.current!);
        typingIntervalRef.current = null;
        setMessages(prev =>
          prev.map(m => m.id === msgId ? { ...m, text, isComplete: true } : m)
        );
        setIsTyping(false);
        onDone?.();
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
    const fullText = dialogue[nextIntroIndex - 1] ?? "";
    setMessages(prev =>
      prev.map(m =>
        m.id === currentMsgIdRef.current
          ? { ...m, text: fullText, isComplete: true }
          : m
      )
    );
    setIsTyping(false);
    scrollToBottom();
  }, [isTyping, dialogue, nextIntroIndex, scrollToBottom]);

  // Show next intro message
  const handleContinue = useCallback(() => {
    if (isTyping) return;

    if (nextIntroIndex >= dialogue.length) {
      setIntroComplete(true);
      setTimeout(() => inputRef.current?.focus(), 300);
      return;
    }

    const msgId = Date.now();
    currentMsgIdRef.current = msgId;
    const fullText = dialogue[nextIntroIndex];

    setMessages(prev => [...prev, { id: msgId, role: "artifact", text: "", isComplete: false }]);
    setNextIntroIndex(prev => prev + 1);
    scrollToBottom();

    setTimeout(() => startTyping(fullText, msgId), 80);
  }, [isTyping, nextIntroIndex, dialogue, scrollToBottom, startTyping]);

  // Auto-start first intro message
  useEffect(() => {
    if (dialogue.length > 0 && messages.length === 0) {
      const msgId = Date.now();
      currentMsgIdRef.current = msgId;
      const fullText = dialogue[0];

      setMessages([{ id: msgId, role: "artifact", text: "", isComplete: false }]);
      setNextIntroIndex(1);

      setTimeout(() => startTyping(fullText, msgId), 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, []);

  // Send user message to LLM
  const handleSend = useCallback(async () => {
    const text = userInput.trim();
    if (!text || isLLMLoading || isTyping || !selectedArtifact) return;

    setUserInput("");

    // Add user bubble
    const userMsgId = Date.now();
    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: "user", text, isComplete: true },
    ]);
    scrollToBottom();

    // Add to LLM history
    llmHistoryRef.current.push({ role: "user", content: text });

    setIsLLMLoading(true);

    try {
      const result = await chatMutation.mutateAsync({
        systemPrompt: selectedArtifact.systemPrompt,
        history: llmHistoryRef.current.slice(0, -1), // exclude the just-added user msg
        userMessage: text,
      });

      const reply = result.reply;
      llmHistoryRef.current.push({ role: "assistant", content: reply });

      // Add artifact bubble and type it
      const artifactMsgId = Date.now() + 1;
      currentMsgIdRef.current = artifactMsgId;
      setMessages(prev => [
        ...prev,
        { id: artifactMsgId, role: "artifact", text: "", isComplete: false },
      ]);
      scrollToBottom();

      setTimeout(() => startTyping(reply, artifactMsgId), 80);
    } catch {
      const errMsgId = Date.now() + 1;
      setMessages(prev => [
        ...prev,
        {
          id: errMsgId,
          role: "artifact",
          text: "……（沉默了一会儿）抱歉，我好像走神了。能再说一遍吗？",
          isComplete: true,
        },
      ]);
      scrollToBottom();
    } finally {
      setIsLLMLoading(false);
    }
  }, [userInput, isLLMLoading, isTyping, selectedArtifact, chatMutation, scrollToBottom, startTyping]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!selectedArtifact) {
    setCurrentPage("camera");
    return null;
  }

  const showContinue = !isTyping && !introComplete && nextIntroIndex < dialogue.length;
  const showFinishIntro = !isTyping && !introComplete && nextIntroIndex >= dialogue.length && messages.length > 0;

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[oklch(0.12_0.01_65)]">

      {/* ── Background ── */}
      <div className="absolute inset-0 z-0">
        <img
          src={selectedArtifact.image}
          alt={selectedArtifact.name}
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-[oklch(0.10_0.01_65)]/78 backdrop-blur-[3px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ── Top bar ── */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-6 pb-3 flex-shrink-0">
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
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden border border-white/30 flex-shrink-0">
              <img src={selectedArtifact.image} alt={selectedArtifact.name} className="w-full h-full object-cover" />
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

      {/* ── Divider ── */}
      <div className="relative z-10 mx-5 h-px bg-gradient-to-r from-transparent via-[oklch(0.72_0.09_75)]/40 to-transparent flex-shrink-0" />

      {/* ── Chat scroll area ── */}
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 py-5 space-y-4 overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {messages.map((msg, i) =>
          msg.role === "artifact" ? (
            <ArtifactBubble
              key={msg.id}
              message={msg}
              artifact={selectedArtifact}
              isLatest={i === messages.length - 1}
            />
          ) : (
            <UserBubble key={msg.id} message={msg} />
          )
        )}

        {/* Three-dot typing indicator */}
        {(isTyping && messages[messages.length - 1]?.text === "") ||
         (isLLMLoading && !isTyping) ? (
          <TypingDots />
        ) : null}

        <div className="h-2" />
      </div>

      {/* ── Bottom control area ── */}
      <div className="relative z-10 flex-shrink-0 px-4 pb-8 pt-2">
        {/* Gradient fade */}
        <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-[oklch(0.10_0.01_65)]/60 to-transparent pointer-events-none" />

        {/* INTRO MODE: Skip / Continue / Begin Chat */}
        {!introComplete && (
          <div className="flex items-center gap-3">
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

            {showFinishIntro && (
              <button
                onClick={() => {
                  setIntroComplete(true);
                  setTimeout(() => inputRef.current?.focus(), 300);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[oklch(0.72_0.09_75)] text-white font-body font-medium text-sm tracking-widest uppercase hover:bg-[oklch(0.65_0.1_72)] transition-all duration-200 active:scale-[0.98] rounded-sm shadow-lg"
              >
                <span>Start Chatting</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}

            {isTyping && (
              <div className="flex-1 opacity-0 pointer-events-none py-3.5">—</div>
            )}
          </div>
        )}

        {/* CHAT MODE: Input box */}
        {introComplete && (
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${selectedArtifact.name.split(" ")[0]}…`}
                disabled={isLLMLoading || isTyping}
                maxLength={500}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 font-body text-sm rounded-sm focus:outline-none focus:border-[oklch(0.72_0.09_75)]/60 transition-colors disabled:opacity-50"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!userInput.trim() || isLLMLoading || isTyping}
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[oklch(0.72_0.09_75)] text-white rounded-sm hover:bg-[oklch(0.65_0.1_72)] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLLMLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9H15M9 3L15 9L9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Progress dots (intro mode) */}
        {!introComplete && (
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {dialogue.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i < nextIntroIndex
                    ? i === nextIntroIndex - 1 && isTyping
                      ? "w-4 h-1.5 bg-[oklch(0.72_0.09_75)]"
                      : "w-1.5 h-1.5 bg-[oklch(0.72_0.09_75)]/70"
                    : "w-1.5 h-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
        )}

        {/* Chat mode hint */}
        {introComplete && (
          <p className="text-center text-white/30 font-label text-[0.65rem] mt-2 tracking-wide">
            ✦ 你正在与 {selectedArtifact.name.split(" ")[0]} 对话 ✦
          </p>
        )}
      </div>
    </div>
  );
}

// ── Artifact Chat Bubble ──────────────────────────────────────────────────

interface ArtifactBubbleProps {
  message: ChatMessage;
  artifact: { name: string; image: string };
  isLatest: boolean;
}

function ArtifactBubble({ message, artifact, isLatest }: ArtifactBubbleProps) {
  return (
    <div className={`flex items-end gap-2.5 transition-opacity duration-300 ${isLatest ? "opacity-100" : "opacity-80"}`}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border-2 border-[oklch(0.72_0.09_75)]/50 self-end mb-0.5">
        <img src={artifact.image} alt={artifact.name} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 max-w-[85%]">
        <p className="exhibit-label text-[oklch(0.72_0.09_75)] text-[0.6rem] mb-1 ml-1">
          {artifact.name.split(" ").slice(0, 2).join(" ")}
        </p>
        <div className="relative bg-[oklch(0.97_0.012_80)]/95 backdrop-blur-sm px-4 py-3 rounded-sm rounded-bl-none shadow-md">
          <div className="absolute left-0 top-3 bottom-3 w-[2px] bg-[oklch(0.72_0.09_75)]/60 rounded-full" />
          <p className="font-label text-[oklch(0.22_0.01_65)] text-[0.92rem] leading-[1.7] pl-2">
            {message.text}
            {!message.isComplete && message.text.length > 0 && (
              <span className="animate-blink text-[oklch(0.72_0.09_75)] ml-0.5 font-normal">|</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── User Chat Bubble ──────────────────────────────────────────────────────

function UserBubble({ message }: { message: ChatMessage }) {
  return (
    <div className="flex items-end justify-end gap-2.5">
      <div className="max-w-[80%]">
        <p className="exhibit-label text-white/40 text-[0.6rem] mb-1 mr-1 text-right">You</p>
        <div className="bg-[oklch(0.72_0.09_75)]/80 backdrop-blur-sm px-4 py-3 rounded-sm rounded-br-none shadow-md">
          <p className="font-body text-white text-[0.88rem] leading-[1.65]">
            {message.text}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Typing Dots ───────────────────────────────────────────────────────────

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
              style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
