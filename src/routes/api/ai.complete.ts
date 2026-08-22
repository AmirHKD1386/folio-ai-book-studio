import { createFileRoute } from "@tanstack/react-router";
import type { CompleteRequest } from "@/lib/ai/types";
import { completeChat, streamChat } from "@/lib/ai/complete.server";

export const Route = createFileRoute("/api/ai/complete")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: CompleteRequest & { stream?: boolean };
        try {
          body = (await request.json()) as CompleteRequest & { stream?: boolean };
        } catch {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }
        if (!body?.messages?.length) {
          return Response.json({ error: "Nothing to send to the model." }, { status: 400 });
        }

        if (!body.stream) {
          const result = await completeChat(body);
          return Response.json(result, { status: result.ok ? 200 : 422 });
        }

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            const send = (payload: unknown) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
            };
            try {
              const result = await streamChat(body, (delta) => send({ delta }));
              if (!result.ok) {
                send({ error: result.error, retryable: result.retryable });
              } else {
                send({ usage: result.usage });
              }
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            } catch {
              send({ error: "The writing engine failed unexpectedly.", retryable: true });
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-store",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
