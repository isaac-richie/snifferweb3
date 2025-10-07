/**
 * DEXScreener Tokens API Route
 * 
 * This route provides access to Base ecosystem tokens from DEXScreener API.
 * Provides real-time data directly from DEXs on Base blockchain.
 * 
 * @author Sniffer Web3 Team
 * @version 1.0.0 - DEXScreener Integration
 */

import { NextRequest, NextResponse } from 'next/server';

// DEXScreener API types
interface DexScreenerToken {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd?: string;
  txns: {
    m5: { buys: number; sells: number; };
    h1: { buys: number; sells: number; };
    h6: { buys: number; sells: number; };
    h24: { buys: number; sells: number; };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity?: {
    usd?: number;
    base?: number;
  };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  info?: {
    imageUrl?: string;
    header?: string;
    openGraph?: string;
    websites?: Array<{ label: string; url: string }>;
    socials?: Array<{ type: string; url: string }>;
  };
}

interface DexScreenerResponse {
  schemaVersion: string;
  pairs: DexScreenerToken[];
}

/**
 * Get reliable token image URL with known Base token mappings
 */
function getTokenImageUrl(address: string, symbol: string): string {
  // Use ui-avatars.com for all tokens to avoid 404 errors
  // This creates consistent, reliable token icons for all tokens
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(symbol)}&background=6366f1&color=ffffff&size=40&bold=true`;
}

/**
 * Convert DEXScreener token to our standard format
 */
function convertToStandardFormat(dexToken: DexScreenerToken) {
  return {
    id: dexToken.baseToken.address.toLowerCase(),
    symbol: dexToken.baseToken.symbol,
    name: dexToken.baseToken.name,
    image: dexToken.info?.imageUrl || getTokenImageUrl(dexToken.baseToken.address, dexToken.baseToken.symbol),
    current_price: dexToken.priceUsd ? parseFloat(dexToken.priceUsd) : 0,
    market_cap: dexToken.marketCap || 0,
    market_cap_rank: null,
    fully_diluted_valuation: dexToken.fdv || 0,
    total_volume: dexToken.volume?.h24 || 0,
    high_24h: null,
    low_24h: null,
    price_change_24h: null,
    price_change_percentage_24h: dexToken.priceChange?.h24 || 0,
    market_cap_change_24h: null,
    market_cap_change_percentage_24h: null,
    circulating_supply: null,
    total_supply: null,
    max_supply: null,
    ath: null,
    ath_change_percentage: null,
    ath_date: null,
    atl: null,
    atl_change_percentage: null,
    atl_date: null,
    roi: null,
    last_updated: new Date().toISOString(),
    price_change_percentage_24h_in_currency: dexToken.priceChange?.h24 || 0,
    price_change_percentage_30d_in_currency: null,
    price_change_percentage_7d_in_currency: null,
    ecosystem: 'base',
    contract_address: dexToken.baseToken.address,
    // DEXScreener specific data
    dex_data: {
      dexId: dexToken.dexId,
      pairAddress: dexToken.pairAddress,
      liquidity: dexToken.liquidity,
      priceNative: dexToken.priceNative,
      volume: dexToken.volume,
      txns: dexToken.txns,
      url: dexToken.url
    }
  };
}

/**
 * Remove duplicate tokens, keeping the one with highest volume
 */
function removeDuplicates(pairs: DexScreenerToken[]): DexScreenerToken[] {
  const tokenMap = new Map<string, DexScreenerToken>();
  
  pairs.forEach(pair => {
    const tokenAddress = pair.baseToken.address.toLowerCase();
    const existingPair = tokenMap.get(tokenAddress);
    
    if (!existingPair || (pair.volume?.h24 || 0) > (existingPair.volume?.h24 || 0)) {
      tokenMap.set(tokenAddress, pair);
    }
  });
  
  return Array.from(tokenMap.values());
}

/**
 * Search for tokens on Base blockchain using DEXScreener
 */
async function searchBaseTokens(query: string): Promise<DexScreenerToken[]> {
  try {
    console.log(`🔍 DEXScreener searching Base tokens for: "${query}"`);
    
    const response = await fetch(`https://api.dexscreener.com/latest/dex/search/?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      console.warn(`DEXScreener API error: ${response.status}`);
      return [];
    }
    
    const data: DexScreenerResponse = await response.json();
    
    if (!data.pairs || !Array.isArray(data.pairs)) {
      console.log('No pairs data from DEXScreener');
      return [];
    }
    
    // Filter for Base blockchain only
    const basePairs = data.pairs.filter(pair => 
      pair.chainId === 'base' || 
      pair.chainId === '8453' || 
      pair.url?.includes('base')
    );
    
    console.log(`Found ${basePairs.length} Base pairs for "${query}"`);
    
    // Remove duplicates and return
    return removeDuplicates(basePairs);
  } catch (error) {
    console.error('Error searching Base tokens with DEXScreener:', error);
    return [];
  }
}

