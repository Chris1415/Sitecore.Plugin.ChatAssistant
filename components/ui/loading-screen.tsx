"use client";

import { Loader } from "@/components/ai-elements/loader";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

export function LoadingScreen({
  message = "Loading...",
  className,
}: LoadingScreenProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8",
        className
      )}
    >
      <Loader size={48} className="text-primary" />
      <p className="text-lg font-medium text-foreground">{message}</p>
    </div>
  );
}

