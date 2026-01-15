/**
 * Custom OAuth2 client credentials login function
 * Gets an access token from Sitecore Cloud OAuth endpoint
 */

export interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
  audience?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
}

export interface OAuthError {
  error: string;
  error_description?: string;
}

/**
 * Get access token using OAuth2 client credentials flow
 * @param credentials - OAuth credentials (clientId, clientSecret, audience)
 * @returns Promise resolving to the access token string
 * @throws Error if authentication fails
 */
export async function getAccessToken(
  credentials?: OAuthCredentials
): Promise<string> {
  const clientId =
    credentials?.clientId ||
    process.env.SITECORE_AI_CLIENT_ID ||
    process.env.SITECORE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_SITECORE_CLIENT_ID;
  const clientSecret =
    credentials?.clientSecret ||
    process.env.SITECORE_AI_CLIENT_SECRET ||
    process.env.SITECORE_CLIENT_SECRET ||
    process.env.NEXT_PUBLIC_SITECORE_CLIENT_SECRET;
  const audience =
    credentials?.audience ||
    process.env.SITECORE_AUDIENCE ||
    process.env.NEXT_PUBLIC_SITECORE_AUDIENCE ||
    "https://api.sitecorecloud.io";

  if (!clientId || !clientSecret) {
    throw new Error(
      "OAuth credentials are required. Provide clientId and clientSecret either as parameters or via environment variables (SITECORE_CLIENT_ID, SITECORE_CLIENT_SECRET)"
    );
  }

  const tokenUrl = "https://auth.sitecorecloud.io/oauth/token";

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
        audience: audience,
      }),
    });

    if (!response.ok) {
      const errorData: OAuthError = await response.json().catch(() => ({
        error: "Unknown error",
        error_description: `HTTP ${response.status}: ${response.statusText}`,
      }));

      throw new Error(
        errorData.error_description ||
          errorData.error ||
          `Failed to get access token: ${response.status} ${response.statusText}`
      );
    }

    const tokenData: TokenResponse = await response.json();

    if (!tokenData.access_token) {
      throw new Error("Access token not found in response");
    }

    return tokenData.access_token;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to get access token: Unknown error occurred");
  }
}

/**
 * Get access token with full token response (includes expiration info)
 * @param credentials - OAuth credentials (clientId, clientSecret, audience)
 * @returns Promise resolving to the full token response object
 * @throws Error if authentication fails
 */
export async function getAccessTokenWithDetails(
  credentials?: OAuthCredentials
): Promise<TokenResponse> {
  const clientId =
    credentials?.clientId ||
    process.env.SITECORE_AI_CLIENT_ID ||
    process.env.SITECORE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_SITECORE_CLIENT_ID;
  const clientSecret =
    credentials?.clientSecret ||
    process.env.SITECORE_AI_CLIENT_SECRET ||
    process.env.SITECORE_CLIENT_SECRET ||
    process.env.NEXT_PUBLIC_SITECORE_CLIENT_SECRET;
  const audience =
    credentials?.audience ||
    process.env.SITECORE_AUDIENCE ||
    process.env.NEXT_PUBLIC_SITECORE_AUDIENCE ||
    "https://api.sitecorecloud.io";

  if (!clientId || !clientSecret) {
    throw new Error(
      "OAuth credentials are required. Provide clientId and clientSecret either as parameters or via environment variables (SITECORE_CLIENT_ID, SITECORE_CLIENT_SECRET)"
    );
  }

  const tokenUrl = "https://auth.sitecorecloud.io/oauth/token";

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
        audience: audience,
      }),
    });

    if (!response.ok) {
      const errorData: OAuthError = await response.json().catch(() => ({
        error: "Unknown error",
        error_description: `HTTP ${response.status}: ${response.statusText}`,
      }));

      throw new Error(
        errorData.error_description ||
          errorData.error ||
          `Failed to get access token: ${response.status} ${response.statusText}`
      );
    }

    const tokenData: TokenResponse = await response.json();

    if (!tokenData.access_token) {
      throw new Error("Access token not found in response");
    }

    return tokenData;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to get access token: Unknown error occurred");
  }
}

