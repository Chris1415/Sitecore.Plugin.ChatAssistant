"use client";

import type React from "react";
import { Brain, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import type { ToolUIPart } from "ai";
import {
  getToolName,
  isAnalyticsTool,
  isBrandReviewTool,
  isScreenshotTool,
  isCustomUITool,
  getToolLoadingMessage,
  extractBrandReviewData,
  extractAnalyticsData,
  extractScreenshotData,
} from "./tool-ui-utils";

// ---------------------------------------------------------------------------
// Custom tool output rendering
// ---------------------------------------------------------------------------

function renderCustomToolOutput(
  toolType: string,
  toolPart: ToolUIPart,
  key: string,
): React.ReactNode | null {
  const toolName = getToolName(toolPart);

  if (isAnalyticsTool(toolType, toolName)) {
    const analyticsData = extractAnalyticsData(toolPart.output);
    if (analyticsData) {
      return (
        <div key={key}>
          <AnalyticsData data={analyticsData} />
        </div>
      );
    }
  }

  if (isBrandReviewTool(toolType, toolName)) {
    const brandReviewData = extractBrandReviewData(toolPart.output);
    if (brandReviewData) {
      return (
        <div key={key}>
          <BrandReview data={brandReviewData} />
        </div>
      );
    }
  }

  if (isScreenshotTool(toolType, toolName)) {
    const screenshotData = extractScreenshotData(toolPart.output);
    if (screenshotData) {
      return (
        <div key={key}>
          <PageScreenshot screenshotData={screenshotData} />
        </div>
      );
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type ToolPartRendererProps = {
  toolPart: ToolUIPart;
  toolType: string;
  parts: unknown[];
  messages: Array<{ parts?: unknown[] }>;
  messageIndex: number;
  role: string;
  partIndex: number;
  addToolApprovalResponse: (response: { id: string; approved: boolean }) => void;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ToolPartRenderer({
  toolPart,
  toolType,
  parts,
  messages,
  messageIndex,
  role,
  partIndex,
  addToolApprovalResponse,
}: ToolPartRendererProps): React.ReactNode {
  const toolName = getToolName(toolPart);
  const key = `${role}-${partIndex}`;

  const hideToolOutputs =
    process.env.NEXT_PUBLIC_HIDE_TOOL_OUTPUTS === "true" ||
    process.env.NEXT_PUBLIC_HIDE_TOOL_OUTPUTS === "1";

  const isDevelopment = process.env.NODE_ENV === "development";
  const isToolWithCustomUI = isCustomUITool(toolType, toolName);

  if (
    (hideToolOutputs || !isDevelopment) &&
    toolPart.state !== "approval-requested" &&
    !isToolWithCustomUI
  ) {
    return null;
  }

  switch (toolPart.state) {
    case "approval-requested": {
      const approvalRequest = parts.find(
        (p) =>
          (p as { type?: string }).type === "tool-approval-request" &&
          (p as { toolCallId?: string }).toolCallId === toolPart.toolCallId,
      ) as { approvalId?: string } | undefined;

      const previousApprovalRequest = messages
        .slice(0, messageIndex + 1)
        .reverse()
        .find((msg) =>
          (msg.parts as unknown[] | undefined)?.some(
            (p) =>
              (p as { type?: string }).type === "tool-approval-request" &&
              (p as { toolCallId?: string }).toolCallId === toolPart.toolCallId,
          ),
        )?.parts?.find(
          (p) =>
            (p as { type?: string }).type === "tool-approval-request" &&
            (p as { toolCallId?: string }).toolCallId === toolPart.toolCallId,
        ) as { approvalId?: string } | undefined;

      let approvalId: string | undefined;

      if (approvalRequest?.approvalId) {
        approvalId = approvalRequest.approvalId;
      } else if (previousApprovalRequest && "approvalId" in previousApprovalRequest) {
        approvalId = (previousApprovalRequest as { approvalId?: string }).approvalId;
      } else if (
        toolPart.approval &&
        typeof toolPart.approval === "object" &&
        "id" in toolPart.approval
      ) {
        approvalId = (toolPart.approval as { id: string }).id;
      } else if (toolPart.toolCallId) {
        approvalId = toolPart.toolCallId;
      }

      const handleApproval = (approved: boolean) => {
        if (!approvalId) {
          console.error("[ChatInterface] Cannot send approval: approvalId not found", {
            toolCallId: toolPart.toolCallId,
            approvalRequest,
            previousApprovalRequest,
          });
          return;
        }
        try {
          addToolApprovalResponse({ id: approvalId, approved });
        } catch (error) {
          console.error("[ChatInterface] Error sending approval response:", error);
          toast.error("Failed to send approval response", {
            description:
              error instanceof Error ? error.message : "Unknown error",
          });
        }
      };

      return (
        <Tool key={key} defaultOpen>
          <ToolHeader type={toolPart.type} state={toolPart.state} />
          <ToolContent>
            <ToolInput input={toolPart.input} />
            {approvalId ? (
              <div className="flex items-center justify-end gap-2 p-4">
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => handleApproval(true)}
                >
                  <CheckCircle2 className="size-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => handleApproval(false)}
                >
                  <XCircle className="size-4" />
                  Deny
                </Button>
              </div>
            ) : (
              <div className="p-4 text-sm text-muted-foreground">
                Error: Approval ID not found. Please check the console.
              </div>
            )}
          </ToolContent>
        </Tool>
      );
    }

    case "input-available": {
      const loadingMessage = getToolLoadingMessage(toolType, toolName);
      return (
        <div
          key={key}
          className="my-2 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Brain className="size-4 animate-pulse" />
          {loadingMessage ?? "Processing..."}
        </div>
      );
    }

    case "approval-responded": {
      const partWithOutput = toolPart as ToolUIPart & {
        output?: ToolUIPart["output"];
      };
      const customOutput = renderCustomToolOutput(
        toolType,
        partWithOutput,
        key,
      );
      if (customOutput) {
        return customOutput;
      }
      return (
        <Tool key={key}>
          <ToolHeader type={toolPart.type} state={toolPart.state} />
          <ToolContent>
            <ToolInput input={toolPart.input} />
            <Confirmation
              approval={toolPart.approval}
              state={toolPart.state}
              className="m-4"
            >
              <ConfirmationTitle>
                {toolPart.approval?.approved
                  ? "Approval granted. Tool is executing..."
                  : "Approval denied."}
              </ConfirmationTitle>
            </Confirmation>
            {partWithOutput.output ? (
              <ToolOutput
                output={partWithOutput.output}
                errorText={undefined}
              />
            ) : null}
          </ToolContent>
        </Tool>
      );
    }

    case "output-denied":
      return (
        <Tool key={key}>
          <ToolHeader type={toolPart.type} state={toolPart.state} />
          <ToolContent>
            <ToolInput input={toolPart.input} />
            <Confirmation
              approval={toolPart.approval}
              state={toolPart.state}
              className="m-4"
            >
              <ConfirmationTitle>
                Tool execution was denied.
                {toolPart.approval?.reason && (
                  <span className="block mt-2 text-sm text-muted-foreground">
                    Reason: {toolPart.approval.reason}
                  </span>
                )}
              </ConfirmationTitle>
            </Confirmation>
          </ToolContent>
        </Tool>
      );

    case "output-error":
      return null;

    case "output-available":
    default: {
      if (isAnalyticsTool(toolType, toolName)) {
        console.log("[ChatInterface] Analytics tool detected:", {
          toolType,
          toolName,
          state: toolPart.state,
          hasOutput: !!toolPart.output,
          outputKeys:
            toolPart.output && typeof toolPart.output === "object"
              ? Object.keys(toolPart.output as object)
              : null,
        });
      }

      const customOutput = renderCustomToolOutput(toolType, toolPart, key);
      if (customOutput) {
        return customOutput;
      }

      return (
        <Tool key={key}>
          <ToolHeader type={toolPart.type} state={toolPart.state} />
          <ToolContent>
            <ToolInput input={toolPart.input} />
            <ToolOutput output={toolPart.output} errorText={undefined} />
          </ToolContent>
        </Tool>
      );
    }
  }
}
