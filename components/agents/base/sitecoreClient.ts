import { experimental_createXMCClient,  } from "@sitecore-marketplace-sdk/xmc";

export async function createXMCClient(accessToken: string) {
  const xmcClient = await experimental_createXMCClient({
    getAccessToken: async () => {
      return accessToken;
    },
  });

  return xmcClient;
}
