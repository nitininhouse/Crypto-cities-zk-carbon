// _app.tsx
import Layout from "@/components/Layout";
import CounterContextProvider from "@/context/CounterContextProvider";
import WalletContextProvider from "@/context/WalletContextProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

// Wagmi imports only (remove Civic)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains"; // Base Sepolia testnet
import { metaMask } from "wagmi/connectors";

// Create Wagmi config with MetaMask only for Base Sepolia
const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
  connectors: [
    metaMask(),
  ],
});

// React Query client
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <WalletContextProvider>
          <CounterContextProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </CounterContextProvider>
        </WalletContextProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}