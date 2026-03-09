import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";

// Message schema for conversation history
const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Artifact conversation via LLM
  artifact: router({
    // ── Main chat ──────────────────────────────────────────────────────────
    chat: publicProcedure
      .input(
        z.object({
          systemPrompt: z.string(),
          history: z.array(messageSchema),
          userMessage: z.string().min(1).max(500),
        })
      )
      .mutation(async ({ input }) => {
        const { systemPrompt, history, userMessage } = input;

        const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
          { role: "system", content: systemPrompt },
          ...history.slice(-10).map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user", content: userMessage },
        ];

        const response = await invokeLLM({ messages });
        const rawContent = response.choices?.[0]?.message?.content;
        const reply = typeof rawContent === "string" ? rawContent : "……（沉默）";

        return { reply };
      }),

    // ── Dynamic suggested questions ────────────────────────────────────────
    // Generates 3 contextually relevant follow-up questions based on the
    // current conversation. Called after each artifact reply so the suggestions
    // always reflect what the user is most likely to ask next.
    suggestQuestions: publicProcedure
      .input(
        z.object({
          artifactName: z.string(),
          artifactDescription: z.string(), // brief context about the artifact
          history: z.array(messageSchema), // full conversation so far
        })
      )
      .mutation(async ({ input }) => {
        const { artifactName, artifactDescription, history } = input;

        // Build a concise conversation summary for the prompt
        // Only use last 6 turns to keep the prompt short
        const recentHistory = history.slice(-6);
        const conversationText = recentHistory
          .map(m => `${m.role === "user" ? "用户" : artifactName}: ${m.content}`)
          .join("\n");

        const systemPrompt = `你是一个博物馆导览助手，负责预测用户在与文物对话时最可能提出的下一个问题。
你需要基于当前对话内容，生成3个用户最可能问的后续问题。

规则：
1. 问题必须与文物 "${artifactName}" 本身直接相关（历史、创作、外观、故事、象征意义等）
2. 问题要自然承接当前对话内容，不能与已经聊过的话题重复
3. 每个问题简短（不超过15个字），口语化，像真实用户会说的话
4. 问题要有梯度：一个关于刚才聊的延伸、一个关于文物本身的新角度、一个更深层的问题
5. 只输出 JSON，格式如下，不要有任何其他文字：
{"questions": ["问题1", "问题2", "问题3"]}`;

        const userPrompt = `文物信息：${artifactName} — ${artifactDescription}

当前对话：
${conversationText || "（对话刚开始）"}

请生成3个用户最可能问的下一个问题。`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "suggested_questions",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    questions: {
                      type: "array",
                      items: { type: "string" },
                      minItems: 3,
                      maxItems: 3,
                    },
                  },
                  required: ["questions"],
                  additionalProperties: false,
                },
              },
            },
          });

          const rawContent = response.choices?.[0]?.message?.content;
          if (typeof rawContent === "string") {
            const parsed = JSON.parse(rawContent) as { questions: string[] };
            return { questions: parsed.questions.slice(0, 3) };
          }
        } catch (err) {
          console.error("[suggestQuestions] LLM error:", err);
        }

        // Fallback: return empty so UI can hide the section gracefully
        return { questions: [] };
      }),
  }),
});

export type AppRouter = typeof appRouter;