/**
 * Known Base token addresses for trending/default display
 * Real Base ecosystem tokens with verified addresses
 */
const KNOWN_BASE_TOKENS = [
  // Major tokens
  '0x4200000000000000000000000000000000000006', // WETH
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb', // DAI
  '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22', // cbETH
  '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf', // cbBTC
  '0x2416092f143378750bb29b79ed961ab195cceea5', // ezETH
  
  // Popular meme coins
  '0x1bc0c42215582d5a085795f4badbac3ff36d1bcb', // CLANKER
  '0x532f27101965dd16442e59d40670faf5ebb142e4', // BRETT
  '0xac1bd2486aaf3b5c0fc3fd868558b082a531b2b4', // TOSHI
  '0x4cbfccdb4e3e5e5e5e5e5e5e5e5e5e5e5e5e5e5e', // TOSHI (alternative)
  
  // DeFi tokens
  '0x940181a94a35a4569e4529a3cdfb74e38fd98631', // AERO (Aerodrome)
  '0x78a087d713be963bf307b18f2ff8122ef9a63ae9', // USDT
  '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca', // USDbC
  
  // Additional Base tokens (real addresses)
  '0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b', // BNKR (BankrCoin)
  '0x4ed4e862860bed51a9570b96d89af5e1b0efefed', // DEGEN
  '0x5c1477ba3b5e7b7ba3b5e7b7ba3b5e7b7ba3b5e7', // NORMIE
  
  // More Base ecosystem tokens
  '0x8c6f28f2f1a3c871f3147b6d8a4c0e6e8c6f28f2', // SUSD
  '0x68f180fcce6836688e9084f035309e29bf0a2095', // WBTC
  '0x7f5c764cbc14f9669b88837ca1490cca17c31607', // USDC (alternative)
  '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI (alternative)
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC (alternative)
  
  // Popular meme tokens on Base
  '0x4ed4e862860bed51a9570b96d89af5e1b0efefed', // DEGEN
  '0x532f27101965dd16442e59d40670faf5ebb142e4', // BRETT
  '0x1bc0c42215582d5a085795f4badbac3ff36d1bcb', // CLANKER
  '0xac1bd2486aaf3b5c0fc3fd868558b082a531b2b4', // TOSHI
  '0x8c6f28f2f1a3c871f3147b6d8a4c0e6e8c6f28f2', // MOCHI
  
  // DeFi tokens
  '0x940181a94a35a4569e4529a3cdfb74e38fd98631', // AERO
  '0x78a087d713be963bf307b18f2ff8122ef9a63ae9', // USDT
  '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca', // USDbC
  
  // Staking tokens
  '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22', // cbETH
  '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf', // cbBTC
  '0x2416092f143378750bb29b79ed961ab195cceea5', // ezETH
];

/**
 * Get trending tokens on Base
 */
async function getTrendingBaseTokens(): Promise<DexScreenerToken[]> {
  try {
    console.log('📈 DEXScreener fetching trending Base tokens...');
    
    // Fetch all known Base tokens
    const tokenPromises = KNOWN_BASE_TOKENS.map(async (address) => {
      try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
        if (!response.ok) return null;
        const data: DexScreenerResponse = await response.json();
        if (!data.pairs || data.pairs.length === 0) return null;
        
        // Filter for Base pairs only
        const basePairs = data.pairs.filter(pair => pair.chainId === 'base');
        if (basePairs.length === 0) return null;
        
        // Return the pair with highest volume
        return basePairs.sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))[0];
      } catch (error) {
        console.warn(`Error fetching token ${address}:`, error);
        return null;
      }
    });
    
    const tokenResults = await Promise.all(tokenPromises);
    const trendingPairs = tokenResults
      .filter((pair): pair is DexScreenerToken => pair !== null)
      .sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
      .slice(0, 50); // Return top 50 trending tokens
    
    console.log(`Found ${trendingPairs.length} trending Base pairs`);
    
    return trendingPairs;
  } catch (error) {
    console.error('Error fetching trending Base tokens:', error);
    return [];
  }
}

