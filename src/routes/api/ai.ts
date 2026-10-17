import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/ai")({
  server: { handlers: { POST: async ({ request }) => {
    const { handleGeminiRequest } = await import("@/lib/gemini.server");
    return handleGeminiRequest(request);
  } } },
});