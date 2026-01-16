"use client";
import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type FileUIPart } from "ai";
import { toast } from "sonner";
import { AlertCircle, X } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { useStickToBottomContext } from "use-stick-to-bottom";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Paperclip,
  Send,
  Plus,
  Square,
  Brain,
  Mic,
  MicOff,
  Info,
  Wrench,
  Trash2,
  User,
  TrendingUp,
  CheckCircle2,
  AlertCircle as AlertCircleIcon,
  XCircle,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import usePagesContext from "./hooks/usePagesContext";
import {
  AGENT_CONFIGS,
  DEFAULT_AGENT,
  getAgentConfig,
  AgentType,
  type AgentConfig,
} from "@/lib/agent-configs";
import { useAppContext } from "./providers/marketplace";
import { useAuth } from "./providers/auth";
import { Toaster } from "@/components/ui/sonner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, CartesianGrid } from "recharts";
import type { ToolUIPart } from "ai";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import type { ListBrandKitsResponse } from "@/lib/services/BrandServices";

const AI_MODELS = [
  // OpenAI - Top 3 models
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "openai/gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI" },
  { id: "openai/gpt-4", name: "GPT-4", provider: "OpenAI" },

  // Anthropic - Top 3 models
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
  },
  {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
  },
  {
    id: "anthropic/claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
  },

  // Google - Top models
  {
    id: "google/gemini-2.5-flash-image-preview",
    name: "Gemini 2.5 Flash Image Preview",
    provider: "Google",
  },
  {
    id: "google/gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash (Exp)",
    provider: "Google",
  },
  { id: "google/gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google" },
  {
    id: "google/gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "Google",
  },

  // Meta - Top 2 models (only 2 available)
  { id: "meta-llama/llama-3.1-405b", name: "Llama 3.1 405B", provider: "Meta" },
  { id: "meta-llama/llama-3.1-70b", name: "Llama 3.1 70B", provider: "Meta" },

  // Mistral AI - Top 1 model
  {
    id: "mistralai/mistral-large",
    name: "Mistral Large",
    provider: "Mistral AI",
  },
];

// Group models by provider
const groupedModels = AI_MODELS.reduce((acc, model) => {
  if (!acc[model.provider]) {
    acc[model.provider] = [];
  }
  acc[model.provider].push(model);
  return acc;
}, {} as Record<string, typeof AI_MODELS>);

// Provider order (best providers first)
const PROVIDER_ORDER = ["OpenAI", "Anthropic", "Google", "Meta", "Mistral AI"];

// Component to handle auto-scrolling when messages are added
function AutoScrollWrapper({
  children,
  messages,
  status,
}: {
  children: React.ReactNode;
  messages: Array<{ id: string; role: string; parts: unknown[] }>;
  status: string;
}) {
  const { scrollToBottom, isAtBottom } = useStickToBottomContext();
  const prevMessageCountRef = useRef(messages.length);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const messageCount = messages.length;
    const prevCount = prevMessageCountRef.current;

    // Check if a new message was added
    if (messageCount > prevCount) {
      // Clear any pending scroll timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Scroll smoothly to bottom when new message is added
      scrollTimeoutRef.current = setTimeout(() => {
        scrollToBottom();
      }, 100);
    }

    prevMessageCountRef.current = messageCount;

    // Cleanup timeout on unmount
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages.length, scrollToBottom]);

  // Also scroll during streaming
  useEffect(() => {
    if (status === "streaming" && isAtBottom) {
      // Small delay to allow content to render, then scroll smoothly
      const interval = setInterval(() => {
        scrollToBottom();
      }, 100);

      return () => clearInterval(interval);
    }
  }, [status, isAtBottom, scrollToBottom]);

  return <>{children}</>;
}

