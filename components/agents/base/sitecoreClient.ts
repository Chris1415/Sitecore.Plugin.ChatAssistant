import { experimental_createXMCClient } from "@sitecore-marketplace-sdk/xmc";
import { experimental_createAIClient } from "@sitecore-marketplace-sdk/ai";

export async function createXMCClient(accessToken: string) {
  const xmcClient = await experimental_createXMCClient({
    getAccessToken: async () => {
      return accessToken;
    },
  });

  return xmcClient;
}

export async function createAIClient(accessToken: string) {
  const aiClient = await experimental_createAIClient({
    getAccessToken: async () => {
      return accessToken;
    },
  });

  return aiClient;
}
