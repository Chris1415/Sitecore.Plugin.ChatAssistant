import { Tool, tool } from "ai";
import z from "zod";
import { createXMCClient } from "../base/sitecoreClient";

export function getLanguagesTool(accessToken: string, contextId: string): Tool {
  return tool({
    description:
      "Get all available languages configured in the Sitecore site. Returns language codes, names, and other metadata.",
    inputSchema: z.object({}),
    execute: async () => {
      try {
        const xmcClient = await createXMCClient(accessToken);
        const languages = await xmcClient.sites.listLanguages({
          query: {
            sitecoreContextId: contextId,
          },
        });

        return {
          success: true,
          languages: languages?.data || [],
          count: languages?.data?.length || 0,
        };
      } catch (error) {
        console.error("[SitecoreAgent] Error fetching languages:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch languages",
          languages: [],
        };
      }
    },
  });
}

export function getSitesTool(accessToken: string, contextId: string): Tool {
  return tool({
    description:
      "Get all available sites configured in Sitecore. Returns site names, IDs, and configuration details.",
    inputSchema: z.object({}),
    execute: async () => {
      try {
        const xmcClient = await createXMCClient(accessToken);
        const sites = await xmcClient.sites.listSites({
          query: {
            sitecoreContextId: contextId,
          },
        });

        return {
          success: true,
          sites: sites?.data || [],
          count: sites?.data?.length || 0,
        };
      } catch (error) {
        console.error("[SitecoreAgent] Error fetching sites:", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch sites",
          sites: [],
        };
      }
    },
  });
}
