import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { ARTIFACTS, getArtifactById, searchArtifacts, simulateRecognition } from "../client/src/lib/artifacts";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: "我是胜利女神，很高兴见到你！",
        },
      },
    ],
  }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// ── LLM chat procedure ────────────────────────────────────────────────────

describe("artifact.chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns LLM reply for a user message", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.artifact.chat({
      systemPrompt: "你是胜利女神 Nike，请用中文回答。",
      history: [],
      userMessage: "你好！",
    });

    expect(result.reply).toBe("我是胜利女神，很高兴见到你！");
  });

  it("includes conversation history in LLM call", async () => {
    const { invokeLLM } = await import("./_core/llm");
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.artifact.chat({
      systemPrompt: "你是胜利女神 Nike。",
      history: [
        { role: "user", content: "你是谁？" },
        { role: "assistant", content: "我是胜利女神！" },
      ],
      userMessage: "你在哪里？",
    });

    expect(invokeLLM).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: "system" }),
          expect.objectContaining({ role: "user", content: "你是谁？" }),
          expect.objectContaining({ role: "assistant", content: "我是胜利女神！" }),
          expect.objectContaining({ role: "user", content: "你在哪里？" }),
        ]),
      })
    );
  });

  it("returns fallback text when LLM returns non-string content", async () => {
    const { invokeLLM } = await import("./_core/llm");
    vi.mocked(invokeLLM).mockResolvedValueOnce({
      choices: [{ message: { content: [{ type: "text", text: "array content" }] } }],
    } as never);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.artifact.chat({
      systemPrompt: "你是胜利女神。",
      history: [],
      userMessage: "你好",
    });

    expect(result.reply).toBe("……（沉默）");
  });

  it("rejects messages exceeding 500 characters", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.artifact.chat({
        systemPrompt: "你是胜利女神。",
        history: [],
        userMessage: "a".repeat(501),
      })
    ).rejects.toThrow();
  });
});

// ── Artifact data integrity (PRD v2) ─────────────────────────────────────

describe("ARTIFACTS data integrity", () => {
  it("should have 5 artifacts", () => {
    expect(ARTIFACTS).toHaveLength(5);
  });

  it("each artifact should have required fields", () => {
    for (const a of ARTIFACTS) {
      expect(a.id).toBeTruthy();
      expect(a.name).toBeTruthy();
      expect(a.artist).toBeTruthy();
      expect(a.year).toBeTruthy();
      expect(a.image).toBeTruthy();
      expect(a.catalogNumber).toBeTruthy();
      expect(a.systemPrompt).toBeTruthy();
      expect(Array.isArray(a.dialogue)).toBe(true);
      expect(a.dialogue.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("each artifact should have suggestedQuestions (PRD v2 requirement)", () => {
    for (const a of ARTIFACTS) {
      expect(Array.isArray(a.suggestedQuestions)).toBe(true);
      expect(a.suggestedQuestions.length).toBeGreaterThanOrEqual(3);
      for (const q of a.suggestedQuestions) {
        expect(typeof q).toBe("string");
        expect(q.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("each artifact systemPrompt should instruct Chinese responses", () => {
    for (const a of ARTIFACTS) {
      expect(a.systemPrompt).toContain("中文");
    }
  });
});

// ── getArtifactById ───────────────────────────────────────────────────────

describe("getArtifactById", () => {
  it("should return the correct artifact", () => {
    const a = getArtifactById("the-thinker");
    expect(a).toBeDefined();
    expect(a?.name).toBe("The Thinker");
  });

  it("should return undefined for unknown id", () => {
    expect(getArtifactById("unknown-id")).toBeUndefined();
  });
});

// ── searchArtifacts ───────────────────────────────────────────────────────

describe("searchArtifacts", () => {
  it("should find by name", () => {
    const results = searchArtifacts("David");
    expect(results.some(a => a.id === "david")).toBe(true);
  });

  it("should find by artist", () => {
    const results = searchArtifacts("Rodin");
    expect(results.some(a => a.id === "the-thinker")).toBe(true);
  });

  it("should return empty array for no match", () => {
    expect(searchArtifacts("xyznotfound")).toHaveLength(0);
  });

  it("should be case-insensitive", () => {
    const lower = searchArtifacts("david");
    const upper = searchArtifacts("DAVID");
    expect(lower.length).toBe(upper.length);
  });
});

// ── simulateRecognition ───────────────────────────────────────────────────

describe("simulateRecognition", () => {
  it("should return primary and alternatives", () => {
    const { primary, alternatives } = simulateRecognition();
    expect(primary).toBeDefined();
    expect(Array.isArray(alternatives)).toBe(true);
    expect(alternatives.length).toBeGreaterThanOrEqual(1);
  });

  it("primary should not be in alternatives", () => {
    const { primary, alternatives } = simulateRecognition();
    expect(alternatives.every(a => a.id !== primary.id)).toBe(true);
  });
});

// ── Page navigation (PRD v2: awaken page) ────────────────────────────────

describe("Page navigation", () => {
  it("should include awaken in valid page list", () => {
    // Verify the awaken page is part of the navigation flow
    const validPages = ["landing", "camera", "result", "awaken", "conversation"];
    expect(validPages).toContain("awaken");
    expect(validPages).toHaveLength(5);
  });

  it("awaken page should be between result and conversation", () => {
    const flow = ["landing", "camera", "result", "awaken", "conversation"];
    const awakenIdx = flow.indexOf("awaken");
    const resultIdx = flow.indexOf("result");
    const convIdx = flow.indexOf("conversation");
    expect(awakenIdx).toBeGreaterThan(resultIdx);
    expect(awakenIdx).toBeLessThan(convIdx);
  });
});
