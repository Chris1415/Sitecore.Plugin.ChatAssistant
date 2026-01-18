"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle as AlertCircleIcon, XCircle } from "lucide-react";

interface BrandReviewField {
  fieldId: string;
  fieldName?: string;
  score: number;
  reason: string;
  suggestion: string;
}

interface BrandReviewSection {
  sectionId: string;
  sectionName?: string;
  score: number;
  reason: string;
  suggestion: string;
  fields?: BrandReviewField[];
}

interface BrandReviewProps {
  data: BrandReviewSection[];
}

function getScoreDisplay(score: number) {
  if (score >= 4) {
    return {
      color: "success" as const,
      icon: CheckCircle2,
      label: "Excellent",
    };
  } else if (score === 3) {
    return {
      color: "warning" as const,
      icon: AlertCircleIcon,
      label: "Good",
    };
  } else {
    return {
      color: "danger" as const,
      icon: XCircle,
      label: "Needs Improvement",
    };
  }
}

export function BrandReview({ data }: BrandReviewProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  return (
    <Card className="my-4 w-full max-w-full">
      <CardHeader>
        <CardTitle>Brand Review Results</CardTitle>
        <CardDescription>
          Compliance analysis across {data.length} section
          {data.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full space-y-4">
        {data.map((section: BrandReviewSection, sectionIndex: number) => {
          const scoreDisplay = getScoreDisplay(section.score);
          const ScoreIcon = scoreDisplay.icon;

          return (
            <Card
              key={section.sectionId}
              className={`border-l-4 ${
                scoreDisplay.color === "success"
                  ? "border-l-green-500 dark:border-l-green-400"
                  : scoreDisplay.color === "warning"
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
                        : `Section ${sectionIndex + 1}`}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs font-mono">
                      {section.sectionId}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      colorScheme={
                        scoreDisplay.color === "success"
                          ? "success"
                          : scoreDisplay.color === "warning"
                          ? "warning"
                          : "danger"
                      }
                      size="lg"
                    >
                      <ScoreIcon className="size-3" />
                      Score: {section.score}/5
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert
                  variant={
                    scoreDisplay.color === "success"
                      ? "success"
                      : scoreDisplay.color === "warning"
                      ? "warning"
                      : "danger"
                  }
                >
                  <AlertTitle>Assessment</AlertTitle>
                  <AlertDescription>{section.reason}</AlertDescription>
                </Alert>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-sm font-medium text-foreground mb-1">
                    Recommendation:
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {section.suggestion}
                  </div>
                </div>
                {section.fields && section.fields.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-sm font-medium text-foreground">
                      Field Details:
                    </div>
                    {section.fields.map((field) => {
                      const fieldScoreDisplay = getScoreDisplay(field.score);
                      const FieldIcon = fieldScoreDisplay.icon;
                      return (
                        <div
                          key={field.fieldId}
                          className="rounded-lg border border-border bg-background p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground truncate">
                                {field.fieldName || field.fieldId}
                              </div>
                              {field.fieldName && (
                                <div className="text-xs font-mono text-muted-foreground truncate mt-0.5">
                                  {field.fieldId}
                                </div>
                              )}
                            </div>
                            <Badge
                              colorScheme={
                                fieldScoreDisplay.color === "success"
                                  ? "success"
                                  : fieldScoreDisplay.color === "warning"
                                  ? "warning"
                                  : "danger"
                              }
                              size="sm"
                            >
                              <FieldIcon className="size-2.5" />
                              {field.score}/5
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <div className="font-medium mb-1">{field.reason}</div>
                            <div className="italic">{field.suggestion}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}

