import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, model }: { messages: UIMessage[]; model: string } = await req.json()

  const modelMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: model || "openai/gpt-4o",
    messages: modelMessages,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    onFinish: async ({ isAborted }) => {
      if (isAborted) {
        console.log("[v0] Chat request aborted")
      }
    },
    consumeSseStream: consumeStream,
  })
}
