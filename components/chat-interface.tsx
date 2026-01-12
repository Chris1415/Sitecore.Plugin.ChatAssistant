"use client";
import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputProvider,
  usePromptInputController,
  PromptInputAttachments,
  PromptInputAttachment,
} from "@/components/ai-elements/prompt-input";
import { InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Paperclip,
  Send,
  Plus,
  Square,
  Brain,
  Mic,
  MicOff,
  Info,
} from "lucide-react";
import usePagesContext from "./hooks/usePagesContext";
import {
  createContextMessage,
  shouldShowMessage,
  CONTEXT_MESSAGE_CONFIG,
} from "@/lib/context-messages";
import {
  AGENT_CONFIGS,
  DEFAULT_AGENT,
  getAgentConfig,
  AgentType,
  type AgentConfig,
} from "@/lib/agent-configs";

const AI_MODELS = [
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "openai/gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI" },
  { id: "openai/gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI" },
  {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
  },
  {
    id: "anthropic/claude-3-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
  },
  { id: "google/gemini-pro", name: "Gemini Pro", provider: "Google" },
  { id: "google/gemini-ultra", name: "Gemini Ultra", provider: "Google" },
];

function ChatHeader({
  selectedModel,
  onModelChange,
  onNewChat,
  selectedAgent,
  onAgentChange,
  listenToContextUpdates,
  onListenToContextUpdatesChange,
}: {
  selectedModel: string;
  onModelChange: (model: string) => void;
  onNewChat: () => void;
  selectedAgent: AgentType;
  onAgentChange: (agent: AgentType) => void;
  listenToContextUpdates: boolean;
  onListenToContextUpdatesChange: (checked: boolean) => void;
}) {
  const agentConfig = getAgentConfig(selectedAgent);
  const AgentIcon = agentConfig.icon;

  return (
    <div className="border-b border-border bg-card px-3 py-3 lg:px-6 lg:py-4">
      <div className="mx-auto flex max-w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Logo and title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-3">
            <div
              className="relative flex size-8 lg:size-10 items-center justify-center rounded-lg lg:rounded-xl shadow-md transition-all duration-300 ease-in-out"
              style={{
                backgroundColor: agentConfig.colors.primary,
                boxShadow: `0 4px 6px -1px ${agentConfig.colors.primary}33`,
              }}
            >
              <AgentIcon className="size-4 lg:size-5 text-white transition-all duration-300 ease-in-out" />
            </div>
            <div>
              <h1 className="text-base lg:text-xl font-semibold tracking-tight text-foreground transition-colors duration-300 ease-in-out">
                {agentConfig.name} Assistant
              </h1>
              <p className="text-[10px] lg:text-xs text-muted-foreground">
                Powered by AI
              </p>
            </div>
          </div>
          {/* Mobile/tablet theme toggle - visible below lg */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
          </div>
        </div>

        {/* Controls row - full width on mobile/tablet, inline on desktop */}
        <div className="grid grid-cols-3 gap-2 lg:flex lg:items-center lg:gap-3">
          <Button
            variant="outline"
            onClick={onNewChat}
            className="h-10 gap-1.5 lg:gap-2 rounded-lg border-border bg-card shadow-sm transition-colors px-2.5 lg:px-4 w-full lg:w-auto"
            style={{
              ["--hover-border" as string]: `${agentConfig.colors.primary}4D`,
              ["--hover-bg" as string]: `${agentConfig.colors.primary}0D`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${agentConfig.colors.primary}4D`;
              e.currentTarget.style.backgroundColor = `${agentConfig.colors.primary}0D`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.backgroundColor = "";
            }}
          >
            <Plus className="size-3.5 lg:size-4" />
            <span className="text-xs lg:text-sm">New Chat</span>
          </Button>

          <Select
            value={selectedAgent}
            onValueChange={(value) => onAgentChange(value as AgentType)}
          >
            <SelectTrigger className="h-9 w-full lg:w-[160px] rounded-lg border-border bg-card shadow-sm text-xs lg:text-sm">
              <div className="flex items-center gap-1.5 lg:gap-2">
                <div
                  className="size-3 rounded-full shrink-0"
                  style={{ backgroundColor: agentConfig.colors.primary }}
                />
                <span className="truncate">{agentConfig.name}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {AGENT_CONFIGS.map((agent) => {
                const Icon = agent.icon;
                return (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="size-3 rounded-full"
                        style={{ backgroundColor: agent.colors.primary }}
                      />
                      <Icon className="size-3.5" />
                      <span>{agent.name}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="h-9 w-full lg:w-[180px] rounded-lg border-border bg-card shadow-sm text-xs lg:text-sm">
              <SelectValue placeholder="Model" />
            </SelectTrigger>
            <SelectContent>
              {AI_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {model.provider}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Desktop-only theme toggle - visible at lg and above */}
          <div className="hidden lg:block shrink-0">
            <ThemeToggle />
          </div>

          {/* Context updates toggle */}
          <div className="col-span-3 lg:col-span-1 flex items-center gap-2 px-1 pt-2">
            <Checkbox
              id="context-updates"
              checked={listenToContextUpdates}
              onCheckedChange={(checked) =>
                onListenToContextUpdatesChange(checked === true)
              }
            />
            <Label
              htmlFor="context-updates"
              className="text-xs lg:text-sm text-muted-foreground cursor-pointer select-none"
            >
              Listen to page updates
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}

function PredefinedQuestions({
  onSelect,
  agentConfig,
  isTransitioning,
}: {
  onSelect: (question: string) => void;
  agentConfig: AgentConfig;
  isTransitioning: boolean;
}) {
  const themeColor = agentConfig.colors.primary;

  return (
    <div className="border-t border-border bg-card/50 px-3 py-3 lg:px-6 lg:py-4">
      <div className="mx-auto max-w-full">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
          {agentConfig.predefinedQuestions.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={`${agentConfig.id}-${item.id}`}
                className="relative flex items-center transition-all duration-300 ease-in-out"
                style={{
                  opacity: isTransitioning ? 0 : 1,
                  transform: isTransitioning
                    ? "translateY(10px) scale(0.95)"
                    : "translateY(0) scale(1)",
                  transitionDelay: `${index * 30}ms`,
                }}
              >
                <Button
                  variant="outline"
                  className="h-auto w-full justify-start gap-2 lg:gap-2.5 rounded-lg lg:rounded-xl border-border bg-card px-3 lg:px-4 py-2.5 lg:py-3 pr-8 lg:pr-10 text-left text-xs lg:text-sm font-medium shadow-sm transition-all duration-300 ease-in-out active:scale-[0.98]"
                  onClick={() => onSelect(item.question)}
                  style={{
                    ["--theme-color" as string]: themeColor,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${themeColor}4D`;
                    e.currentTarget.style.backgroundColor = `${themeColor}0D`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "";
                    e.currentTarget.style.backgroundColor = "";
                  }}
                >
                  <Icon className="size-3.5 lg:size-4 shrink-0 text-muted-foreground transition-colors duration-300" />
                  <span className="line-clamp-1">{item.label}</span>
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="absolute right-2 lg:right-3 p-0.5 rounded-full text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Info className="size-3.5 lg:size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-xs text-center text-white dark:text-white"
                  >
                    {item.question}
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ChatInput({
  onSubmit,
  isStreaming,
  onAbort,
  themeColor,
}: {
  onSubmit: (message: string) => void;
  isStreaming: boolean;
  onAbort: () => void;
  themeColor: string;
}) {
  const { textInput, attachments } = usePromptInputController();
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const win = window as Window & {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
    };
    const SpeechRecognitionAPI =
      win.SpeechRecognition || win.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSpeechSupported(true);
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        textInput.setInput(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [textInput]);

  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  }, [isRecording]);

  const handleSubmit = async (
    message: { text: string; files: unknown[] },
    event: React.FormEvent
  ) => {
    event.preventDefault();
    if (message.text.trim()) {
      if (isRecording && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
      onSubmit(message.text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isStreaming) return;
      const form = e.currentTarget.closest("form");
      if (form) {
        form.requestSubmit();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    textInput.setInput(e.target.value);
  };

  return (
    <div className="border-t border-border bg-card px-3 py-3 sm:px-6 sm:py-4">
      <div className="mx-auto w-full">
        <PromptInput onSubmit={handleSubmit} accept="*/*" multiple globalDrop>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>

          <div className="flex w-full items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border border-border bg-background p-1.5 sm:p-2 shadow-sm">
            <InputGroupButton
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => attachments.openFileDialog()}
              className="shrink-0 size-8 sm:size-9 rounded-md sm:rounded-lg"
            >
              <Paperclip className="size-3.5 sm:size-4" />
            </InputGroupButton>

            <InputGroupInput
              placeholder={isRecording ? "Listening..." : "Type a message..."}
              value={textInput.value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="h-[38px] sm:h-[44px] flex-1 border-0 bg-transparent px-1.5 sm:px-2 text-sm focus-visible:outline-none focus-visible:ring-0"
            />

            {speechSupported && (
              <InputGroupButton
                type="button"
                size="sm"
                variant="ghost"
                onClick={toggleRecording}
                className={`shrink-0 size-8 sm:size-9 rounded-md sm:rounded-lg ${
                  isRecording
                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 animate-pulse"
                    : ""
                }`}
                style={
                  !isRecording
                    ? {
                        ["--hover-bg" as string]: `${themeColor}1A`,
                        ["--hover-text" as string]: themeColor,
                      }
                    : {}
                }
                onMouseEnter={(e) => {
                  if (!isRecording) {
                    e.currentTarget.style.backgroundColor = `${themeColor}1A`;
                    e.currentTarget.style.color = themeColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isRecording) {
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.color = "";
                  }
                }}
                title={isRecording ? "Stop recording" : "Start voice input"}
              >
                {isRecording ? (
                  <MicOff className="size-3.5 sm:size-4" />
                ) : (
                  <Mic className="size-3.5 sm:size-4" />
                )}
              </InputGroupButton>
            )}

            {isStreaming ? (
              <button
                type="button"
                onClick={onAbort}
                className="shrink-0 size-6 sm:size-7 flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-destructive"
              >
                <Square className="size-3 sm:size-3.5" fill="currentColor" />
              </button>
            ) : (
              <InputGroupButton
                type="submit"
                size="sm"
                variant="ghost"
                disabled={!textInput.value.trim()}
                className="shrink-0 size-8 sm:size-9 rounded-md sm:rounded-lg disabled:opacity-40"
                style={{
                  ["--hover-bg" as string]: `${themeColor}1A`,
                  ["--hover-text" as string]: themeColor,
                }}
                onMouseEnter={(e) => {
                  if (textInput.value.trim()) {
                    e.currentTarget.style.backgroundColor = `${themeColor}1A`;
                    e.currentTarget.style.color = themeColor;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                  e.currentTarget.style.color = "";
                }}
              >
                <Send className="size-3.5 sm:size-4" />
              </InputGroupButton>
            )}
          </div>
        </PromptInput>
      </div>
    </div>
  );
}

export function ChatInterface() {
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o");
  const [selectedAgent, setSelectedAgent] = useState<AgentType>(DEFAULT_AGENT);
  const [listenToContextUpdates, setListenToContextUpdates] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayAgent, setDisplayAgent] = useState<AgentType>(DEFAULT_AGENT);
  const [userManuallySelectedAgent, setUserManuallySelectedAgent] =
    useState(false);

  // Get the current agent configuration
  const currentAgentConfig = getAgentConfig(displayAgent);

  // Handle agent change with smooth transition effect
  const handleAgentChange = (newAgent: AgentType) => {
    if (newAgent === selectedAgent) return;

    setUserManuallySelectedAgent(true);
    setIsTransitioning(true);
    // Fade out current content
    setTimeout(() => {
      setSelectedAgent(newAgent);
      setDisplayAgent(newAgent);
      // Fade in new content
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 200);
  };

  // Determine agent based on template name
  const getAgentForTemplate = (
    templateName: string | undefined | null
  ): AgentType | null => {
    if (!templateName) return null;
    
    // News templates → News Agent
    if (templateName === "Article Page" || templateName === "Article Root") {
      return AgentType.News;
    }

    // Home or Page templates → Sitecore Agent
    if (templateName === "Page") {
      return AgentType.Sitecore;
    }

    return null;
  };

  // Use ref to access current value in callback (avoids stale closure)
  const listenToContextUpdatesRef = useRef(listenToContextUpdates);
  const prevListenToContextUpdatesRef = useRef(listenToContextUpdates);
  const currentAgentRef = useRef(selectedAgent);
  const userManuallySelectedAgentRef = useRef(userManuallySelectedAgent);

  // Keep refs updated
  useEffect(() => {
    currentAgentRef.current = selectedAgent;
    userManuallySelectedAgentRef.current = userManuallySelectedAgent;
  }, [selectedAgent, userManuallySelectedAgent]);

  const { messages, status, sendMessage, setMessages, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { model: selectedModel, agentType: selectedAgent },
    }),
    onFinish: ({ message }) => {
      // Add agent metadata to assistant messages
      if (message.role === "assistant") {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === message.id
              ? {
                  ...msg,
                  metadata: { agentType: currentAgentRef.current },
                }
              : msg
          )
        );
      }
    },
  });

  // Add agent metadata to assistant messages that don't have it
  useEffect(() => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        // Add agent metadata to assistant messages without it
        if (
          msg.role === "assistant" &&
          (!msg.metadata ||
            !(msg.metadata as { agentType?: AgentType })?.agentType)
        ) {
          return {
            ...msg,
            metadata: { agentType: currentAgentRef.current },
          };
        }
        return msg;
      })
    );
  }, [messages.length, setMessages]); // Trigger when new messages are added

  const { pagesContext } = usePagesContext({
    onContextChange: (context, isInitial) => {
      if (!context) return;

      console.log(
        "[ChatInterface] Pages context:",
        isInitial ? "initial" : "update",
        context,
        "| Listening:",
        listenToContextUpdatesRef.current
      );

      console.error(JSON.stringify(context.pageInfo, null, 2));

      const templateName = context.pageInfo?.template?.name;
      const suggestedAgent = getAgentForTemplate(templateName);

      if (suggestedAgent && suggestedAgent !== currentAgentRef.current) {
        console.log(
          `[ChatInterface] Auto-switching to ${suggestedAgent} agent based on template: ${templateName}`
        );
        setIsTransitioning(true);
        setTimeout(() => {
          setSelectedAgent(suggestedAgent);
          setDisplayAgent(suggestedAgent);
          setTimeout(() => {
            setIsTransitioning(false);
          }, 50);
        }, 200);
      }

      const messageText = createContextMessage(context, isInitial);

      // Always add to messages array so context is available
      setMessages([
        ...messages,
        {
          role: "system",
          id: (messages.length + 1).toString(),
          parts: [{ type: "text", text: messageText }],
        },
      ]);

      // Only send to AI if listening is enabled
      if (listenToContextUpdatesRef.current) {
        sendMessage({ text: messageText });
      } else {
        console.log(
          "[ChatInterface] Context added to messages but not sent to AI"
        );
      }
    },
  });

  // When checkbox is checked, send the current page context immediately
  useEffect(() => {
    listenToContextUpdatesRef.current = listenToContextUpdates;

    // Check if checkbox was just enabled (changed from false to true)
    if (
      listenToContextUpdates &&
      !prevListenToContextUpdatesRef.current &&
      pagesContext
    ) {
      console.log(
        "[ChatInterface] Checkbox enabled - sending current page context"
      );

      const messageText = createContextMessage(pagesContext, true);

      setMessages([
        ...messages,
        {
          role: "system",
          id: (messages.length + 1).toString(),
          parts: [{ type: "text", text: messageText }],
        },
      ]);

      sendMessage({ text: messageText });
    }

    prevListenToContextUpdatesRef.current = listenToContextUpdates;
  }, [
    listenToContextUpdates,
    pagesContext,
    messages,
    setMessages,
    sendMessage,
  ]);

  const isStreaming = status === "streaming" || status === "submitted";
  const isThinking = status === "submitted";

  const handleNewChat = () => {
    setMessages([]);
    setUserManuallySelectedAgent(false); // Reset manual selection on new chat
  };

  const handleQuestionSelect = (question: string) => {
    console.log(
      "[v0] Predefined question clicked:",
      question,
      "Status:",
      status
    );
    sendMessage({ text: question });
  };

  const handleMessageSubmit = (text: string) => {
    console.log("[v0] Message submitted:", text, "Status:", status);
    if (text.trim() && !isStreaming) {
      sendMessage({ text: text });
    }
  };

  return (
    <>
      <PromptInputProvider>
        <div className="flex h-screen flex-col bg-linear-to-br from-background via-background to-muted/20">
          <ChatHeader
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            onNewChat={handleNewChat}
            selectedAgent={selectedAgent}
            onAgentChange={handleAgentChange}
            listenToContextUpdates={listenToContextUpdates}
            onListenToContextUpdatesChange={setListenToContextUpdates}
          />

          <Conversation className="flex-1">
            <ConversationContent>
              {(() => {
                // Filter messages to get only visible ones
                const visibleMessages = messages.filter(({ parts }) => {
                  // Filter out messages that only contain context messages (when hiding is enabled)
                  if (!CONTEXT_MESSAGE_CONFIG.hideContextMessages) {
                    return true;
                  }
                  const hasVisibleContent = parts.some(
                    (part) =>
                      part.type === "text" && shouldShowMessage(part.text)
                  );
                  return hasVisibleContent;
                });

                // Show empty state if no visible messages
                if (visibleMessages.length === 0) {
                  return (
                    <ConversationEmptyState className="flex items-center justify-center p-3 pb-4 lg:p-4 lg:pb-8">
                      <div className="flex max-w-3xl flex-col items-center gap-4 lg:gap-6 text-center px-2">
                        <div className="relative flex size-12 lg:size-16 items-center justify-center">
                          <div
                            className="absolute inset-0 rounded-full blur-xl lg:blur-2xl transition-all duration-300 ease-in-out"
                            style={{
                              backgroundColor: `${currentAgentConfig.colors.primary}1A`,
                              opacity: isTransitioning ? 0 : 1,
                            }}
                          />
                          <div
                            className="relative flex size-12 lg:size-16 items-center justify-center rounded-xl lg:rounded-2xl shadow-lg transition-all duration-300 ease-in-out"
                            style={{
                              background: `linear-gradient(135deg, ${currentAgentConfig.colors.primary} 0%, ${currentAgentConfig.colors.primaryLight} 100%)`,
                              boxShadow: `0 10px 25px -5px ${currentAgentConfig.colors.primary}33`,
                              opacity: isTransitioning ? 0 : 1,
                              transform: isTransitioning
                                ? "scale(0.95)"
                                : "scale(1)",
                            }}
                          >
                            {(() => {
                              const Icon = currentAgentConfig.icon;
                              return (
                                <Icon
                                  className="size-6 lg:size-8 text-white transition-all duration-300 ease-in-out"
                                  style={{
                                    opacity: isTransitioning ? 0 : 1,
                                    transform: isTransitioning
                                      ? "rotate(-10deg)"
                                      : "rotate(0deg)",
                                  }}
                                />
                              );
                            })()}
                          </div>
                        </div>
                        <div className="space-y-1.5 lg:space-y-2">
                          <h2
                            className="text-balance text-3xl lg:text-5xl font-bold tracking-tight text-foreground transition-all duration-300 ease-in-out"
                            style={{
                              opacity: isTransitioning ? 0 : 1,
                              transform: isTransitioning
                                ? "translateY(-10px)"
                                : "translateY(0)",
                            }}
                          >
                            {currentAgentConfig.headline}
                          </h2>
                          <p
                            className="text-pretty text-base lg:text-lg leading-relaxed text-muted-foreground transition-all duration-300 ease-in-out"
                            style={{
                              opacity: isTransitioning ? 0 : 1,
                              transform: isTransitioning
                                ? "translateY(-10px)"
                                : "translateY(0)",
                              transitionDelay: "50ms",
                            }}
                          >
                            {currentAgentConfig.subheadline}
                          </p>
                        </div>
                        <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-2.5 lg:gap-4">
                          {currentAgentConfig.teaserCards.map((card, index) => {
                            const CardIcon = card.icon;
                            return (
                              <div
                                key={`${displayAgent}-teaser-${index}`}
                                className="group flex flex-col items-center gap-2.5 lg:gap-3 rounded-xl lg:rounded-2xl border border-border bg-card p-4 lg:p-6 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md"
                                style={{
                                  opacity: isTransitioning ? 0 : 1,
                                  transform: isTransitioning
                                    ? "translateY(20px) scale(0.95)"
                                    : "translateY(0) scale(1)",
                                  transitionDelay: `${index * 50}ms`,
                                  ["--theme-color" as string]:
                                    currentAgentConfig.colors.primary,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = `${currentAgentConfig.colors.primary}4D`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = "";
                                }}
                              >
                                <div
                                  className="flex size-10 lg:size-14 items-center justify-center rounded-xl lg:rounded-2xl transition-all duration-300 ease-in-out"
                                  style={{
                                    backgroundColor: `${currentAgentConfig.colors.primary}1A`,
                                  }}
                                >
                                  <CardIcon
                                    className="size-5 lg:size-6 transition-all duration-300 ease-in-out"
                                    style={{
                                      color: currentAgentConfig.colors.primary,
                                    }}
                                  />
                                </div>
                                <div className="space-y-1 text-center">
                                  <p className="text-base lg:text-xl font-semibold text-foreground transition-colors duration-300">
                                    {card.title}
                                  </p>
                                  <p className="text-xs lg:text-base text-muted-foreground leading-tight">
                                    {card.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </ConversationEmptyState>
                  );
                }

                // Render visible messages
                return (
                  <>
                    {visibleMessages.map((message, index) => {
                            const { role, parts, metadata } = message;
                            // Get agent info from metadata or use current agent for assistant messages
                            const agentType =
                              (metadata as { agentType?: AgentType })?.agentType ||
                              (role === "assistant" ? selectedAgent : undefined);
                            const agentConfig = agentType
                              ? getAgentConfig(agentType)
                              : null;

                            return (
                              <Message from={role} key={index}>
                                {role === "assistant" && agentConfig && (
                                  <div
                                    className="mb-1.5 flex items-center gap-2 px-1"
                                    style={{
                                      color: agentConfig.colors.primary,
                                    }}
                                  >
                                    <div
                                      className="flex size-5 items-center justify-center rounded-md"
                                      style={{
                                        backgroundColor: `${agentConfig.colors.primary}1A`,
                                      }}
                                    >
                                      {(() => {
                                        const Icon = agentConfig.icon;
                                        return (
                                          <Icon
                                            className="size-3"
                                            style={{
                                              color: agentConfig.colors.primary,
                                            }}
                                          />
                                        );
                                      })()}
                                    </div>
                                    <span className="text-xs font-medium">
                                      {agentConfig.name} Assistant
                                    </span>
                                  </div>
                                )}
                                <MessageContent
                                  className={
                                    role === "assistant" && agentConfig
                                      ? "transition-colors duration-300"
                                      : ""
                                  }
                                  style={
                                    role === "assistant" && agentConfig
                                      ? {
                                          backgroundColor: `${agentConfig.colors.primary}08`,
                                          borderLeft: `3px solid ${agentConfig.colors.primary}`,
                                          paddingLeft: "12px",
                                          paddingRight: "12px",
                                          paddingTop: "10px",
                                          paddingBottom: "10px",
                                          borderRadius: "8px",
                                        }
                                      : undefined
                                  }
                                >
                                  {parts.map((part, i) => {
                                    switch (part.type) {
                                      case "text":
                                        // Hide context messages from display (when enabled)
                                        if (!shouldShowMessage(part.text)) {
                                          return null;
                                        }
                                        return (
                                          <MessageResponse key={`${role}-${i}`}>
                                            {part.text}
                                          </MessageResponse>
                                        );
                                    }
                                  })}
                                </MessageContent>
                              </Message>
                            );
                          })}
                    {isThinking && (
                      <div className="flex items-center gap-2.5 px-4 py-3">
                        <Brain className="size-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm font-medium bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 dark:from-gray-400 dark:via-gray-300 dark:to-gray-400 bg-clip-text text-transparent bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]">
                          Thinking...
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <PredefinedQuestions
            onSelect={handleQuestionSelect}
            agentConfig={currentAgentConfig}
            isTransitioning={isTransitioning}
          />
          <ChatInput
            onSubmit={handleMessageSubmit}
            isStreaming={isStreaming}
            onAbort={stop}
            themeColor={currentAgentConfig.colors.primary}
          />
        </div>
      </PromptInputProvider>
    </>
  );
}
