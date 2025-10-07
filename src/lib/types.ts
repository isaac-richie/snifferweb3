/**
 * Type definitions for Sniffer Web3 application
 * 
 * This file contains all the type definitions used throughout the application,
 * including token data structures, API responses, and component props.
 */

export interface BaseToken {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  fully_diluted_valuation: number;
  total_volume: number;
  price_change_percentage_24h: number;
  ecosystem: string;
  contract_address: string;
  dex_data?: {
    dexId: string;
    pairAddress: string;
    liquidity: {
      usd: number;
      base: number;
      quote: number;
    };
    priceNative: string;
    volume: {
      h24: number;
      h6: number;
      h1: number;
      m5: number;
    };
    txns: {
      m5: { buys: number; sells: number };
      h1: { buys: number; sells: number };
      h6: { buys: number; sells: number };
      h24: { buys: number; sells: number };
    };
    url: string;
  };
}

export interface TokenExplorerState {
  tokens: BaseToken[];
  searchResults: BaseToken[];
  loading: boolean;
  searchLoading: boolean;
  error: string | null;
  searchQuery: string;
  activeTab: 'base' | 'search';
  sortBy: 'market_cap' | 'current_price' | 'total_volume' | 'price_change_percentage_24h';
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  tokensPerPage: number;
}

export interface TokenExplorerProps {
  tokens: BaseToken[];
}

export interface SocialProfileMetadata {
  address?: string;
  name?: string;
  [key: string]: unknown;
}

export interface SocialProfile {
  type: string;
  name?: string;
  address: string;
  avatar?: string;
  bio?: string;
  metadata?: SocialProfileMetadata;
}

export interface WalletProfilerProps {
  profiles: SocialProfile[];
  searchedAddress: string;
  originalSearchTerm: string;
  onShare: () => void;
}
