"use client";
import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
  type FileUIPart,
} from "ai";
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
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
} from "@/components/ai-elements/chain-of-thought";
import { Streamdown } from "streamdown";
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
  ChevronDown,
  CheckCircle2,
  XCircle,
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
import type { ToolUIPart } from "ai";
import { Badge } from "@/components/ui/badge";
import {
  Confirmation,
  ConfirmationTitle,
} from "@/components/ai-elements/confirmation";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { AnalyticsData } from "@/components/chat-elements/AnalyticsData";
import { BrandReview } from "@/components/chat-elements/BrandReview";
import { PageScreenshot } from "@/components/chat-elements/PageScreenshot";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import type { ListBrandKitsResponse } from "@/lib/services/BrandServices";

const AI_MODELS = [
  // OpenAI - GPT-5 models (Top 5: 1 extreme expensive, 2 very cheap, 2 moderate)
  // Ordered: cheap to expensive, with gpt-5-mini first
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    category: "moderate",
    contextSize: "128K",
    maxOutput: "16K",
    inputCost: "$2.50/M",
    outputCost: "$10.00/M",
    cache: "Read: $0.25/M",
    imageGen: null,
    webSearch: false,
  },
  {
    id: "openai/gpt-5-mini",
    name: "GPT-5 Mini",
    provider: "OpenAI",
    category: "cheap",
    contextSize: "400K",
    maxOutput: "16K",
    inputCost: "$0.25/M",
    outputCost: "$2.00/M",
    cache: "Read: $0.05/M",
    imageGen: "$0.04/image",
    webSearch: false,
  },
  {
    id: "openai/gpt-5-nano",
    name: "GPT-5 Nano",
    provider: "OpenAI",
    category: "cheap",
    contextSize: "400K",
    maxOutput: "16K",
    inputCost: "$0.05/M",
    outputCost: "$0.40/M",
    cache: null,
    imageGen: "$0.04/image",
    webSearch: false,
  },
  {
    id: "openai/gpt-5",
    name: "GPT-5",
    provider: "OpenAI",
    category: "moderate",
    contextSize: "400K",
    maxOutput: "16K",
    inputCost: "$1.25/M",
    outputCost: "$10.00/M",
    cache: "Read: $0.13/M",
    imageGen: "$0.04/image",
    webSearch: false,
  },
  {
    id: "openai/gpt-5-chat",
    name: "GPT-5 Chat",
    provider: "OpenAI",
    category: "moderate",
    contextSize: "400K",
    maxOutput: "16K",
    inputCost: "$1.25/M",
    outputCost: "$10.00/M",
    cache: "Read: $0.13/M",
    imageGen: "$0.04/image",
    webSearch: false,
  },
  {
    id: "openai/gpt-5-pro",
    name: "GPT-5 Pro",
    provider: "OpenAI",
    category: "expensive",
    contextSize: "400K",
    maxOutput: "16K",
    inputCost: "$15.00/M",
    outputCost: "$120.00/M",
    cache: "Read: $1.50/M",
    imageGen: "$0.04/image",
    webSearch: false,
  },

  // Anthropic - Claude 4.5 models (ordered: cheap to expensive)
  {
    id: "anthropic/claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    category: "cheap",
    contextSize: "200K",
    maxOutput: "4096",
    inputCost: "$1.00/M",
    outputCost: "$5.00/M",
    cache: null,
    imageGen: null,
    webSearch: false,
  },
  {
    id: "anthropic/claude-sonnet-4.5",
    name: "Claude Sonnet 4.5",
    provider: "Anthropic",
    category: "moderate",
    contextSize: "200K",
    maxOutput: "8192",
    inputCost: "$3.00/M",
    outputCost: "$15.00/M",
    cache: null,
    imageGen: null,
    webSearch: false,
  },
  {
    id: "anthropic/claude-opus-4.5",
    name: "Claude Opus 4.5",
    provider: "Anthropic",
    category: "expensive",
    contextSize: "200K",
    maxOutput: "4096",
    inputCost: "$5.00/M",
    outputCost: "$25.00/M",
    cache: null,
    imageGen: null,
    webSearch: false,
  },

  // Google - Gemini models (ordered: cheap to expensive)
  {
    id: "google/gemini-3-flash",
    name: "Gemini 3 Flash",
    provider: "Google",
    category: "cheap",
    contextSize: "1000K",
    maxOutput: "65K",
    inputCost: "$0.50/M",
    outputCost: "$3.00/M",
    cache: "Read: $0.05/M",
    imageGen: null,
    webSearch: "$14.00/K + input costs",
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    category: "moderate",
    contextSize: "1049K",
    maxOutput: "66K",
    inputCost: "$1.25/M",
    outputCost: "$10.00/M",
    cache: "Read: $0.13/M",
    imageGen: null,
    webSearch: "$35.00/K + input costs",
  },
  {
    id: "google/gemini-3-pro-preview",
    name: "Gemini 3 Pro Preview",
    provider: "Google",
    category: "moderate",
    contextSize: "1000K",
    maxOutput: "64K",
    inputCost: "$2.00/M",
    outputCost: "$12.00/M",
    cache: "Read: $0.20/M",
    imageGen: null,
    webSearch: "$14.00/K + input costs",
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

// Helper function to parse cost string and extract numeric value
// Examples: "$2.00/M" -> 2.00, "$10.00/M" -> 10.00, "$120.00/M" -> 120.00
function parseCost(costString: string | null | undefined): number {
  if (!costString) return Infinity; // Put null/undefined costs at the end
  const match = costString.match(/\$?([\d,]+\.?\d*)/);
  if (match) {
    return parseFloat(match[1].replace(/,/g, ""));
  }
  return Infinity;
}

// Sort models within each provider group by input token cost (ascending), then output token cost (ascending)
Object.keys(groupedModels).forEach((provider) => {
  groupedModels[provider].sort((a, b) => {
    const inputCostA = parseCost(a.inputCost);
    const inputCostB = parseCost(b.inputCost);

    // First sort by input cost
    if (inputCostA !== inputCostB) {
      return inputCostA - inputCostB;
    }

    // If input costs are equal, sort by output cost
    const outputCostA = parseCost(a.outputCost);
    const outputCostB = parseCost(b.outputCost);
    return outputCostA - outputCostB;
  });
});

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
                      <Tooltip key={model.id}>
                        <TooltipTrigger asChild>
                          <SelectItem value={model.id}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{model.name}</span>
                              {model.category && (
                                <Badge
                                  colorScheme={
                                    model.category === "cheap"
                                      ? "success"
                                      : model.category === "moderate"
                                      ? "warning"
                                      : "danger"
                                  }
                                  size="sm"
                                  className="text-xs"
                                >
                                  {model.category === "cheap"
                                    ? "Cheap"
                                    : model.category === "moderate"
                                    ? "Moderate"
                                    : "Expensive"}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        </TooltipTrigger>
                        <TooltipContent className="bg-popover text-popover-foreground border border-border max-w-xs">
                          <div className="space-y-2">
                            <div className="font-semibold text-sm">
                              {model.name}
                            </div>
                            <div className="text-xs space-y-1.5">
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                  Context:
                                </span>
                                <span className="font-medium">
                                  {model.contextSize || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                  Max Output:
                                </span>
                                <span className="font-medium">
                                  {model.maxOutput || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                  Input:
                                </span>
                                <span className="font-medium">
                                  {model.inputCost || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                  Output:
                                </span>
                                <span className="font-medium">
                                  {model.outputCost || "N/A"}
                                </span>
                              </div>
                              {model.cache && (
                                <div className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">
                                    Cache:
                                  </span>
                                  <span className="font-medium">
                                    {model.cache}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                  Image Gen:
                                </span>
                                <span className="font-medium">
                                  {model.imageGen || "No"}
                                </span>
                              </div>
                              {model.webSearch && (
                                <div className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">
                                    Web Search:
                                  </span>
                                  <span className="font-medium">
                                    {model.webSearch}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
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
              {selectedBrandKit ? (
                (() => {
                  const selectedKit = brandKits.find(
                    (kit) => kit.id === selectedBrandKit
                  );
                  if (selectedKit) {
                    return <span className="truncate">{selectedKit.name}</span>;
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
                })()
              ) : (
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
  isStreaming,
}: {
  onSelect: (question: string, files?: FileUIPart[]) => void;
  agentConfig: AgentConfig;
  isTransitioning: boolean;
  isStreaming: boolean;
}) {
  // Get attachments from PromptInputProvider
  const { attachments } = usePromptInputController();

  // Convert blob URL to data URL (same logic as PromptInput component)
  const convertBlobUrlToDataUrl = async (
    url: string
  ): Promise<string | null> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const handleSelect = async (question: string) => {
    // Get current attachments if any are selected
    const rawFiles = attachments?.files || [];

    if (rawFiles.length === 0) {
      onSelect(question, []);
      return;
    }

    // Convert blob URLs to data URLs asynchronously (same as PromptInput does)
    const convertedFiles = await Promise.all(
      rawFiles.map(async ({ id: _id, ...item }) => {
        // Remove id property as sendMessage expects FileUIPart[]
        void _id; // Suppress unused variable warning
        if (item.url && item.url.startsWith("blob:")) {
          const dataUrl = await convertBlobUrlToDataUrl(item.url);
          // If conversion failed, keep the original blob URL
          return {
            ...item,
            url: dataUrl ?? item.url,
          };
        }
        return item;
      })
    );

    onSelect(question, convertedFiles);
  };

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
                      className={`h-auto w-full justify-start gap-2 lg:gap-2.5 rounded-lg lg:rounded-xl border-border bg-card px-3 lg:px-4 py-2.5 lg:py-3 ${
                        item.expensive || item.new
                          ? "pr-12 lg:pr-14"
                          : "pr-8 lg:pr-10"
                      } text-left text-xs lg:text-sm font-medium shadow-sm transition-all duration-300 ease-in-out active:scale-[0.98]`}
                      onClick={() => handleSelect(item.question)}
                      disabled={isStreaming}
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
                      <span className="line-clamp-1 flex-1 min-w-0">
                        {item.label}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.new && (
                          <Badge
                            variant="default"
                            colorScheme="primary"
                            size="sm"
                            className="shrink-0"
                          >
                            New
                          </Badge>
                        )}
                        {item.expensive && (
                          <Badge
                            variant="default"
                            colorScheme="warning"
                            size="sm"
                            className="shrink-0"
                          >
                            Expensive
                          </Badge>
                        )}
                      </div>
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className={`absolute p-0.5 rounded-full text-muted-foreground/60 hover:text-muted-foreground transition-colors ${
                            item.expensive || item.new
                              ? "right-1 lg:right-2"
                              : "right-2 lg:right-3"
                          }`}
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
                          onClick={() => handleSelect(item.question)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `${themeColor}0D`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "";
                          }}
                        >
                          <Icon className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm mb-1 flex items-center gap-2">
                              {item.label}
                              {item.new && (
                                <Badge
                                  variant="default"
                                  colorScheme="primary"
                                  size="sm"
                                >
                                  New
                                </Badge>
                              )}
                              {item.expensive && (
                                <Badge
                                  variant="default"
                                  colorScheme="warning"
                                  size="sm"
                                >
                                  Expensive
                                </Badge>
                              )}
                            </div>
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
                          onClick={() =>
                            !isStreaming && handleSelect(item.question)
                          }
                          disabled={isStreaming}
                          onMouseEnter={(e) => {
                            if (!isStreaming) {
                              e.currentTarget.style.backgroundColor = `${themeColor}0D`;
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "";
                          }}
                        >
                          <Icon className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm mb-1 flex items-center gap-2">
                              {item.label}
                              {item.new && (
                                <Badge
                                  variant="default"
                                  colorScheme="primary"
                                  size="sm"
                                >
                                  New
                                </Badge>
                              )}
                              {item.expensive && (
                                <Badge
                                  variant="default"
                                  colorScheme="warning"
                                  size="sm"
                                >
                                  Expensive
                                </Badge>
                              )}
                            </div>
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
  const [selectedModel, setSelectedModel] = useState("openai/gpt-5-mini");
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
          `/api/brand-kits/sections?brandkitId=${encodeURIComponent(
            selectedBrandKit
          )}`
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

  const { pagesContext, refreshPagesContext, navigatePagesContext } =
    usePagesContext({
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

  const {
    messages,
    status,
    sendMessage,
    setMessages,
    stop,
    addToolApprovalResponse,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: () => ({
        model: selectedModel,
        contextId: resourceAccess?.[0]?.context?.preview,
        agentType: selectedAgent,
        pageContext: pagesContext,
        brandKitId: selectedBrandKit,
        sections:
          selectedSections.length > 0
            ? selectedSections.map((id) => ({ sectionId: id }))
            : undefined,
      }),
      headers: async () => {
        const accessToken = await getAccessTokenSilently();
        return {
          Authorization: `Bearer ${accessToken}`,
        };
      },
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    onFinish: ({ message }) => {
      // Add agent metadata to assistant messages
      if (message.role === "assistant") {
        const metadata = message.metadata as {
          summarizationOccurred?: boolean;
          agentType?: AgentType;
        };
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === message.id
              ? {
                  ...msg,
                  metadata: {
                    ...metadata,
                    agentType: currentAgentRef.current,
                  },
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
          const metadata = msg.metadata as {
            summarizationOccurred?: boolean;
            agentType?: AgentType;
          };
          return {
            ...msg,
            metadata: {
              ...metadata,
              agentType: currentAgentRef.current,
            },
          };
        }
        return msg;
      })
    );
  }, [messages.length, setMessages]); // Trigger when new messages are added

  // Check for refreshPages and navigatePages tool calls in the last assistant message
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return;

    // Check for refreshPages tool
    const refreshPart = lastMessage.parts?.find(
      (part) =>
        typeof part.type === "string" &&
        (part.type.includes("refreshPages") ||
          (part as { toolName?: string }).toolName === "refreshPages")
    );

    if (refreshPart) {
      refreshPagesContext();
      return;
    }

    // Check for navigatePages tool
    const navigatePart = lastMessage.parts?.find(
      (part) =>
        typeof part.type === "string" &&
        (part.type.includes("navigatePages") ||
          (part as { toolName?: string }).toolName === "navigatePages")
    );

    if (navigatePart) {
      const toolPart = navigatePart as ToolUIPart;
      const output = toolPart.output as
        | {
            language?: string | null;
            version?: number | null;
            itemId?: string | null;
          }
        | undefined;

      if (output) {
        const itemId = output.itemId;
        const language = output.language;
        const itemVersion = output.version;

        // Only call if we have itemId and language
        // Version is optional - if null/undefined, skip it (use default/latest)
        if (itemId && language) {
          // If version is explicitly provided and not null, use it
          // Otherwise, use 0 as default (which typically means latest/current version)
          navigatePagesContext({
            itemId,
            language,
            itemVersion:
              itemVersion !== null && itemVersion !== undefined
                ? itemVersion
                : 0,
          });
        }
      }
    }
  }, [messages, refreshPagesContext, navigatePagesContext]);

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

  const handleQuestionSelect = async (
    question: string,
    files?: FileUIPart[]
  ) => {
    const accessToken = await getAccessTokenSilently();
    sendMessage(
      {
        text: question,
        files: files || [],
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
              <p className="text-base font-semibold wrap-break-word whitespace-pre-wrap">
                {errorMessage}
              </p>
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

          <Conversation className="flex-1 relative">
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
                  // Find the first message with summarization flag to show note before it
                  const firstSummarizedMessageIndex = messages.findIndex(
                    (msg) =>
                      (msg.metadata as { summarizationOccurred?: boolean })
                        ?.summarizationOccurred
                  );
                  
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
                        
                        // Check for summarization metadata
                        const summarizationOccurred =
                          (metadata as { summarizationOccurred?: boolean })
                            ?.summarizationOccurred || false;

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
                            {/* Show summarization note before the first message with summarization flag */}
                            {summarizationOccurred &&
                              index === firstSummarizedMessageIndex && (
                                <div className="flex justify-center w-full my-4">
                                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm font-medium shadow-sm shrink-0">
                                    <Info className="size-4" />
                                    <span>
                                      Previous conversation history has been
                                      summarized.
                                    </span>
                                  </div>
                                </div>
                              )}
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
                                                  const filePart =
                                                    fileParts[0] as FileUIPart;
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
                                    case "reasoning":
                                      // Handle reasoning parts with ChainOfThought component
                                      if (
                                        role === "assistant" &&
                                        "text" in part &&
                                        part.text
                                      ) {
                                        return (
                                          <ChainOfThought
                                            key={`${role}-reasoning-${i}`}
                                            defaultOpen={true}
                                            className="my-4"
                                          >
                                            <ChainOfThoughtHeader>
                                              Chain of Thought
                                            </ChainOfThoughtHeader>
                                            <ChainOfThoughtContent>
                                              <Streamdown className="prose prose-sm dark:prose-invert max-w-none">
                                                {part.text}
                                              </Streamdown>
                                            </ChainOfThoughtContent>
                                          </ChainOfThought>
                                        );
                                      }
                                      return null;
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
                                      // Handle tool parts with state-based rendering
                                      if (
                                        typeof part.type === "string" &&
                                        part.type.startsWith("tool-")
                                      ) {
                                        const toolPart = part as ToolUIPart;
                                        const toolType = part.type as string;

                                        // Handle different tool states
                                        switch (toolPart.state) {
                                          case "approval-requested":
                                            // Tool needs approval before execution
                                            // Find the approval request in the current message parts
                                            const approvalRequest = parts.find(
                                              (p) =>
                                                p.type ===
                                                  "tool-approval-request" &&
                                                (p as { toolCallId?: string })
                                                  .toolCallId ===
                                                  toolPart.toolCallId
                                            ) as
                                              | {
                                                  approvalId?: string;
                                                  toolCallId?: string;
                                                }
                                              | undefined;

                                            // Also check previous messages for approval requests
                                            const previousApprovalRequest =
                                              messages
                                                .slice(0, index + 1)
                                                .reverse()
                                                .find((msg) =>
                                                  msg.parts?.some(
                                                    (p) =>
                                                      p.type ===
                                                        "tool-approval-request" &&
                                                      (
                                                        p as {
                                                          toolCallId?: string;
                                                        }
                                                      ).toolCallId ===
                                                        toolPart.toolCallId
                                                  )
                                                )
                                                ?.parts?.find(
                                                  (p) =>
                                                    p.type ===
                                                      "tool-approval-request" &&
                                                    (
                                                      p as {
                                                        toolCallId?: string;
                                                      }
                                                    ).toolCallId ===
                                                      toolPart.toolCallId
                                                ) as
                                                | {
                                                    approvalId?: string;
                                                    toolCallId?: string;
                                                  }
                                                | undefined;

                                            // Get approval ID - prioritize approval request, then check toolPart.approval
                                            let approvalId: string | undefined;

                                            if (approvalRequest?.approvalId) {
                                              approvalId =
                                                approvalRequest.approvalId;
                                            } else if (
                                              previousApprovalRequest?.approvalId
                                            ) {
                                              approvalId =
                                                previousApprovalRequest.approvalId;
                                            } else if (
                                              toolPart.approval &&
                                              typeof toolPart.approval ===
                                                "object" &&
                                              "id" in toolPart.approval
                                            ) {
                                              approvalId = (
                                                toolPart.approval as {
                                                  id: string;
                                                }
                                              ).id;
                                            } else if (toolPart.toolCallId) {
                                              // Fallback: use toolCallId if no approvalId found
                                              approvalId = toolPart.toolCallId;
                                            }

                                            // Handler function for approval responses
                                            const handleApproval = (
                                              approved: boolean
                                            ) => {
                                              if (!approvalId) {
                                                console.error(
                                                  "[ChatInterface] Cannot send approval: approvalId not found",
                                                  {
                                                    toolCallId:
                                                      toolPart.toolCallId,
                                                    approvalRequest,
                                                    previousApprovalRequest,
                                                    toolPartApproval:
                                                      toolPart.approval,
                                                    allParts: parts.map(
                                                      (p) => ({
                                                        type: p.type,
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        toolCallId: (p as any)
                                                          .toolCallId,
                                                      })
                                                    ),
                                                  }
                                                );
                                                return;
                                              }

                                              try {
                                                console.log(
                                                  "[ChatInterface] Sending approval response:",
                                                  {
                                                    approvalId,
                                                    approved,
                                                    toolCallId:
                                                      toolPart.toolCallId,
                                                  }
                                                );

                                                addToolApprovalResponse({
                                                  id: approvalId,
                                                  approved: approved,
                                                });

                                                console.log(
                                                  "[ChatInterface] Approval response sent successfully"
                                                );
                                              } catch (error) {
                                                console.error(
                                                  "[ChatInterface] Error sending approval response:",
                                                  error
                                                );
                                                toast.error(
                                                  "Failed to send approval response",
                                                  {
                                                    description:
                                                      error instanceof Error
                                                        ? error.message
                                                        : "Unknown error",
                                                  }
                                                );
                                              }
                                            };

                                            return (
                                              <Tool
                                                key={`${role}-${i}`}
                                                defaultOpen
                                              >
                                                <ToolHeader
                                                  type={toolPart.type}
                                                  state={toolPart.state}
                                                />
                                                <ToolContent>
                                                  <ToolInput
                                                    input={toolPart.input}
                                                  />
                                                  {approvalId ? (
                                                    <div className="flex items-center justify-end gap-2 p-4">
                                                      <Button
                                                        size="sm"
                                                        className="gap-2"
                                                        onClick={() =>
                                                          handleApproval(true)
                                                        }
                                                      >
                                                        <CheckCircle2 className="size-4" />
                                                        Approve
                                                      </Button>
                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-2"
                                                        onClick={() =>
                                                          handleApproval(false)
                                                        }
                                                      >
                                                        <XCircle className="size-4" />
                                                        Deny
                                                      </Button>
                                                    </div>
                                                  ) : (
                                                    <div className="p-4 text-sm text-muted-foreground">
                                                      Error: Approval ID not
                                                      found. Please check the
                                                      console.
                                                    </div>
                                                  )}
                                                </ToolContent>
                                              </Tool>
                                            );

                                          case "input-available":
                                            // Tool is being called, show loading state
                                            if (
                                              toolType.includes(
                                                "getContentAnalyticsData"
                                              )
                                            ) {
                                              return (
                                                <div
                                                  key={`${role}-${i}`}
                                                  className="my-2 flex items-center gap-2 text-sm text-muted-foreground"
                                                >
                                                  <Brain className="size-4 animate-pulse" />
                                                  Loading analytics data...
                                                </div>
                                              );
                                            }
                                            if (
                                              toolType.includes(
                                                "generateBrandReview"
                                              )
                                            ) {
                                              return (
                                                <div
                                                  key={`${role}-${i}`}
                                                  className="my-2 flex items-center gap-2 text-sm text-muted-foreground"
                                                >
                                                  <Brain className="size-4 animate-pulse" />
                                                  Analyzing brand compliance...
                                                </div>
                                              );
                                            }
                                            if (
                                              toolType.includes(
                                                "getPageScreenshot"
                                              )
                                            ) {
                                              return (
                                                <div
                                                  key={`${role}-${i}`}
                                                  className="my-2 flex items-center gap-2 text-sm text-muted-foreground"
                                                >
                                                  <Brain className="size-4 animate-pulse" />
                                                  Capturing page screenshot...
                                                </div>
                                              );
                                            }
                                            // Generic loading state for other tools
                                            return (
                                              <div
                                                key={`${role}-${i}`}
                                                className="my-2 flex items-center gap-2 text-sm text-muted-foreground"
                                              >
                                                <Brain className="size-4 animate-pulse" />
                                                Processing...
                                              </div>
                                            );

                                          case "approval-responded":
                                            // Approval was given, tool is executing or completed
                                            return (
                                              <Tool
                                                key={`${role}-${i}`}
                                                defaultOpen
                                              >
                                                <ToolHeader
                                                  type={toolPart.type}
                                                  state={toolPart.state}
                                                />
                                                <ToolContent>
                                                  <ToolInput
                                                    input={toolPart.input}
                                                  />
                                                  <Confirmation
                                                    approval={toolPart.approval}
                                                    state={toolPart.state}
                                                    className="m-4"
                                                  >
                                                    <ConfirmationTitle>
                                                      {toolPart.approval
                                                        ?.approved
                                                        ? "Approval granted. Tool is executing..."
                                                        : "Approval denied."}
                                                    </ConfirmationTitle>
                                                  </Confirmation>
                                                  {(() => {
                                                    const partWithOutput =
                                                      toolPart as ToolUIPart & {
                                                        output?: ToolUIPart["output"];
                                                      };
                                                    return partWithOutput.output ? (
                                                      <ToolOutput
                                                        output={
                                                          partWithOutput.output
                                                        }
                                                        errorText={undefined}
                                                      />
                                                    ) : null;
                                                  })()}
                                                </ToolContent>
                                              </Tool>
                                            );

                                          case "output-denied":
                                            // Tool execution was denied
                                            return (
                                              <Tool
                                                key={`${role}-${i}`}
                                                defaultOpen
                                              >
                                                <ToolHeader
                                                  type={toolPart.type}
                                                  state={toolPart.state}
                                                />
                                                <ToolContent>
                                                  <ToolInput
                                                    input={toolPart.input}
                                                  />
                                                  <Confirmation
                                                    approval={toolPart.approval}
                                                    state={toolPart.state}
                                                    className="m-4"
                                                  >
                                                    <ConfirmationTitle>
                                                      Tool execution was denied.
                                                      {toolPart.approval
                                                        ?.reason && (
                                                        <span className="block mt-2 text-sm text-muted-foreground">
                                                          Reason:{" "}
                                                          {
                                                            toolPart.approval
                                                              .reason
                                                          }
                                                        </span>
                                                      )}
                                                    </ConfirmationTitle>
                                                  </Confirmation>
                                                </ToolContent>
                                              </Tool>
                                            );

                                          case "output-error":
                                            // Tool execution failed, but don't show error to user
                                            // The AI can handle errors internally and continue
                                            return null;

                                          case "output-available":
                                            // Tool execution succeeded, render output

                                            // Check if this is a tool result for analytics data
                                            if (
                                              toolType.includes(
                                                "getContentAnalyticsData"
                                              )
                                            ) {
                                              if (
                                                toolPart.output &&
                                                typeof toolPart.output ===
                                                  "object" &&
                                                "data" in toolPart.output
                                              ) {
                                                const analyticsData = (
                                                  toolPart.output as {
                                                    data?: unknown;
                                                  }
                                                ).data;
                                                if (
                                                  Array.isArray(
                                                    analyticsData
                                                  ) &&
                                                  analyticsData.length > 0
                                                ) {
                                                  return (
                                                    <div key={`${role}-${i}`}>
                                                      <AnalyticsData
                                                        data={analyticsData}
                                                      />
                                                    </div>
                                                  );
                                                }
                                              }
                                            }
                                            // Check if this is a tool result for brand review
                                            if (
                                              toolType.includes(
                                                "generateBrandReview"
                                              )
                                            ) {
                                              if (
                                                toolPart.output &&
                                                typeof toolPart.output ===
                                                  "object" &&
                                                "data" in toolPart.output &&
                                                "success" in toolPart.output &&
                                                toolPart.output.success === true
                                              ) {
                                                const brandReviewData = (
                                                  toolPart.output as {
                                                    data?: unknown;
                                                    success: boolean;
                                                  }
                                                ).data;
                                                if (
                                                  Array.isArray(
                                                    brandReviewData
                                                  ) &&
                                                  brandReviewData.length > 0
                                                ) {
                                                  return (
                                                    <div key={`${role}-${i}`}>
                                                      <BrandReview
                                                        data={brandReviewData}
                                                      />
                                                    </div>
                                                  );
                                                }
                                              }
                                            }
                                            // Check if this is a tool result for page screenshot
                                            if (
                                              toolType.includes(
                                                "getPageScreenshot"
                                              )
                                            ) {
                                              if (
                                                toolPart.output &&
                                                typeof toolPart.output ===
                                                  "object" &&
                                                "screenshotData" in
                                                  toolPart.output
                                              ) {
                                                const screenshotOutput =
                                                  toolPart.output as {
                                                    screenshotData?:
                                                      | string
                                                      | {
                                                          screenshot_base64?: string;
                                                        };
                                                  };
                                                const screenshotData =
                                                  screenshotOutput.screenshotData;

                                                if (screenshotData) {
                                                  return (
                                                    <div key={`${role}-${i}`}>
                                                      <PageScreenshot
                                                        screenshotData={
                                                          screenshotData
                                                        }
                                                      />
                                                    </div>
                                                  );
                                                }
                                              }
                                            }

                                            // If no specific tool handler matched, return null
                                            return null;

                                          default:
                                            // Unknown state, return null
                                            return null;
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
            isStreaming={isStreaming}
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
