"use client";

import React, { useEffect, useState } from "react";
import {
  Auth0Provider,
  GetTokenSilentlyOptions,
  useAuth0,
  Auth0ContextInterface,
} from "@auth0/auth0-react";
import { LoadingScreen } from "@/components/ui/loading-screen";

// Get tenant ID from URL query params (passed by Marketplace) or fall back to env var
function getTenantFromUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  return params.get("marketplaceAppTenantId") || undefined;
}

function getOrgFromUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  return params.get("organizationId") || undefined;
}

// Custom auth wrapper that uses popup instead of redirect (for iframe compatibility)
const WithPopupAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, loginWithPopup, error } = useAuth0();
  const [authAttempted, setAuthAttempted] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !authAttempted && !error) {
      setAuthAttempted(true);
      // Use popup mode instead of redirect - works in iframes
      loginWithPopup({
        authorizationParams: {
          organization_id: getOrgFromUrl() || process.env.NEXT_PUBLIC_SITECORE_ORGANIZATION_ID,
          tenant_id: getTenantFromUrl() || process.env.NEXT_PUBLIC_SITECORE_TENANT_ID,
          product_codes: `mkp_${process.env.NEXT_PUBLIC_SITECORE_APP_ID}`,
        },
      }).catch((err) => {
        console.error("Popup auth failed:", err);
      });
    }
  }, [isLoading, isAuthenticated, authAttempted, loginWithPopup, error]);

  if (isLoading) {
    return <LoadingScreen message="Loading authentication..." />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-destructive">
            Authentication Error
          </h2>
          <p className="mb-4 text-foreground">{error.message}</p>
          <button
            onClick={() => setAuthAttempted(false)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoadingScreen message="Authenticating via popup..." />;
  }

  return <>{children}</>;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Get tenant/org from URL (Marketplace context) or fall back to env vars
  const tenantId = getTenantFromUrl() || process.env.NEXT_PUBLIC_SITECORE_TENANT_ID;
  const orgId = getOrgFromUrl() || process.env.NEXT_PUBLIC_SITECORE_ORGANIZATION_ID;

  const authParams = {
    organization_id: orgId,
    tenant_id: tenantId,
    product_codes: `mkp_${process.env.NEXT_PUBLIC_SITECORE_APP_ID}`,
    audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
    redirect_uri: process.env.NEXT_PUBLIC_APP_BASE_URL,
    scope: process.env.NEXT_PUBLIC_AUTH0_SCOPE,
  };

  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;

  // DEBUG: Log auth parameters
  console.log("🔐 Auth Debug:", {
    organization_id: authParams.organization_id,
    tenant_id: authParams.tenant_id,
    product_codes: authParams.product_codes,
    domain,
    clientId,
    redirect_uri: authParams.redirect_uri,
    source: getTenantFromUrl() ? "URL params" : "env vars",
  });

  if (!domain || !clientId) {
    throw new Error("Auth0 domain and client ID are required");
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        ...authParams,
      }}
    >
      <WithPopupAuth>{children}</WithPopupAuth>
    </Auth0Provider>
  );
};

export const useAuth = (): Auth0ContextInterface => {
  const { getAccessTokenSilently, ...rest } = useAuth0();

  const customGetAccessTokenSilently = (options?: GetTokenSilentlyOptions) => {
    // Use tenant/org from URL if available
    const tenantId = getTenantFromUrl() || process.env.NEXT_PUBLIC_SITECORE_TENANT_ID;
    const orgId = getOrgFromUrl() || process.env.NEXT_PUBLIC_SITECORE_ORGANIZATION_ID;

    return getAccessTokenSilently({
      ...options,
      authorizationParams: {
        ...options?.authorizationParams,
        organization_id: orgId,
        tenant_id: tenantId,
      },
    });
  };

  return {
    ...rest,
    getAccessTokenSilently:
      customGetAccessTokenSilently as Auth0ContextInterface["getAccessTokenSilently"],
  };
};
