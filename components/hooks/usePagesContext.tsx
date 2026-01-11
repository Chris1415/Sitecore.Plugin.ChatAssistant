import { useEffect, useState, useRef } from "react";
import { useMarketplaceClient } from "../providers/marketplace";
import { PagesContext } from "@sitecore-marketplace-sdk/client";

interface UsePagesContextOptions {
  onContextChange?: (context: PagesContext, isInitial: boolean) => void;
}

export default function usePagesContext(options?: UsePagesContextOptions) {
  const [pagesContext, setPagesContext] = useState<PagesContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const client = useMarketplaceClient();

  // Store callback in ref to always have the latest version
  const onContextChangeRef = useRef(options?.onContextChange);
  // Track previous context to prevent duplicate calls
  const previousContextRef = useRef<string | null>(null);
  // Track if initial load has happened
  const isInitialRef = useRef(true);
  // Track if callback is currently being processed
  const isProcessingRef = useRef(false);

  // Keep ref updated with latest callback
  useEffect(() => {
    onContextChangeRef.current = options?.onContextChange;
  }, [options?.onContextChange]);

  useEffect(() => {
    if (!client) return;

    const handleUpdate = (data: PagesContext | null) => {
      const dataJson = JSON.stringify(data);
      
      // Skip if same as previous (deduplication)
      if (previousContextRef.current === dataJson) {
        console.log("[PagesContext] Skipped duplicate update");
        return;
      }
      
      // Skip if currently processing
      if (isProcessingRef.current) {
        console.log("[PagesContext] Skipped - already processing");
        return;
      }

      const isInitial = isInitialRef.current;
      isInitialRef.current = false;
      
      previousContextRef.current = dataJson;
      setPagesContext(data);
      setLoading(false);

      // Call callback if available (for both initial and updates)
      if (onContextChangeRef.current && data) {
        isProcessingRef.current = true;
        console.log(`[PagesContext] Triggering callback (${isInitial ? 'initial' : 'update'})`);
        onContextChangeRef.current(data, isInitial);
        // Reset processing flag after a short delay to allow for async operations
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 1000);
      }
    };

    client
      .query("pages.context", {
        subscribe: true,
        onSuccess: (res) => {
          handleUpdate(res.data || res);
        },
        onError: (err) => {
          setLoading(false);
          setError(err?.message || "Failed to fetch pages context");
          console.error("[PagesContext] Subscription error:", err);
        },
      })
      .then((res) => {
        if (res.data) {
          handleUpdate(res.data);
        }
      })
      .catch((err) => {
        setLoading(false);
        setError(err?.message || "Failed to fetch pages context");
        console.error("[PagesContext] Query error:", err);
      });
  }, [client]);

  return { pagesContext, isLoading: loading, error };
}
