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
    chat: publicProcedure
      .input(
        z.object({
          systemPrompt: z.string(),
          history: z.array(messageSchema),
          userMessage: z.string().max(500),
        })
      )
      .mutation(async ({ input }) => {
        const { systemPrompt, history, userMessage } = input;

        // Build messages array for LLM
        const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
          {
            role: "system",
            content: systemPrompt,
          },
          // Include conversation history (max last 10 turns to save tokens)
          ...history.slice(-10).map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          {
            role: "user",
            content: userMessage,
          },
        ];

        const response = await invokeLLM({ messages });
        const rawContent = response.choices?.[0]?.message?.content;
        const reply = typeof rawContent === "string" ? rawContent : "……（沉默）";

        return { reply };
      }),
  }),
});

export type AppRouter = typeof appRouter;