function ChatHeader({
  selectedModel,
  onModelChange,
  onNewChat,
  selectedAgent,
  onAgentChange,
  brandKits,
  selectedBrandKit,
  onBrandKitChange,
  sections,
  selectedSections,
  onSectionsChange,
  isLoadingBrandKits,
  isLoadingSections,
}: {
  selectedModel: string;
  onModelChange: (model: string) => void;
  onNewChat: () => void;
  selectedAgent: AgentType;
  onAgentChange: (agent: AgentType) => void;
  brandKits: Array<{ id: string; name: string; logo?: string | null }>;
  selectedBrandKit: string | null;
  onBrandKitChange: (brandKitId: string | null) => void;
  sections: Array<{ id: string; name: string }>;
  selectedSections: string[];
  onSectionsChange: (sectionIds: string[]) => void;
  isLoadingBrandKits: boolean;
  isLoadingSections: boolean;
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
                Powered by AI & Christian Hahn
              </p>
            </div>
          </div>
          {/* Mobile/tablet theme toggle and new chat - visible below lg */}
          <div className="flex items-center gap-2 lg:hidden">
            <Tooltip>
              <TooltipTrigger asChild>
          <Button
            variant="outline"
            onClick={onNewChat}
                  size="icon"
                  className="h-9 w-9 rounded-lg border-border bg-card shadow-sm transition-colors"
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
                  <Plus className="size-4" />
          </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground border border-border">
                Start a new Chat
              </TooltipContent>
            </Tooltip>
            <ThemeToggle />
          </div>
        </div>

        {/* Controls row - All controls side by side on larger viewports */}
        <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center lg:gap-3 lg:justify-between">

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
              {PROVIDER_ORDER.map((provider) => {
                const models = groupedModels[provider];
                if (!models || models.length === 0) return null;
                return (
                  <SelectGroup key={provider}>
                    <SelectLabel>{provider}</SelectLabel>
                    {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {model.provider}
                    </span>
                  </div>
                </SelectItem>
              ))}
                  </SelectGroup>
                );
              })}
            </SelectContent>
          </Select>

          {/* Brand Kit Dropdown */}
          <Select
            value={selectedBrandKit || undefined}
            onValueChange={(value) => {
              onBrandKitChange(value || null);
            }}
            disabled={isLoadingBrandKits}
          >
            <SelectTrigger className="h-9 w-full lg:w-[180px] rounded-lg border-border bg-card shadow-sm text-xs lg:text-sm">
              {selectedBrandKit ? (() => {
                const selectedKit = brandKits.find((kit) => kit.id === selectedBrandKit);
                if (selectedKit) {
                  return (
                    <span className="truncate">{selectedKit.name}</span>
                  );
                }
                return (
                  <SelectValue
                    placeholder={
                      isLoadingBrandKits
                        ? "Loading..."
                        : brandKits.length === 0
                        ? "No brand kits"
                        : "Brand Kit"
                    }
                  />
                );
              })() : (
                <SelectValue
                  placeholder={
                    isLoadingBrandKits
                      ? "Loading..."
                      : brandKits.length === 0
                      ? "No brand kits"
                      : "Brand Kit"
                  }
                />
              )}
            </SelectTrigger>
            <SelectContent>
              {brandKits.length === 0 && !isLoadingBrandKits ? (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No brand kits available
          </div>
              ) : (
                brandKits.map((brandKit) => (
                  <SelectItem key={brandKit.id} value={brandKit.id}>
                    <span className="truncate">{brandKit.name}</span>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {/* Sections Multi-Select Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 w-full lg:w-[180px] rounded-lg border-border bg-card shadow-sm text-xs lg:text-sm justify-between"
                disabled={!selectedBrandKit || isLoadingSections}
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
                <span className="truncate">
                  {isLoadingSections
                    ? "Loading..."
                    : selectedSections.length === 0
                    ? "Sections"
                    : `${selectedSections.length} section${
                        selectedSections.length !== 1 ? "s" : ""
                      }`}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
              <div className="p-2">
                <div className="text-sm font-medium mb-2 px-2">
                  Select Sections
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-1">
                  {sections.length === 0 ? (
                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                      {isLoadingSections
                        ? "Loading sections..."
                        : "No sections available"}
                    </div>
                  ) : (
                    sections.map((section) => (
                      <label
                        key={section.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer transition-colors"
                        style={{
                          ["--hover-bg" as string]: `${agentConfig.colors.primary}0D`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${agentConfig.colors.primary}0D`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "";
                        }}
                      >
            <Checkbox
                          checked={selectedSections.includes(section.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              onSectionsChange([
                                ...selectedSections,
                                section.id,
                              ]);
                            } else {
                              onSectionsChange(
                                selectedSections.filter(
                                  (id) => id !== section.id
                                )
                              );
                            }
                          }}
                          style={
                            selectedSections.includes(section.id)
                              ? {
                                  backgroundColor: agentConfig.colors.primary,
                                  borderColor: agentConfig.colors.primary,
                                }
                              : undefined
                          }
                        />
                        <span className="text-sm flex-1">{section.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Desktop theme toggle and new chat - visible on lg and above */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={onNewChat}
                  size="icon"
                  className="relative h-9 w-9 rounded-full transition-all hover:bg-muted"
                  aria-label="Start a new Chat"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground border border-border">
                Start a new Chat
              </TooltipContent>
            </Tooltip>
            <ThemeToggle />
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
  const topQuestions = agentConfig.predefinedQuestions.slice(0, 4);
  const moreQuestions = agentConfig.predefinedQuestions.slice(4);

  return (
    <div className="border-t border-border bg-card/50 px-3 py-3 lg:px-6 lg:py-4">
      <div className="mx-auto max-w-full">
        <div className="relative">
          {/* Questions Grid Container with Hover Area */}
          <div className="group relative">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
              {topQuestions.map((item, index) => {
            const Icon = item.icon;
                const isLastQuestion = index === topQuestions.length - 1;
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

            {/* Desktop: Subtle text link below grid - appears on hover or always visible but very subtle */}
            {moreQuestions.length > 0 && (
              <div
                className="hidden lg:flex justify-end mt-2 transition-all duration-300 ease-in-out"
                style={{
                  opacity: isTransitioning ? 0 : 1,
                  transform: isTransitioning
                    ? "translateY(10px) scale(0.95)"
                    : "translateY(0) scale(1)",
                  transitionDelay: `${topQuestions.length * 30}ms`,
                }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors duration-200 flex items-center gap-1 group-hover:text-muted-foreground/70"
                      style={{
                        ["--theme-color" as string]: themeColor,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = themeColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "";
                      }}
                    >
                      <span>View {moreQuestions.length} more questions</span>
                      <ChevronDown className="size-3 opacity-50 group-hover:opacity-70 transition-opacity" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-80 max-h-[400px] overflow-y-auto"
                    style={{
                      ["--theme-color" as string]: themeColor,
                    }}
                  >
                    {moreQuestions.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem
                          key={`${agentConfig.id}-more-${item.id}`}
                          className="flex items-start gap-3 px-3 py-2.5 cursor-pointer"
                          onClick={() => onSelect(item.question)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `${themeColor}0D`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "";
                          }}
                        >
                          <Icon className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm mb-1">{item.label}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {item.question}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Mobile: Very subtle text link */}
            {moreQuestions.length > 0 && (
              <div
                className="lg:hidden mt-1.5 flex justify-end transition-all duration-300 ease-in-out"
                style={{
                  opacity: isTransitioning ? 0 : 1,
                  transform: isTransitioning
                    ? "translateY(10px) scale(0.95)"
                    : "translateY(0) scale(1)",
                  transitionDelay: `${topQuestions.length * 30}ms`,
                }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors duration-200 flex items-center gap-1"
                      style={{
                        ["--theme-color" as string]: themeColor,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = themeColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "";
                      }}
                    >
                      <span>{moreQuestions.length} more</span>
                      <ChevronDown className="size-3 opacity-50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-[calc(100vw-2rem)] max-w-sm max-h-[400px] overflow-y-auto"
                    style={{
                      ["--theme-color" as string]: themeColor,
                    }}
                  >
                    {moreQuestions.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem
                          key={`${agentConfig.id}-more-${item.id}`}
                          className="flex items-start gap-3 px-3 py-2.5 cursor-pointer"
                          onClick={() => onSelect(item.question)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `${themeColor}0D`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "";
                          }}
                        >
                          <Icon className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm mb-1">{item.label}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {item.question}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
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
  onSubmit: (message: { text: string; files: FileUIPart[] }) => void;
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
    message: { text: string; files: FileUIPart[] },
    event: React.FormEvent
  ) => {
    event.preventDefault();
    if (message.text.trim() || message.files.length > 0) {
      if (isRecording && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
      try {
        onSubmit({ text: message.text, files: message.files });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === "string"
            ? error
            : JSON.stringify(error, null, 2);
        toast.error("Error", {
          description: errorMessage,
          duration: 10000, // Show for 10 seconds to allow reading
        });
      }
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [displayAgent, setDisplayAgent] = useState<AgentType>(DEFAULT_AGENT);
  const [userManuallySelectedAgent, setUserManuallySelectedAgent] =
    useState(false);
  const { resourceAccess } = useAppContext();
  const { getAccessTokenSilently } = useAuth();

  // Brand kit state
  const [brandKits, setBrandKits] = useState<
    Array<{ id: string; name: string; logo?: string | null }>
  >([]);
  const [selectedBrandKit, setSelectedBrandKit] = useState<string | null>(null);
  const [sections, setSections] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isLoadingBrandKits, setIsLoadingBrandKits] = useState(false);
  const [isLoadingSections, setIsLoadingSections] = useState(false);

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
  const currentAgentRef = useRef(selectedAgent);
  const userManuallySelectedAgentRef = useRef(userManuallySelectedAgent);

  // Keep refs updated
  useEffect(() => {
    currentAgentRef.current = selectedAgent;
    userManuallySelectedAgentRef.current = userManuallySelectedAgent;
  }, [selectedAgent, userManuallySelectedAgent]);

  // Load brand kits on app start (server-side)
  useEffect(() => {
    const loadBrandKits = async () => {
      setIsLoadingBrandKits(true);
      try {
        const response = await fetch("/api/brand-kits");
        if (!response.ok) {
          throw new Error(`Failed to load brand kits: ${response.statusText}`);
        }
        const data: ListBrandKitsResponse = await response.json();
        const kitsArray = Array.isArray(data.data) ? data.data : [];
        const loadedKits = kitsArray.map((kit) => ({
          id: kit.id,
          name: kit.name || kit.brandName || kit.id,
          logo: kit.logo || null,
        }));
        console.log("Loaded brand kits with logos:", loadedKits.map(k => ({ name: k.name, hasLogo: !!k.logo, logo: k.logo })));
        setBrandKits(loadedKits);
      } catch (error) {
        console.error("Failed to load brand kits:", error);
      } finally {
        setIsLoadingBrandKits(false);
      }
    };

    loadBrandKits();
  }, []);

  // Load sections when brand kit is selected (server-side)
  useEffect(() => {
    if (!selectedBrandKit) {
      setSections([]);
      setSelectedSections([]);
      return;
    }

    const loadSections = async () => {
      setIsLoadingSections(true);
      try {
        const response = await fetch(
          `/api/brand-kits/sections?brandkitId=${encodeURIComponent(selectedBrandKit)}`
        );
        if (!response.ok) {
          throw new Error(`Failed to load sections: ${response.statusText}`);
        }
        const sectionsArray = await response.json();
        const sectionsList = Array.isArray(sectionsArray)
          ? sectionsArray.map((section: { id: string; name?: string }) => ({
              id: section.id,
              name: section.name || section.id,
            }))
          : [];
        setSections(sectionsList);
        // Initially select all sections
        setSelectedSections(sectionsList.map((s) => s.id));
      } catch (error) {
        console.error("Failed to load sections:", error);
      } finally {
        setIsLoadingSections(false);
      }
    };

    loadSections();
  }, [selectedBrandKit]);

  const { messages, status, sendMessage, setMessages, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        model: selectedModel,
        contextId: resourceAccess?.[0]?.context?.preview,
      },
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
    onError: (error: unknown) => {
      console.error("[ChatInterface] Error:", error);
      let errorMessage = "An error occurred";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        // Include stack trace if available and message is short
        if (error.stack && error.message.length < 100) {
          errorMessage = `${error.message}\n\n${error.stack}`;
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object") {
        // Try to extract error message from response-like objects
        const errorObj = error as Record<string, unknown>;
        if ("message" in errorObj && typeof errorObj.message === "string") {
          errorMessage = errorObj.message;
        } else if ("error" in errorObj && typeof errorObj.error === "string") {
          errorMessage = errorObj.error;
        } else {
          errorMessage = JSON.stringify(error, null, 2);
        }
      }
      
      setErrorMessage(errorMessage);
      // Auto-hide after 15 seconds to allow reading full error
      setTimeout(() => setErrorMessage(null), 15000);
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
    onContextChange: async (context) => {
      if (!context) return;

      const templateName = context.pageInfo?.template?.name;
      const suggestedAgent = getAgentForTemplate(templateName);

      if (suggestedAgent && suggestedAgent !== currentAgentRef.current) {
        setIsTransitioning(true);
        setTimeout(() => {
          setSelectedAgent(suggestedAgent);
          setDisplayAgent(suggestedAgent);
          setTimeout(() => {
            setIsTransitioning(false);
          }, 50);
        }, 200);
      }
    },
  });

  const isStreaming = status === "streaming" || status === "submitted";
  const isThinking = status === "submitted";

  const handleNewChat = () => {
    setMessages([]);
    setUserManuallySelectedAgent(false); // Reset manual selection on new chat
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prevMessages) =>
      prevMessages.filter((msg) => msg.id !== messageId)
    );
  };

  const handleQuestionSelect = async (question: string) => {
    const accessToken = await getAccessTokenSilently();
    sendMessage(
      { text: question },
      {
        body: {
          agentType: selectedAgent,
          pageContext: pagesContext,
          brandKitId: selectedBrandKit,
          sections:
            selectedSections.length > 0
              ? selectedSections.map((id) => ({ sectionId: id }))
              : undefined,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  };

  const handleMessageSubmit = async (message: {
    text: string;
    files: FileUIPart[];
  }) => {
    try {
    const accessToken = await getAccessTokenSilently();
      if ((message.text.trim() || message.files.length > 0) && !isStreaming) {
      sendMessage(
          {
            text: message.text,
            files: message.files,
          },
        {
          body: {
            agentType: selectedAgent,
              pageContext: pagesContext,
              brandKitId: selectedBrandKit,
              sections:
                selectedSections.length > 0
                  ? selectedSections.map((id) => ({ sectionId: id }))
                  : undefined,
          },
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      }
    } catch (error) {
      let errorMessage = "An error occurred";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        // Include stack trace if available and message is short
        if (error.stack && error.message.length < 100) {
          errorMessage = `${error.message}\n\n${error.stack}`;
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object") {
        // Try to extract error message from response-like objects
        if ("message" in error && typeof error.message === "string") {
          errorMessage = error.message;
        } else if ("error" in error && typeof error.error === "string") {
          errorMessage = error.error;
        } else {
          errorMessage = JSON.stringify(error, null, 2);
        }
      }
      
      toast.error("Error", {
        description: errorMessage,
        duration: 10000, // Show for 10 seconds to allow reading
      });
    }
  };

  return (
    <>
      {errorMessage && (
        <div className="fixed top-0 left-0 right-0 z-50 w-screen bg-red-600 dark:bg-red-700 text-white shadow-lg">
          <div className="flex items-start justify-between px-6 py-4 max-w-full gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <p className="text-base font-semibold wrap-break-word whitespace-pre-wrap">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="shrink-0 hover:bg-red-700 dark:hover:bg-red-800 rounded p-1 transition-colors"
              aria-label="Close error"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}
      <PromptInputProvider>
        <div
          className={`flex h-screen flex-col bg-linear-to-br from-background via-background to-muted/20 ${
            errorMessage ? "pt-[73px]" : ""
          }`}
        >
          <ChatHeader
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            onNewChat={handleNewChat}
            selectedAgent={selectedAgent}
            onAgentChange={handleAgentChange}
            brandKits={brandKits}
            selectedBrandKit={selectedBrandKit}
            onBrandKitChange={setSelectedBrandKit}
            sections={sections}
            selectedSections={selectedSections}
            onSectionsChange={setSelectedSections}
            isLoadingBrandKits={isLoadingBrandKits}
            isLoadingSections={isLoadingSections}
          />

          <Conversation className="flex-1">
            <AutoScrollWrapper messages={messages} status={status}>
            <ConversationContent>
              {(() => {
                // Show empty state if no visible messages
                  if (messages.length === 0) {
                  return (
                    <ConversationEmptyState className="flex items-center justify-center p-1 pb-4 lg:p-4 lg:pb-8">
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
                            {currentAgentConfig.teaserCards.map(
                              (card, index) => {
                            const CardIcon = card.icon;
                            return (
                              <div
                                key={`${displayAgent}-teaser-${index}`}
                                className="group flex flex-col items-center gap-2.5 lg:gap-3 rounded-xl lg:rounded-2xl border border-border bg-card p-2.5 lg:p-6 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md"
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
                                          color:
                                            currentAgentConfig.colors.primary,
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
                              }
                            )}
                        </div>
                      </div>
                    </ConversationEmptyState>
                  );
                }

                // Render visible messages
                return (
                  <>
                      {messages.map((message, index) => {
                      const { role, parts, metadata } = message;
                      // Get agent info from metadata or use current agent for assistant messages
                      const agentType =
                        (metadata as { agentType?: AgentType })?.agentType ||
                        (role === "assistant" ? selectedAgent : undefined);
                      const agentConfig = agentType
                        ? getAgentConfig(agentType)
                        : null;

                      // Extract tool names from tool parts
                      const toolNames = parts
                        .filter(
                          (part) =>
                            part.type &&
                            typeof part.type === "string" &&
                            part.type.startsWith("tool-")
                        )
                        .map((part) => {
                          // Check if part has a toolName property
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const partAny = part as any;
                          if (partAny.toolName) {
                            return partAny.toolName;
                          }
                          // Tool type format is usually "tool-{toolName}" or similar
                          const toolType = part.type as string;
                          // Extract tool name from type (e.g., "tool-getLanguages" -> "getLanguages")
                          const toolName = toolType
                            .replace(/^tool-/, "")
                            .split("-")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                            )
                            .join(" ");
                          return toolName;
                        })
                        .filter(
                          (name, index, self) => self.indexOf(name) === index
                        ); // Remove duplicates

                        // Find the index of the analytics tool result part
                        const analyticsToolIndex = parts.findIndex(
                          (part) =>
                            typeof part.type === "string" &&
                            part.type.startsWith("tool-") &&
                            part.type.includes("getContentAnalyticsData")
                        );
                        const hasAnalyticsTool = analyticsToolIndex !== -1;

                      return (
                          <div key={index} className="relative group/message">
                            <Message from={role} className="relative">
                              {/* User message header */}
                              {role === "user" && (
                                <div className="mb-1.5 flex flex-col items-end gap-1.5 px-1">
                                  <div className="flex items-center justify-end gap-2">
                                    {/* Delete button */}
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleDeleteMessage(message.id)
                                          }
                                          className="opacity-0 group-hover/message:opacity-100 transition-all duration-200 p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                          aria-label="Delete message"
                                        >
                                          <Trash2 className="size-3" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-popover text-popover-foreground border border-border">
                                        <p className="text-sm">
                                          Delete message
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                    {/* "You" label and icon */}
                                    <span className="text-xs font-medium text-muted-foreground">
                                      You
                                    </span>
                                    <div className="flex size-5 items-center justify-center rounded-md bg-muted/50">
                                      <User className="size-3 text-muted-foreground" />
                                    </div>
                                  </div>
                                  {/* File attachments indicator */}
                                  {(() => {
                                    const fileParts = parts.filter(
                                      (p) => p.type === "file"
                                    );
                                    if (fileParts.length > 0) {
                                      return (
                                        <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1 border border-border/50">
                                          <Paperclip className="size-3 text-muted-foreground" />
                                          <span className="text-xs text-muted-foreground">
                                            {fileParts.length === 1
                                              ? (() => {
                                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                  const filePart =
                                                    fileParts[0] as any;
                                                  return (
                                                    filePart.filename ||
                                                    "1 file"
                                                  );
                                                })()
                                              : `${fileParts.length} files`}
                                          </span>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              )}
                              {/* Assistant message header */}
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
                              {toolNames.length > 0 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/50 dark:bg-muted/30 border border-border/50 hover:bg-muted dark:hover:bg-muted/50 transition-colors cursor-help group">
                                      <Wrench className="size-3 text-foreground/70 group-hover:text-foreground transition-colors" />
                                      <span className="text-xs font-medium text-foreground">
                                        Tools Used ({toolNames.length})
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="max-w-xs bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 shadow-lg p-3"
                                  >
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 pb-1 border-b border-gray-200 dark:border-gray-700">
                                        <Wrench className="size-3.5 text-foreground" />
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                          Tools Used ({toolNames.length})
                                        </p>
                                      </div>
                                      <ul className="list-disc list-inside space-y-1">
                                        {toolNames.map(
                                          (toolName, toolIndex) => (
                                            <li
                                              key={toolIndex}
                                              className="text-sm font-medium text-gray-800 dark:text-gray-200"
                                            >
                                              {toolName}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                                  {/* Delete button in assistant header */}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteMessage(message.id)
                                        }
                                        className="opacity-0 group-hover/message:opacity-100 transition-all duration-200 p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                        aria-label="Delete message"
                                      >
                                        <Trash2 className="size-3" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-popover text-popover-foreground border border-border">
                                      <p className="text-sm">Delete message</p>
                                    </TooltipContent>
                                  </Tooltip>
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
                                      // Skip text parts that come BEFORE the analytics tool result
                                      // This prevents showing raw data, but allows AI response text after the chart
                                      if (
                                        hasAnalyticsTool &&
                                        i < analyticsToolIndex
                                      ) {
                                    return null;
                                  }
                                      // Also skip text parts that look like JSON data (raw tool output)
                                      if (hasAnalyticsTool && part.text) {
                                        try {
                                          const parsed = JSON.parse(part.text);
                                          if (
                                            parsed &&
                                            typeof parsed === "object" &&
                                            "data" in parsed &&
                                            Array.isArray(parsed.data)
                                          ) {
                                            return null;
                                          }
                                        } catch {
                                          // Not JSON, allow it to render
                                        }
                                  }
                                  return (
                                    <MessageResponse key={`${role}-${i}`}>
                                      {part.text}
                                    </MessageResponse>
                                      );
                                    case "file":
                                      // File parts are handled above for user messages
                                      // For assistant messages, show file info
                                      if (role === "assistant") {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const filePart = part as any;
                                        return (
                                          <div
                                            key={`${role}-${i}`}
                                            className="my-2 flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-2"
                                          >
                                            <Paperclip className="size-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                              {filePart.filename ||
                                                "Attachment"}
                                            </span>
                                          </div>
                                        );
                                      }
                                      return null;
                                    default:
                                      // Check if this is a tool result for analytics data
                                      if (
                                        typeof part.type === "string" &&
                                        part.type.startsWith("tool-") &&
                                        part.type.includes(
                                          "getContentAnalyticsData"
                                        )
                                      ) {
                                        // Check if it's a ToolUIPart with output
                                        const toolPart = part as ToolUIPart;
                                        if (
                                          toolPart.output &&
                                          typeof toolPart.output === "object" &&
                                          "data" in toolPart.output
                                        ) {
                                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                          const analyticsData = (
                                            toolPart.output as any
                                          ).data;
                                          if (
                                            Array.isArray(analyticsData) &&
                                            analyticsData.length > 0
                                          ) {
                                            // Calculate total visits, sessions and date range
                                            const totalVisits =
                                              analyticsData.reduce(
                                                (
                                                  sum: number,
                                                  item: {
                                                    "Number Visits": number;
                                                  }
                                                ) =>
                                                  sum + item["Number Visits"],
                                                0
                                              );
                                            const totalVisitors =
                                              analyticsData.reduce(
                                                (
                                                  sum: number,
                                                  item: {
                                                    "Number Visitors": number;
                                                  }
                                                ) =>
                                                  sum +
                                                  (item["Number Visitors"] ||
                                                    0),
                                                0
                                              );
                                            const firstDate = new Date(
                                              analyticsData[0].Day
                                            );
                                            const lastDate = new Date(
                                              analyticsData[
                                                analyticsData.length - 1
                                              ].Day
                                            );
                                            const dateRange = `${firstDate.toLocaleDateString(
                                              "en-US",
                                              {
                                                month: "short",
                                                day: "numeric",
                                              }
                                            )} - ${lastDate.toLocaleDateString(
                                              "en-US",
                                              {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                              }
                                            )}`;

                                            // Chart configuration with high contrast colors
                                            const chartConfig = {
                                              visits: {
                                                label: "Number Visits",
                                                color: "hsl(221, 83%, 53%)", // Blue
                                              },
                                              visitors: {
                                                label: "Number Visitors",
                                                color: "hsl(0, 72%, 51%)", // Red/Orange
                                              },
                                            } satisfies ChartConfig;

                                            return (
                                              <Card
                                                key={`${role}-${i}`}
                                                className="my-4 w-full max-w-full"
                                              >
                                                <CardHeader>
                                                  <CardTitle>
                                                    Content Analytics
                                                  </CardTitle>
                                                  <CardDescription>
                                                    {dateRange}
                                                  </CardDescription>
                                                </CardHeader>
                                                <CardContent className="w-full">
                                                  <ChartContainer
                                                    config={chartConfig}
                                                    className="w-full"
                                                  >
                                                    <LineChart
                                                      accessibilityLayer
                                                      data={analyticsData}
                                                      margin={{
                                                        left: 12,
                                                        right: 12,
                                                      }}
                                                      aria-label={`Line chart showing daily visits from ${dateRange}`}
                                                    >
                                                      <CartesianGrid
                                                        vertical={false}
                                                      />
                                                      <XAxis
                                                        dataKey="Day"
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickMargin={8}
                                                        tickFormatter={(
                                                          value
                                                        ) => {
                                                          const date = new Date(
                                                            value
                                                          );
                                                          return date.toLocaleDateString(
                                                            "en-US",
                                                            {
                                                              month: "short",
                                                              day: "numeric",
                                                            }
                                                          );
                                                        }}
                                                      />
                                                      <ChartTooltip
                                                        cursor={false}
                                                        content={
                                                          <ChartTooltipContent />
                                                        }
                                                      />
                                                      <Line
                                                        dataKey="Number Visits"
                                                        type="monotone"
                                                        stroke="var(--color-visits)"
                                                        strokeWidth={2}
                                                        dot={false}
                                                      />
                                                      <Line
                                                        dataKey="Number Visitors"
                                                        type="monotone"
                                                        stroke="var(--color-visitors)"
                                                        strokeWidth={2}
                                                        dot={false}
                                                      />
                                                    </LineChart>
                                                  </ChartContainer>
                                                </CardContent>
                                                <CardFooter>
                                                  <div className="flex w-full items-start gap-2 text-sm">
                                                    <div className="grid gap-2">
                                                      <div className="flex items-center gap-2 leading-none font-medium">
                                                        Total:{" "}
                                                        {totalVisits.toLocaleString()}{" "}
                                                        visits,{" "}
                                                        {totalVisitors.toLocaleString()}{" "}
                                                        visitors{" "}
                                                        <TrendingUp className="h-4 w-4" />
                                                      </div>
                                                      <div className="text-muted-foreground flex items-center gap-2 leading-none">
                                                        Showing daily visits and
                                                        visitors for the last 30
                                                        days
                                                      </div>
                                                    </div>
                                                  </div>
                                                </CardFooter>
                                              </Card>
                                            );
                                          }
                                        }
                                      }
                                      // Check if this is a tool result for brand review
                                      if (
                                        typeof part.type === "string" &&
                                        part.type.startsWith("tool-") &&
                                        part.type.includes(
                                          "generateBrandReview"
                                        )
                                      ) {
                                        const toolPart = part as ToolUIPart;
                                        if (
                                          toolPart.output &&
                                          typeof toolPart.output === "object" &&
                                          "data" in toolPart.output &&
                                          "success" in toolPart.output &&
                                          toolPart.output.success === true
                                        ) {
                                          
                                          const brandReviewData = (
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            toolPart.output as any
                                          ).data;
                                          if (
                                            Array.isArray(brandReviewData) &&
                                            brandReviewData.length > 0
                                          ) {
                                            // Helper function to get score color and icon
                                            const getScoreDisplay = (
                                              score: number
                                            ) => {
                                              if (score >= 4) {
                                                return {
                                                  color: "success",
                                                  icon: CheckCircle2,
                                                  label: "Excellent",
                                                };
                                              } else if (score === 3) {
                                                return {
                                                  color: "warning",
                                                  icon: AlertCircleIcon,
                                                  label: "Good",
                                                };
                                              } else {
                                                return {
                                                  color: "danger",
                                                  icon: XCircle,
                                                  label: "Needs Improvement",
                                                };
                                              }
                                            };

                                            return (
                                              <Card
                                                key={`${role}-${i}`}
                                                className="my-4 w-full max-w-full"
                                              >
                                                <CardHeader>
                                                  <CardTitle>
                                                    Brand Review Results
                                                  </CardTitle>
                                                  <CardDescription>
                                                    Compliance analysis across{" "}
                                                    {brandReviewData.length}{" "}
                                                    section
                                                    {brandReviewData.length !==
                                                    1
                                                      ? "s"
                                                      : ""}
                                                  </CardDescription>
                                                </CardHeader>
                                                <CardContent className="w-full space-y-4">
                                                  {brandReviewData.map(
                                                    (
                                                      section: {
                                                        sectionId: string;
                                                        sectionName?: string;
                                                        score: number;
                                                        reason: string;
                                                        suggestion: string;
                                                        fields?: Array<{
                                                          fieldId: string;
                                                          fieldName?: string;
                                                          score: number;
                                                          reason: string;
                                                          suggestion: string;
                                                        }>;
                                                      },
                                                      sectionIndex: number
                                                    ) => {
                                                      const scoreDisplay =
                                                        getScoreDisplay(
                                                          section.score
                                                        );
                                                      const ScoreIcon =
                                                        scoreDisplay.icon;

                                                      return (
                                                        <Card
                                                          key={
                                                            section.sectionId
                                                          }
                                                          className={`border-l-4 ${
                                                            scoreDisplay.color ===
                                                            "success"
                                                              ? "border-l-green-500 dark:border-l-green-400"
                                                              : scoreDisplay.color ===
                                                                "warning"
                                                              ? "border-l-yellow-500 dark:border-l-yellow-400"
                                                              : "border-l-red-500 dark:border-l-red-400"
                                                          }`}
                                                        >
                                                          <CardHeader className="pb-3">
                                                            <div className="flex items-start justify-between gap-4">
                                                              <div className="flex-1">
                                                                <CardTitle className="text-base">
                                                                  {section.sectionName
                                                                    ? section.sectionName
                                                                    : `Section ${
                                                                        sectionIndex +
                                                                        1
                                                                      }`}
                                                                </CardTitle>
                                                                <CardDescription className="mt-1 text-xs font-mono">
                                                                  {
                                                                    section.sectionId
                                                                  }
                                                                </CardDescription>
                                                              </div>
                                                              <div className="flex items-center gap-2">
                                                                <Badge
                                                                  colorScheme={
                                                                    scoreDisplay.color ===
                                                                    "success"
                                                                      ? "success"
                                                                      : scoreDisplay.color ===
                                                                        "warning"
                                                                      ? "warning"
                                                                      : "danger"
                                                                  }
                                                                  size="lg"
                                                                >
                                                                  <ScoreIcon className="size-3" />
                                                                  Score:{" "}
                                                                  {
                                                                    section.score
                                                                  }
                                                                  /5
                                                                </Badge>
                                                              </div>
                                                            </div>
                                                          </CardHeader>
                                                          <CardContent className="space-y-3">
                                                            <Alert
                                                              variant={
                                                                scoreDisplay.color ===
                                                                "success"
                                                                  ? "success"
                                                                  : scoreDisplay.color ===
                                                                    "warning"
                                                                  ? "warning"
                                                                  : "danger"
                                                              }
                                                            >
                                                              <AlertTitle>
                                                                Assessment
                                                              </AlertTitle>
                                                              <AlertDescription>
                                                                {section.reason}
                                                              </AlertDescription>
                                                            </Alert>
                                                            <div className="rounded-lg border border-border bg-muted/30 p-3">
                                                              <div className="text-sm font-medium text-foreground mb-1">
                                                                Recommendation:
                                                              </div>
                                                              <div className="text-sm text-muted-foreground">
                                                                {
                                                                  section.suggestion
                                                                }
                                                              </div>
                                                            </div>
                                                            {section.fields &&
                                                              section.fields
                                                                .length > 0 && (
                                                                <div className="space-y-2 pt-2">
                                                                  <div className="text-sm font-medium text-foreground">
                                                                    Field
                                                                    Details:
                                                                  </div>
                                                                  {section.fields.map(
                                                                    (field) => {
                                                                      const fieldScoreDisplay =
                                                                        getScoreDisplay(
                                                                          field.score
                                                                        );
                                                                      const FieldIcon =
                                                                        fieldScoreDisplay.icon;
                                                                      return (
                                                                        <div
                                                                          key={
                                                                            field.fieldId
                                                                          }
                                                                          className="rounded-lg border border-border bg-background p-3 space-y-2"
                                                                        >
                                                                          <div className="flex items-center justify-between gap-2">
                                                                            <div className="flex-1 min-w-0">
                                                                              <div className="text-sm font-medium text-foreground truncate">
                                                                                {field.fieldName ||
                                                                                  field.fieldId}
                                                                              </div>
                                                                              {field.fieldName && (
                                                                                <div className="text-xs font-mono text-muted-foreground truncate mt-0.5">
                                                                                  {
                                                                                    field.fieldId
                                                                                  }
                                                                                </div>
                                                                              )}
                                                                            </div>
                                                                            <Badge
                                                                              colorScheme={
                                                                                fieldScoreDisplay.color ===
                                                                                "success"
                                                                                  ? "success"
                                                                                  : fieldScoreDisplay.color ===
                                                                                    "warning"
                                                                                  ? "warning"
                                                                                  : "danger"
                                                                              }
                                                                              size="sm"
                                                                            >
                                                                              <FieldIcon className="size-2.5" />
                                                                              {
                                                                                field.score
                                                                              }
                                                                              /5
                                                                            </Badge>
                                                                          </div>
                                                                          <div className="text-xs text-muted-foreground">
                                                                            <div className="font-medium mb-1">
                                                                              {
                                                                                field.reason
                                                                              }
                                                                            </div>
                                                                            <div className="italic">
                                                                              {
                                                                                field.suggestion
                                                                              }
                                                                            </div>
                                                                          </div>
                                                                        </div>
                                                                      );
                                                                    }
                                                                  )}
                                                                </div>
                                                              )}
                                                          </CardContent>
                                                        </Card>
                                                      );
                                                    }
                                                  )}
                                                </CardContent>
                                              </Card>
                                            );
                                          }
                                        }
                                      }
                                      // Check if this is a tool result for page screenshot
                                      if (
                                        typeof part.type === "string" &&
                                        part.type.startsWith("tool-") &&
                                        part.type.includes("getPageScreenshot")
                                      ) {
                                        const toolPart = part as ToolUIPart;
                                        if (
                                          toolPart.output &&
                                          typeof toolPart.output === "object" &&
                                          "screenshotData" in toolPart.output
                                        ) {
                                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                          const screenshotOutput = toolPart.output as any;
                                          let imageData = screenshotOutput.screenshotData;

                                          // Handle different formats of screenshot data
                                          if (typeof imageData === "string") {
                                            // If it's a raw base64 string, prepend the data URL prefix
                                            if (!imageData.startsWith("data:image")) {
                                              imageData = `data:image/png;base64,${imageData}`;
                                            }
                                          } else if (
                                            typeof imageData === "object" &&
                                            imageData !== null &&
                                            "screenshot_base64" in imageData
                                          ) {
                                            // If it's an object with screenshot_base64 property
                                            const base64Data = imageData.screenshot_base64;
                                            if (typeof base64Data === "string") {
                                              if (!base64Data.startsWith("data:image")) {
                                                imageData = `data:image/png;base64,${base64Data}`;
                                              } else {
                                                imageData = base64Data;
                                              }
                                            }
                                          }

                                          if (imageData && typeof imageData === "string") {
                                            return (
                                              <Card
                                                key={`${role}-${i}`}
                                                className="my-4 w-full max-w-full"
                                              >
                                                <CardHeader>
                                                  <CardTitle>Page Screenshot</CardTitle>
                                                  <CardDescription>
                                                    Visual representation of the page content.
                                                  </CardDescription>
                                                </CardHeader>
                                                <CardContent className="w-full">
                                                  <div className="relative w-full h-auto max-h-[600px] overflow-hidden rounded-md border border-border bg-muted flex items-center justify-center">
                                                    <img
                                                      src={imageData}
                                                      alt="Page Screenshot"
                                                      className="max-w-full h-auto object-contain"
                                                      onError={(e) => {
                                                        console.error("Error loading screenshot image:", e);
                                                        e.currentTarget.style.display = "none";
                                                      }}
                                                    />
                                                  </div>
                                                </CardContent>
                                              </Card>
                                            );
                                          }
                                        }
                                      }
                                      return null;
                              }
                            })}
                          </MessageContent>
                        </Message>
                          </div>
                      );
                    })}
                      {isThinking ||
                        (isStreaming && (
                          <div className="px-4 py-3">
                            <Message from="assistant">
                              <MessageContent>
                                <div className="flex items-center gap-3 px-1">
                                  <div className="flex size-6 items-center justify-center rounded-md bg-primary/10 dark:bg-primary/20">
                                    <Brain className="size-3.5 text-primary animate-pulse" />
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium text-muted-foreground">
                                      Thinking
                        </span>
                                    <div className="flex gap-1">
                                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
                                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
                                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" />
                      </div>
                                  </div>
                                </div>
                              </MessageContent>
                            </Message>
                          </div>
                        ))}
                  </>
                );
              })()}
            </ConversationContent>
            </AutoScrollWrapper>
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
      <Toaster />
    </>
  );
}
