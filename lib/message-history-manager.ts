import {
  type UIMessage,
  type LanguageModel,
  generateText,
} from "ai";

const MESSAGE_THRESHOLD = 8; // Summarize when message count exceeds this

// Server-side message storage: Map<sessionKey, UIMessage[]>
// Using contextId as session key (in production, consider using a proper session ID)
const serverMessageHistory = new Map<string, UIMessage[]>();

// Track message IDs that have been summarized to prevent re-adding them
// Map<sessionKey, Set<messageId>>
const summarizedMessageIds = new Map<string, Set<string>>();

/**
 * Extract text content from UIMessage parts
 */
function extractTextFromUIMessage(msg: UIMessage): string {
  const textParts: string[] = [];

  if (msg.parts) {
    for (const part of msg.parts) {
      if (part.type === "text" && "text" in part) {
        textParts.push(part.text);
      }
    }
  }

  return textParts.join(" ").trim();
}

/**
 * Convert UIMessages to format suitable for LLM (user/assistant messages)
 */
function convertUIMessagesToLLMMessages(
  messages: UIMessage[]
): Array<{ role: "user" | "assistant"; content: string }> {
  return messages
    .map((msg) => {
      const content = extractTextFromUIMessage(msg);

      if (msg.role === "user" && content) {
        return { role: "user" as const, content };
      } else if (msg.role === "assistant" && content) {
        return { role: "assistant" as const, content };
      }
      return null;
    })
    .filter(
      (msg): msg is { role: "user" | "assistant"; content: string } =>
        msg !== null && msg.content.length > 0
    );
}

/**
 * Summarize conversation history
 */
async function summarizeMessages(
  messages: UIMessage[],
  model: LanguageModel
): Promise<string> {
  const llmMessages = convertUIMessagesToLLMMessages(messages);

  if (llmMessages.length === 0) {
    return "";
  }

  const result = await generateText({
    model,
    system:
      "You are a text summarization assistant. Your only task is to read and summarize the provided conversation text. Do NOT use any tools, do NOT make any API calls, do NOT retrieve any content. Simply read the conversation text below and provide a concise summary that captures the key points, topics discussed, important decisions made, and essential context needed to continue the conversation.",
    messages: [
      {
        role: "user",
        content: `Read the following conversation history and provide a concise summary. Do not use any tools or make any external calls. Just summarize the text:\n\n${llmMessages
          .map(
            (msg) =>
              `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
          )
          .join("\n\n")}`,
      },
    ],
  });

  return result.text;
}

/**
 * Manage message history and handle summarization when threshold is exceeded
 * @param messages - Incoming messages from the client
 * @param contextId - Session identifier (used as session key)
 * @param model - Language model to use for summarization
 * @returns Messages to use for the agent (potentially summarized)
 */
export async function getMessagesToUse(
  messages: UIMessage[],
  contextId: string,
  model: LanguageModel
): Promise<UIMessage[]> {
  // Get or initialize server-side message history for this session
  const sessionKey = contextId;
  let serverMessages = serverMessageHistory.get(sessionKey) || [];

  // Get the set of message IDs that have been summarized (to avoid re-adding them)
  const summarizedIds = summarizedMessageIds.get(sessionKey) || new Set<string>();

  // Update server-side history with incoming messages (client sends full history each time)
  // Use the client's messages as source of truth, but track what we've already processed
  const serverMessageIds = new Set(serverMessages.map((m) => m.id));

  // Find truly new messages (those not in server history AND not previously summarized)
  const newMessages = messages.filter(
    (m) => !serverMessageIds.has(m.id) && !summarizedIds.has(m.id)
  );

  // If we have new messages, add them to server history
  if (newMessages.length > 0) {
    serverMessages = [...serverMessages, ...newMessages];
  } else {
    // No new messages, use incoming messages as they might have been updated
    serverMessages = messages;
  }

  // Count user and assistant messages (summary messages are treated as regular assistant messages)
  const userAndAssistantMessages = serverMessages.filter(
    (m) => m.role === "user" || m.role === "assistant"
  );

  let messagesToUse: UIMessage[] = serverMessages;

  // Summarize when we exceed the threshold (i.e., when we have more than MESSAGE_THRESHOLD messages)
  if (userAndAssistantMessages.length > MESSAGE_THRESHOLD) {
    // Summarize messages up to the threshold
    // Keep the messages after the summarized block
    const messagesToSummarize = serverMessages.slice(
      0,
      userAndAssistantMessages.length - 1
    );
    const messagesToKeep = serverMessages.slice(
      userAndAssistantMessages.length - 1
    );

    // Track the IDs of messages being summarized to prevent re-adding them
    const idsToSummarize = new Set(messagesToSummarize.map((m) => m.id));
    const updatedSummarizedIds = new Set(summarizedIds);
    idsToSummarize.forEach((id) => updatedSummarizedIds.add(id));
    summarizedMessageIds.set(sessionKey, updatedSummarizedIds);

    // Summarize the messages
    const summaryText = await summarizeMessages(
      messagesToSummarize,
      model
    );

    // Create a summary message (treated as a regular assistant message)
    const summaryMessage: UIMessage = {
      id: `summary-${Date.now()}`,
      role: "assistant",
      parts: [
        {
          type: "text",
          text: `[Previous conversation summary]: ${summaryText}`,
        },
      ],
    };

    // Replace summarized messages with summary, keep the rest
    messagesToUse = [summaryMessage, ...messagesToKeep];
    serverMessageHistory.set(sessionKey, messagesToUse);
  } else {
    // Update server-side history with all messages
    serverMessageHistory.set(sessionKey, serverMessages);
    messagesToUse = serverMessages;
  }

  return messagesToUse;
}

