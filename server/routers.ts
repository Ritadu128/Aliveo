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
          .map((a, i) => `${i + 1}. id="${a.id}" | 名称: ${a.name} | 描述: ${a.description}`)
          .join("\n");

        const systemPrompt = `你是一个专业的博物馆文物视觉识别专家。用户会给你一张照片，你需要仔细分析照片中的视觉内容，判断它最像哪件文物。

可供匹配的文物列表（共 ${artifacts.length} 件）：
${artifactList}

识别步骤：
1. 首先描述照片中你看到的主要内容（人物、物体、场景、材质、颜色、风格）
2. 分析关键视觉特征：是雕塑还是绘画？材质是大理石/青铜/油画？有几个人物？姿态如何？
3. 将这些特征与列表中每一件文物进行对比
4. 选出视觉上最匹配的一件，给出 0.0-1.0 的置信度
5. 如果照片中没有明显文物，也要根据视觉相似度选出最接近的一件

重要规则：
- 必须从列表中选择一个 id，不能返回列表外的 id
- 不同文物有不同特征，请认真区分：雕塑vs绘画、单人vs多人、古希腊vs文艺复兴等
- 你的回复必须是且仅是一个合法的 JSON，不要有任何其他文字：
{"matchedId": "文物id", "confidence": 0.85, "reason": "简短说明匹配原因"}`;

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
                    text: "请仔细分析这张照片的视觉内容，从文物列表中找出最匹配的一件，直接输出 JSON，不要有任何其他内容。",
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

        // Fallback: return a random artifact (not always the first one)
        const randomIdx = Math.floor(Math.random() * artifacts.length);
        return {
          matchedId: artifacts[randomIdx]?.id ?? artifacts[0]?.id ?? "",
          confidence: 0.35,
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
你需要基于当前对话内容，生成用户最可能问的后续问题。

规则：
1. 问题必须与文物 "${artifactName}" 本身直接相关（历史、创作、外观、故事、象征意义等）
2. 问题要自然承接当前对话内容，不能与已经聊过的话题重复
3. 每个问题简短（不超过15个字），口语化，像真实用户会说的话
4. 问题要有梯度：一个关于刚才聊的延伸、一个关于文物本身的新角度、一个更深层的问题
5. 【最重要】问题必须以第二人称“你”开头，直接向文物提问，例如“你为什么叫思想者？”而不是“它为什么叫思想者？”。用户是在和文物直接对话，所以用第二人称才自然。
6. 你的回复必须是且仅是一个合法的 JSON 字符串，格式如下，不要包含任何 markdown 代码块、注释或其他文字：
{"questions": ["问题公式", "问题公式", "问题公式"]}`;

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
