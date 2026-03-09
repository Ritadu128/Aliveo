import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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
