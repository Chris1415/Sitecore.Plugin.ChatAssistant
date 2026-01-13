"use client";

import React, {
  useEffect,
  useState,
  ReactNode,
  createContext,
  useContext,
} from "react";
import {
  ApplicationContext,
  ClientSDK,
} from "@sitecore-marketplace-sdk/client";
import { XMC } from "@sitecore-marketplace-sdk/xmc";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface ClientSDKProviderProps {
  children: ReactNode;
}

const ClientSDKContext = createContext<ClientSDK | null>(null);
const AppContextContext = createContext<ApplicationContext | null>(null);

export const MarketplaceProvider: React.FC<ClientSDKProviderProps> = ({
  children,
}) => {
  const [client, setClient] = useState<ClientSDK | null>(null);
  const [appContext, setAppContext] = useState<ApplicationContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (client) {
      client.query("application.context").then((res) => {
        if (res && res.data) {
          setAppContext(res.data);
          console.log("appContext", res.data);
        }
      });
    }
  }, [client]);

  useEffect(() => {
    const init = async () => {
      const config = {
        target: window.parent,
        modules: [XMC],
      };
      try {
        setLoading(true);
        const client = await ClientSDK.init(config);
        setClient(client);
      } catch (error) {
        console.error("Error initializing client SDK", error);
        setError("Error initializing client SDK");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return <LoadingScreen message="Connecting to Sitecore Marketplace..." />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center max-w-md">
          <h1 className="mb-2 text-xl font-semibold text-destructive">
            Error initializing Marketplace SDK
          </h1>
          <div className="mb-4 text-foreground">{error}</div>
          <div className="text-sm text-muted-foreground">
            Please check if the client SDK is loaded inside Sitecore Marketplace
            parent window and you have properly set your app's extension points.
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  if (!appContext) {
    return null;
  }

  return (
    <ClientSDKContext.Provider value={client}>
      <AppContextContext.Provider value={appContext}>
        {children}
      </AppContextContext.Provider>
    </ClientSDKContext.Provider>
  );
};

export const useMarketplaceClient = () => {
  const context = useContext(ClientSDKContext);
  if (!context) {
    throw new Error(
      "useMarketplaceClient must be used within a ClientSDKProvider"
    );
  }
  return context;
};

export const useAppContext = () => {
  const context = useContext(AppContextContext);
  if (!context) {
    throw new Error("useAppContext must be used within a ClientSDKProvider");
  }
  return context;
};
