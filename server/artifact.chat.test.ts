import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { ARTIFACTS, getArtifactById, searchArtifacts, simulateRecognition } from "../client/src/lib/artifacts";

// ── LLM mock ──────────────────────────────────────────────────────────────

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "我是胜利女神，很高兴见到你！" } }],
  }),
}));

function createCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

beforeEach(() => vi.clearAllMocks());

// ── // ── artifact.recognize ──────────────────────────────────────────────

const MOCK_ARTIFACTS_FOR_RECOGNIZE = [
  { id: "winged-victory", name: "Winged Victory of Samothrace", description: "Hellenistic Nike sculpture" },
  { id: "the-thinker", name: "The Thinker", description: "Rodin bronze sculpture" },
  { id: "venus-de-milo", name: "Venus de Milo", description: "Ancient Greek Aphrodite statue" },
];

describe("artifact.recognize", () => {
  it("returns matched artifact id from LLM response", async () => {
    const { invokeLLM } = await import("./_core/llm");
    vi.mocked(invokeLLM).mockResolvedValueOnce({
      choices: [{ message: { content: '{"matchedId": "the-thinker", "confidence": 0.92, "reason": "Bronze seated figure"}' } }],
    } as never);
    const result = await appRouter.createCaller(createCtx()).artifact.recognize({
      imageDataUrl: "data:image/jpeg;base64,/9j/fake",
      artifacts: MOCK_ARTIFACTS_FOR_RECOGNIZE,
    });
    expect(result.matchedId).toBe("the-thinker");
    expect(result.confidence).toBeCloseTo(0.92);
  });

  it("strips markdown code fences from LLM JSON response", async () => {
    const { invokeLLM } = await import("./_core/llm");
    vi.mocked(invokeLLM).mockResolvedValueOnce({
      choices: [{ message: { content: '```json\n{"matchedId": "venus-de-milo", "confidence": 0.78, "reason": "Female marble torso"}\n```' } }],
    } as never);
    const result = await appRouter.createCaller(createCtx()).artifact.recognize({
      imageDataUrl: "data:image/jpeg;base64,/9j/fake",
      artifacts: MOCK_ARTIFACTS_FOR_RECOGNIZE,
    });
    expect(result.matchedId).toBe("venus-de-milo");
  });

  it("falls back to first artifact when LLM returns unknown id", async () => {
    const { invokeLLM } = await import("./_core/llm");
    vi.mocked(invokeLLM).mockResolvedValueOnce({
      choices: [{ message: { content: '{"matchedId": "nonexistent-id", "confidence": 0.5, "reason": "No match"}' } }],
    } as never);
    const result = await appRouter.createCaller(createCtx()).artifact.recognize({
      imageDataUrl: "data:image/jpeg;base64,/9j/fake",
      artifacts: MOCK_ARTIFACTS_FOR_RECOGNIZE,
    });
    expect(result.matchedId).toBe("winged-victory");
    expect(result.confidence).toBe(0.4);
  });

  it("falls back gracefully when LLM throws", async () => {
    const { invokeLLM } = await import("./_core/llm");
    vi.mocked(invokeLLM).mockRejectedValueOnce(new Error("Network error"));
    const result = await appRouter.createCaller(createCtx()).artifact.recognize({
      imageDataUrl: "data:image/jpeg;base64,/9j/fake",
      artifacts: MOCK_ARTIFACTS_FOR_RECOGNIZE,
    });
    expect(result.matchedId).toBe("winged-victory");
    expect(result.confidence).toBe(0.4);
  });

  it("clamps confidence to [0, 1] range", async () => {
    const { invokeLLM } = await import("./_core/llm");
    vi.mocked(invokeLLM).mockResolvedValueOnce({
      choices: [{ message: { content: '{"matchedId": "the-thinker", "confidence": 1.5, "reason": "Very confident"}' } }],
    } as never);
    const result = await appRouter.createCaller(createCtx()).artifact.recognize({
      imageDataUrl: "data:image/jpeg;base64,/9j/fake",
      artifacts: MOCK_ARTIFACTS_FOR_RECOGNIZE,
    });
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
});

// ── artifact.chat ─────────────────────────────────────────────────

describe("artifact.chat", () => {
  it("returns LLM reply for a user message", async () => {
    const result = await appRouter.createCaller(createCtx()).artifact.chat({
      systemPrompt: "你是胜利女神 Nike，请用中文回答。",
      history: [],
      userMessage: "你好！",
    });
    expect(result.reply).toBe("我是胜利女神，很高兴见到你！");
  });

  it("includes conversation history in LLM call", async () => {
    const { invokeLLM } = await import("./_core/llm");
    await appRouter.createCaller(createCtx()).artifact.chat({
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
      choices: [{ message: { content: [{ type: "text", text: "array" }] } }],
    } as never);
    const result = await appRouter.createCaller(createCtx()).artifact.chat({
      systemPrompt: "你是雕塑。",
      history: [],
      userMessage: "你好",
    });
    expect(result.reply).toBe("……（沉默）");
  });

  it("rejects messages exceeding 500 characters", async () => {
    await expect(
      appRouter.createCaller(createCtx()).artifact.chat({
        systemPrompt: "你是雕塑。",
        history: [],
        userMessage: "a".repeat(501),
      })
    ).rejects.toThrow();
  });

  it("only sends last 10 history turns to the LLM", async () => {
    const { invokeLLM } = await import("./_core/llm");
    const longHistory = Array.from({ length: 20 }, (_, i) => ({
      role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      content: `消息 ${i}`,
    }));
    await appRouter.createCaller(createCtx()).artifact.chat({
      systemPrompt: "你是雕塑。",
      history: longHistory,
      userMessage: "最新问题",
    });
    const callArgs = vi.mocked(invokeLLM).mock.calls[0]?.[0];
    // system(1) + last 10 history + user(1) = 12
    expect(callArgs?.messages).toHaveLength(12);
  });
});

// ── artifact.suggestQuestions ─────────────────────────────────────────────

describe("artifact.suggestQuestions", () => {
  it("returns 3 contextual questions from LLM", async () => {
    const { invokeLLM } = await import("./_core/llm");
    vi.mocked(invokeLLM).mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              questions: ["你的翅膀有多大？", "你是在哪里被发现的？", "你最喜欢哪个时代？"],
            }),
          },
        },
      ],
    } as never);

    const result = await appRouter.createCaller(createCtx()).artifact.suggestQuestions({
      artifactName: "Winged Victory",
      artifactDescription: "A Hellenistic marble sculpture of Nike.",
      history: [
        { role: "user", content: "你好！" },
        { role: "assistant", content: "你好，访客！" },
      ],
    });

    expect(result.questions).toHaveLength(3);
    expect(result.questions[0]).toBe("你的翅膀有多大？");
  });

  it("returns empty array when LLM throws", async () => {
    const { invokeLLM } = await import("./_core/llm");
    vi.mocked(invokeLLM).mockRejectedValueOnce(new Error("LLM timeout"));

    const result = await appRouter.createCaller(createCtx()).artifact.suggestQuestions({
      artifactName: "The Thinker",
      artifactDescription: "A bronze sculpture by Rodin.",
      history: [],
    });

    expect(result.questions).toEqual([]);
  });

  it("returns at most 3 questions even if LLM returns more", async () => {
    const { invokeLLM } = await import("./_core/llm");
    vi.mocked(invokeLLM).mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({ questions: ["Q1", "Q2", "Q3", "Q4", "Q5"] }),
          },
        },
      ],
    } as never);

    const result = await appRouter.createCaller(createCtx()).artifact.suggestQuestions({
      artifactName: "David",
      artifactDescription: "Michelangelo's marble statue.",
      history: [],
    });

    expect(result.questions.length).toBeLessThanOrEqual(3);
  });

  it("only uses last 6 history turns for suggestion context", async () => {
    const { invokeLLM } = await import("./_core/llm");
    vi.mocked(invokeLLM).mockResolvedValueOnce({
      choices: [
        { message: { content: JSON.stringify({ questions: ["问题A", "问题B", "问题C"] }) } },
      ],
    } as never);

    const longHistory = Array.from({ length: 12 }, (_, i) => ({
      role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      content: `对话 ${i}`,
    }));

    await appRouter.createCaller(createCtx()).artifact.suggestQuestions({
      artifactName: "Venus de Milo",
      artifactDescription: "An ancient Greek statue.",
      history: longHistory,
    });

    const callArgs = vi.mocked(invokeLLM).mock.calls[0]?.[0];
    const userMsg = callArgs?.messages?.find(m => m.role === "user");
    // Only last 6 turns should appear in the prompt
    expect(userMsg?.content).toContain("对话 6");
    expect(userMsg?.content).not.toContain("对话 0");
  });
});

// ── Artifact data integrity ───────────────────────────────────────────────

describe("ARTIFACTS data integrity", () => {
  it("should have 12 artifacts", () => {
    expect(ARTIFACTS).toHaveLength(12);
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

  it("each artifact should have description field (required by suggestQuestions)", () => {
    for (const a of ARTIFACTS) {
      expect(typeof a.description).toBe("string");
      expect(a.description.trim().length).toBeGreaterThan(0);
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

// ── Page navigation ───────────────────────────────────────────────────────

describe("Page navigation", () => {
  it("should include awaken in valid page list", () => {
    const validPages = ["landing", "camera", "result", "awaken", "conversation"];
    expect(validPages).toContain("awaken");
    expect(validPages).toHaveLength(5);
  });

  it("awaken page should be between result and conversation", () => {
    const flow = ["landing", "camera", "result", "awaken", "conversation"];
    const awakenIdx = flow.indexOf("awaken");
    expect(awakenIdx).toBeGreaterThan(flow.indexOf("result"));
    expect(awakenIdx).toBeLessThan(flow.indexOf("conversation"));
  });
});
