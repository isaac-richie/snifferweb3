/**
 * Wagmi Configuration - Web3 Wallet Connection Setup
 * 
 * This file configures Wagmi for Web3 wallet connections, specifically optimized
 * for Base blockchain interactions. It sets up wallet connectors, RPC endpoints,
 * and storage mechanisms for the Sniffer Web3 application.
 * 
 * Features:
 * - Base and Base Sepolia chain support
 * - Injected wallet connector (MetaMask, etc.)
 * - Coinbase Wallet integration with smart wallet preference
 * - Cookie-based storage for wallet state persistence
 * - Server-side rendering support
 * 
 * @author Sniffer Web3 Team
 * @version 1.0.0
 */

import { http, cookieStorage, createConfig, createStorage } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';

/**
 * Creates and returns the Wagmi configuration for Web3 wallet connections
 * 
 * This function sets up the complete Wagmi configuration including:
 * - Supported blockchain networks (Base mainnet and testnet)
 * - Wallet connectors (injected wallets, Coinbase Wallet)
 * - Storage mechanism (cookies for persistence)
 * - RPC transport configuration
 * - Server-side rendering support
 * 
 * @returns {WagmiConfig} Complete Wagmi configuration object
 * 
 * @example
 * const config = getConfig();
 * // Use with WagmiProvider in your app
 */
export function getConfig() {
  return createConfig({
    chains: [base, baseSepolia],
    connectors: [
      injected(),
      coinbaseWallet({
        appName: 'Sniffer Web3',
        preference: 'smartWalletOnly',
      }),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [base.id]: http(),
      [baseSepolia.id]: http(),
    },
  });
}

/**
 * Wagmi module declaration for TypeScript support
 * 
 * This declaration extends the Wagmi module to include our custom configuration
 * type, enabling proper TypeScript intellisense and type checking throughout
 * the application when using Wagmi hooks and utilities.
 */
declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}