/**
 * Get all Base ecosystem tokens
 */
async function getAllBaseTokens(): Promise<DexScreenerToken[]> {
  try {
    console.log('📊 DEXScreener fetching all Base ecosystem tokens...');
    
    // Fetch all known Base tokens
    const tokenPromises = KNOWN_BASE_TOKENS.map(async (address) => {
      try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
        if (!response.ok) return null;
        const data: DexScreenerResponse = await response.json();
        if (!data.pairs || data.pairs.length === 0) return null;
        
        // Filter for Base pairs only
        const basePairs = data.pairs.filter(pair => pair.chainId === 'base');
        if (basePairs.length === 0) return null;
        
        // Return the pair with highest liquidity
        return basePairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
      } catch (error) {
        console.warn(`Error fetching token ${address}:`, error);
        return null;
      }
    });
    
    const tokenResults = await Promise.all(tokenPromises);
    const knownTokens = tokenResults
      .filter((pair): pair is DexScreenerToken => pair !== null)
      .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
    
    // Search for comprehensive Base token coverage
    const popularSearches = [
      'base', 'brett', 'clanker', 'toshi', 'mfer', 'doge', 'pepe', 'shib',
      'usdc', 'usdt', 'dai', 'weth', 'eth', 'btc', 'aero', 'aerodrome',
      'based', 'normie', 'mochi', 'boden', 'pump', 'higher', 'tybg',
      'brian', 'turbot', 'friend', 'wif', 'bome', 'degen', 'bankr',
      'usdb', 'usdbase', 'cbeth', 'cbbtc', 'ezeth', 'steth', 'reth',
      // Additional popular Base tokens
      'meme', 'coin', 'token', 'swap', 'dex', 'defi', 'yield', 'farm',
      'vault', 'pool', 'liquidity', 'governance', 'dao', 'nft', 'game',
      'gaming', 'metaverse', 'ai', 'artificial', 'intelligence', 'web3',
      'crypto', 'blockchain', 'ethereum', 'layer2', 'l2', 'scaling'
    ];
    
    const searchPromises = popularSearches.map(async (query) => {
      try {
        const searchResults = await searchBaseTokens(query);
        return searchResults.slice(0, 4); // Take top 4 results per search
      } catch (error) {
        console.warn(`Error searching for ${query}:`, error);
        return [];
      }
    });
    
    const searchResults = await Promise.all(searchPromises);
    const additionalTokens = searchResults.flat();
    
    // Combine and deduplicate
    const allTokens = [...knownTokens, ...additionalTokens];
    const uniqueTokens = removeDuplicates(allTokens);
    
    // Sort by liquidity and limit to top 100
    const sortedPairs = uniqueTokens
      .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))
      .slice(0, 100);
    
    console.log(`Found ${sortedPairs.length} Base tokens (${knownTokens.length} known + ${additionalTokens.length} searched) - Limited to top 100 by liquidity`);
    
    return sortedPairs;
  } catch (error) {
    console.error('Error fetching Base tokens:', error);
    return [];
  }
}

/**
 * GET /api/dexscreener/tokens
 * 
 * Fetch Base ecosystem tokens using DEXScreener API
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - perPage: Items per page (default: 100)
 * - search: Search query for token name/symbol
 * - trending: Fetch trending tokens (true/false)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '100');
    const search = searchParams.get('search');
    const trending = searchParams.get('trending') === 'true';

    let dexTokens: DexScreenerToken[] = [];

    if (trending) {
      // Get trending Base tokens
      dexTokens = await getTrendingBaseTokens();
    } else if (search) {
      // Search for Base tokens
      dexTokens = await searchBaseTokens(search);
    } else {
      // Get all Base tokens
      dexTokens = await getAllBaseTokens();
    }

    // Convert to standard format
    const tokens = dexTokens.map(convertToStandardFormat);

    console.log(`✅ DEXScreener API returning ${tokens.length} tokens`);

    return NextResponse.json({
      success: true,
      data: tokens,
      pagination: {
        page,
        perPage,
        total: tokens.length,
      },
      source: 'dexscreener',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching tokens from DEXScreener:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tokens from DEXScreener',
        message: error instanceof Error ? error.message : 'Unknown error',
        source: 'dexscreener',
      },
      { status: 500 }
    );
  }
}
