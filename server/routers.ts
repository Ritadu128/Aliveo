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
    // ── Image Recognition ─────────────────────────────────────────────────
    // Accepts a base64-encoded JPEG/PNG from the camera, sends it to the
    // multimodal LLM for analysis, and returns the best-matching artifact ID
    // along with a confidence score and a short description of what was seen.
    recognize: publicProcedure
      .input(
        z.object({
          // base64 data URL: "data:image/jpeg;base64,..."
          imageDataUrl: z.string().min(10),
          // List of artifact IDs + names the LLM can choose from
          artifacts: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              description: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const { imageDataUrl, artifacts } = input;

        const artifactList = artifacts
          .map((a, i) => `${i + 1}. id="${a.id}" name="${a.name}" — ${a.description}`)
          .join("\n");

        const systemPrompt = `你是一个专业的博物馆文物识别助手。用户会给你一张照片，你需要判断照片中的物体最像哪件文物。

可供选择的文物列表：
${artifactList}

规则：
1. 仔细分析照片中的视觉特征（形状、材质、风格、时代感等）
2. 从列表中选出最匹配的一件文物
3. 如果照片中没有明显的文物/艺术品，选择视觉上最相似的那件
4. 你的回复必须是且仅是一个合法的 JSON，格式如下，不要有任何其他文字：
{"matchedId": "文物id", "confidence": 0.85, "reason": "一句话说明匹配原因"}`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: { url: imageDataUrl, detail: "high" },
                  },
                  {
                    type: "text",
                    text: "请识别这张照片中的文物，从列表中选出最匹配的一件，直接输出 JSON。",
                  },
                ],
              },
            ],
          });

          const rawContent = response.choices?.[0]?.message?.content;
          if (typeof rawContent === "string") {
            const cleaned = rawContent
              .replace(/^```(?:json)?\s*/i, "")
              .replace(/\s*```$/i, "")
              .trim();
            const parsed = JSON.parse(cleaned) as {
              matchedId: string;
              confidence: number;
              reason: string;
            };
            // Validate the returned id exists in our list
            const valid = artifacts.find(a => a.id === parsed.matchedId);
            if (valid) {
              return {
                matchedId: parsed.matchedId,
                confidence: Math.min(1, Math.max(0, parsed.confidence ?? 0.7)),
                reason: parsed.reason ?? "",
              };
            }
          }
        } catch (err) {
          console.error("[recognize] LLM error:", err);
        }

        // Fallback: return the first artifact with low confidence
        return {
          matchedId: artifacts[0]?.id ?? "",
          confidence: 0.4,
          reason: "无法精确识别，已为您推荐相似展品",
        };
      }),

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
5. 你的回复必须是且仅是一个合法的 JSON 字符串，格式如下，不要包含任何 markdown 代码块、注释或其他文字：
{"questions": ["问题1", "问题2", "问题3"]}`;

        const userPrompt = `文物信息：${artifactName} — ${artifactDescription}

当前对话：
${conversationText || "（对话刚开始）"}

请生成3个用户最可能问的下一个问题，直接输出 JSON，不要有任何其他内容。`;

        try {
          // NOTE: Do NOT use response_format json_schema here.
          // The underlying model (Gemini with thinking mode) is incompatible with
          // json_schema response_format and silently returns empty content.
          // We instruct the model via the system prompt and parse manually instead.
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          });

          const rawContent = response.choices?.[0]?.message?.content;
          if (typeof rawContent === "string") {
            // Strip possible markdown code fences (```json ... ```) before parsing
            const cleaned = rawContent
              .replace(/^```(?:json)?\s*/i, "")
              .replace(/\s*```$/i, "")
              .trim();
            const parsed = JSON.parse(cleaned) as { questions: string[] };
            if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
              return { questions: parsed.questions.slice(0, 3) };
            }
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
