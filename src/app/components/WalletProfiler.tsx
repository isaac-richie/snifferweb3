/**
 * WalletProfiler Component - Base Blockchain Wallet Analysis Dashboard
 * 
 * This component provides comprehensive wallet profiling and analytics using Etherscan API.
 * It displays detailed information about wallet behavior, portfolio, transactions, and risk assessment.
 * 
 * Features:
 * - Real-time wallet profile creation from Etherscan API data
 * - Portfolio breakdown (tokens, NFTs, diversification)
 * - Transaction history and behavior patterns
 * - Risk assessment and network activity
 * - Base blockchain focused analytics
 * - Real-time Basescan API integration for live data
 * 
 * @author Sniffer Web3 Team
 * @version 1.0.0
 */

"use client";

import { SocialProfile } from "thirdweb/social";
import { MediaRenderer } from "thirdweb/react";
import { client } from "../client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity,
  Clock,
  DollarSign,
  BarChart3,
  Network,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Calendar,
  Zap,
  Coins,
  Database,
  Copy,
  Check
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

/**
 * Transaction data interface from Etherscan API
 */
interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasUsed: string;
  timestamp: string;
  blockNumber: string;
  methodId: string;
  functionName?: string;
  isError: boolean;
}

/**
 * Token data interface from Etherscan API
 */
interface TokenData {
  contractAddress: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenDecimal?: string;
  balanceFormatted?: string;
}

/**
 * Wallet data interface from Etherscan API
 */
interface WalletData {
  address: string;
  balance: string;
  transactionCount: number;
  ethBalance?: {
    wei: string;
    eth: string;
    formatted: string;
  };
}

/**
 * Etherscan API response data
 */
interface EtherscanData {
  wallet: WalletData;
  transactions: TransactionData[];
  tokens: TokenData[];
}

/**
 * Simple wallet profile interface for Etherscan data
 */
interface WalletProfile {
  address: string;
  label: string;
  category: string;
  confidence: number;
  totalValue: number;
  totalTransactions: number;
  firstSeen: string;
  lastActivity: string;
  behaviorPatterns: {
    tradingFrequency: string;
    avgTransactionSize: number;
    preferredTokens: string[];
    tradingHours: string[];
    weekendActivity: boolean;
  };
  portfolio: {
    tokens: Array<{
      symbol: string;
      balance: number;
      value: number;
      percentage: number;
    }>;
    nfts: unknown[];
    totalValue: number;
    diversification: number;
  };
  transactionHistory: {
    totalTxs: number;
    successfulTxs: number;
    failedTxs: number;
    avgGasUsed: number;
    avgGasPrice: number;
  };
  networkActivity: {
    ethereum: number;
    polygon: number;
    arbitrum: number;
    optimism: number;
    base: number;
  };
  recent_transactions: Array<{
    hash: string;
    value: string;
    tokenSymbol: string;
    type: string;
    timestamp: number;
    from: string;
    to: string;
    methodId: string;
    functionName: string;
    blockNumber: string;
  }>;
}

/**
 * Props interface for WalletProfiler component
 * 
 * @interface WalletProfilerProps
 * @property {SocialProfile[]} profiles - Array of social profiles found for the wallet
 * @property {string} searchedAddress - The resolved wallet address being analyzed
 * @property {string} originalSearchTerm - The original search term entered by user
 * @property {() => void} onShare - Callback function to handle profile sharing
 */
interface WalletProfilerProps {
  profiles: SocialProfile[];
  searchedAddress: string;
  originalSearchTerm: string;
  onShare: () => void;
}

/**
 * WalletProfiler Component - Main wallet analysis dashboard
 * 
 * This component fetches and displays comprehensive wallet analytics including:
 * - Wallet profile and risk assessment
 * - Portfolio breakdown (tokens, NFTs)
 * - Transaction history and patterns
 * - Behavior analysis and network activity
 * 
 * @param {WalletProfilerProps} props - Component props
 * @returns JSX.Element - Complete wallet profiling dashboard
 */
export function WalletProfiler({ profiles, searchedAddress, onShare }: WalletProfilerProps) {
  // Component state management
  const [walletProfile, setWalletProfile] = useState<WalletProfile | null>(null); // Wallet profile data
  const [isLoading, setIsLoading] = useState(true); // Loading state for API calls
  const [error, setError] = useState<string | null>(null); // Error state for failed requests
  const [realData, setRealData] = useState<EtherscanData | null>(null); // Real Etherscan data
  const [isLoadingRealData, setIsLoadingRealData] = useState(false); // Loading state for real data
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null); // Track when data was last fetched
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false); // Track if data has been loaded for current address
  const [addressCopied, setAddressCopied] = useState(false); // Track if address was copied
  const [loadingProgress, setLoadingProgress] = useState(0); // Track loading progress

  // Persistent cache key for localStorage
  const getCacheKey = (address: string) => `wallet_profiler_${address.toLowerCase()}`;
  
  // Cache duration: 30 minutes for persistent caching
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  
  // Get primary profile for display (first profile with avatar or first available)
  const primaryProfile = profiles.find(p => p.avatar) || profiles[0];

  // Save data to localStorage cache
  const saveToCache = useCallback((address: string, data: EtherscanData, profile: WalletProfile, fetchTime: number) => {
    try {
      const cacheKey = getCacheKey(address);
      const cacheData = {
        realData: data,
        walletProfile: profile,
        lastFetchTime: fetchTime,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log('💾 Saved wallet profiler data to cache for:', address);
    } catch (error) {
      console.warn('⚠️ Failed to save to cache:', error);
    }
  }, []);

  // Load data from localStorage cache
  const loadFromCache = useCallback((address: string): { realData: EtherscanData; walletProfile: WalletProfile; lastFetchTime: number } | null => {
    try {
      const cacheKey = getCacheKey(address);
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const cacheData = JSON.parse(cached);
        const age = Date.now() - cacheData.timestamp;
        
        if (age < CACHE_DURATION) {
          console.log('📦 Loaded wallet profiler data from cache for:', address);
          return {
            realData: cacheData.realData,
            walletProfile: cacheData.walletProfile,
            lastFetchTime: cacheData.lastFetchTime
          };
        } else {
          console.log('⏰ Cache expired for:', address);
          localStorage.removeItem(cacheKey); // Clean up expired cache
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load from cache:', error);
    }
    return null;
  }, [CACHE_DURATION]);

  // Create wallet profile from Etherscan data
  // Helper function to get recent transactions (last 30 days)
  const getRecentTransactions = (transactions: TransactionData[], days: number = 30, limit: number = 10): TransactionData[] => {
    const cutoffTime = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
    return transactions.filter(tx => {
      const timestamp = typeof tx.timestamp === 'number' ? tx.timestamp : parseInt(tx.timestamp);
      return timestamp > cutoffTime;
    }).slice(0, limit); // Limit to specified number
  };

  const createWalletProfile = useCallback((realData: EtherscanData): WalletProfile => {
    // Calculate first seen and last activity from real transaction data
    let firstSeen = 'Unknown';
    let lastActivity = 'Unknown';
    
    if (realData?.transactions && realData.transactions.length > 0) {
      // Sort transactions by block number to get first and last (timestamps are incorrect)
      const sortedTxs = realData.transactions.sort((a: TransactionData, b: TransactionData) => {
        const blockA = parseInt(a.blockNumber || '0', 10);
        const blockB = parseInt(b.blockNumber || '0', 10);
        return blockA - blockB;
      });
      
      // First transaction (oldest)
      const firstTx = sortedTxs[0];
      if (firstTx.blockNumber) {
        // API timestamps are incorrect, so we'll show block-based info
        const blockNumber = parseInt(firstTx.blockNumber, 10);
        firstSeen = `Block ${blockNumber.toLocaleString()}`;
      }
      
      // Last transaction (newest)
      const lastTx = sortedTxs[sortedTxs.length - 1];
      if (lastTx.blockNumber) {
        const blockNumber = parseInt(lastTx.blockNumber, 10);
        lastActivity = `Block ${blockNumber.toLocaleString()}`;
      }
    }

    // Calculate more realistic behavior patterns
    const totalTxs = realData?.wallet?.transactionCount || 0;
    const recentTxs = realData?.transactions || [];
    
    // Calculate average transaction size more accurately (only non-zero value transactions)
    const nonZeroTxs = recentTxs.filter(tx => parseFloat(tx.value || '0') > 0);
    const avgTxSize = nonZeroTxs.length > 0 ? 
      nonZeroTxs.reduce((sum: number, tx: TransactionData) => sum + parseFloat(tx.value || '0'), 0) / nonZeroTxs.length / Math.pow(10, 18) : 0;
    
    // Calculate additional transaction size metrics (used in display)
    // const totalValueTxs = nonZeroTxs.length;
    // const totalValueInETH = nonZeroTxs.reduce((sum: number, tx: TransactionData) => sum + parseFloat(tx.value || '0'), 0) / Math.pow(10, 18);
    // const maxTxSize = nonZeroTxs.length > 0 ? Math.max(...nonZeroTxs.map(tx => parseFloat(tx.value || '0') / Math.pow(10, 18))) : 0;
    // const minTxSize = nonZeroTxs.length > 0 ? Math.min(...nonZeroTxs.map(tx => parseFloat(tx.value || '0') / Math.pow(10, 18))) : 0;

    // Calculate trading frequency based on actual time periods and transaction patterns
    let tradingFrequency = 'Very Low';
    if (recentTxs.length > 0) {
      // Sort transactions by timestamp to get time range
      const sortedTxs = recentTxs.sort((a: TransactionData, b: TransactionData) => {
        const timeA = typeof a.timestamp === 'number' ? a.timestamp : parseInt(a.timestamp);
        const timeB = typeof b.timestamp === 'number' ? b.timestamp : parseInt(b.timestamp);
        return timeA - timeB;
      });

      const firstTx = sortedTxs[0];
      const lastTx = sortedTxs[sortedTxs.length - 1];
      
      if (firstTx && lastTx) {
        const firstTime = typeof firstTx.timestamp === 'number' ? firstTx.timestamp : parseInt(firstTx.timestamp);
        const lastTime = typeof lastTx.timestamp === 'number' ? lastTx.timestamp : parseInt(lastTx.timestamp);
        
        // Calculate time span in days
        const timeSpanDays = Math.max(1, (lastTime - firstTime) / (24 * 60 * 60));
        
        // Calculate transactions per day
        const txsPerDay = recentTxs.length / timeSpanDays;
        
        // Determine frequency based on actual transaction rate
        if (txsPerDay >= 10) tradingFrequency = 'Very High';
        else if (txsPerDay >= 5) tradingFrequency = 'High';
        else if (txsPerDay >= 1) tradingFrequency = 'Medium';
        else if (txsPerDay >= 0.1) tradingFrequency = 'Low';
        else tradingFrequency = 'Very Low';
      }
    } else if (totalTxs > 0) {
      // Fallback to total transaction count if no recent transactions available
      if (totalTxs > 1000) tradingFrequency = 'Very High';
      else if (totalTxs > 500) tradingFrequency = 'High';
      else if (totalTxs > 100) tradingFrequency = 'Medium';
      else if (totalTxs > 20) tradingFrequency = 'Low';
      else tradingFrequency = 'Very Low';
    }

    // Determine wallet category based on transaction patterns
    let category = 'Individual';
    if (totalTxs > 1000) category = 'Active Trader';
    else if (totalTxs > 100) category = 'Regular User';
    else if (totalTxs < 10) category = 'Low Activity';

    return {
      address: searchedAddress,
      label: primaryProfile?.name || 'Base Wallet',
      category: category,
      confidence: 1.0, // Using real data from Etherscan
      totalValue: realData?.wallet?.balance ? parseFloat(realData.wallet.balance) : 0, // Balance already in ETH format
      totalTransactions: totalTxs,
      firstSeen: firstSeen,
      lastActivity: lastActivity,
      behaviorPatterns: {
        tradingFrequency: tradingFrequency,
        avgTransactionSize: avgTxSize,
        preferredTokens: realData?.tokens?.slice(0, 3).map((token: TokenData) => token.tokenSymbol || 'Unknown') || [],
        tradingHours: [],
        weekendActivity: realData?.transactions?.some((tx: TransactionData) => {
          const timestamp = typeof tx.timestamp === 'number' ? tx.timestamp : parseInt(tx.timestamp);
          const date = new Date(timestamp * 1000);
          const dayOfWeek = date.getDay();
          return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
        }) || false
      },
      portfolio: {
        tokens: realData?.tokens?.map((token: TokenData) => {
          const balance = parseFloat(token.balanceFormatted);
          const tokenValue = balance; // Raw balance value (would need price API for USD value)
          return {
            symbol: token.tokenSymbol,
            balance: balance,
            value: tokenValue,
            percentage: realData?.tokens?.length > 0 ? Math.round((balance / realData.tokens.reduce((sum, t) => sum + parseFloat(t.balanceFormatted), 0)) * 100) : 0
          };
        }) || [],
        nfts: [],
        totalValue: realData?.wallet?.balance ? parseFloat(realData.wallet.balance) : 0, // Balance already in ETH format
        diversification: realData?.tokens?.length > 0 ? Math.min(realData.tokens.length * 10, 100) : 0 // Based on actual token count
      },
      transactionHistory: {
        totalTxs: realData?.wallet?.transactionCount || 0,
        successfulTxs: realData?.transactions?.filter((tx: TransactionData) => !tx.isError).length || 0,
        failedTxs: realData?.transactions?.filter((tx: TransactionData) => tx.isError).length || 0,
        avgGasUsed: realData?.transactions?.length > 0 ? 
          Math.round(realData.transactions.reduce((sum: number, tx: TransactionData) => sum + parseInt(tx.gasUsed || '0'), 0) / realData.transactions.length) : 0,
        avgGasPrice: realData?.transactions?.length > 0 ?
          Math.round((realData.transactions.reduce((sum: number, tx: TransactionData) => sum + parseInt(tx.gasPrice || '0'), 0) / realData.transactions.length / Math.pow(10, 9)) * 100) / 100 : 0
      },
      networkActivity: {
        ethereum: 0,
        polygon: 0,
        arbitrum: 0,
        optimism: 0,
        base: 100
      },
      recent_transactions: realData?.transactions ? getRecentTransactions(realData.transactions, 30, 6).map((tx: TransactionData) => ({
        hash: tx.hash,
        value: tx.value,
        tokenSymbol: 'ETH',
        type: tx.isError ? 'Failed' : 'Success',
        timestamp: typeof tx.timestamp === 'number' ? tx.timestamp : parseInt(tx.timestamp),
        from: tx.from,
        to: tx.to,
        methodId: tx.methodId,
        functionName: tx.functionName,
        blockNumber: tx.blockNumber
      })) : []
    };
  }, [searchedAddress, primaryProfile?.name]);

  // Fetch real Etherscan data with persistent caching
  const fetchRealData = useCallback(async (address: string, forceRefresh: boolean = false) => {
    // First, try to load from persistent cache
    if (!forceRefresh) {
      const cachedData = loadFromCache(address);
      if (cachedData) {
        console.log('📦 Using persistent cache for:', address);
        setRealData(cachedData.realData);
        setWalletProfile(cachedData.walletProfile);
        setLastFetchTime(cachedData.lastFetchTime);
        setIsLoadingRealData(false);
        setLoadingProgress(100);
        return;
      }
    }
    
    // Also check in-memory cache as fallback
    if (!forceRefresh && lastFetchTime && (Date.now() - lastFetchTime) < CACHE_DURATION) {
      console.log('📦 Using in-memory cache for:', address);
      return;
    }
    
    setIsLoadingRealData(true);
    setLoadingProgress(10);
    try {
      console.log('🔍 Fetching real Etherscan data for:', address);
      
      // Fetch all data in parallel for faster loading
      console.log('📡 Fetching all data in parallel...');
      setLoadingProgress(30);
      
      const [walletResponse, transactionsResponse, tokensResponse] = await Promise.allSettled([
        fetch(`/api/etherscan/wallet?address=${address}`),
        fetch(`/api/etherscan/transactions?address=${address}&offset=50&page=1`),
        fetch(`/api/etherscan/tokens?address=${address}&type=balances`)
      ]);
      
      setLoadingProgress(70);

      // Process responses
      const walletData = walletResponse.status === 'fulfilled' ? await walletResponse.value.json() : { success: false, data: null };
      const transactionsData = transactionsResponse.status === 'fulfilled' ? await transactionsResponse.value.json() : { success: false, data: [] };
      const tokensData = tokensResponse.status === 'fulfilled' ? await tokensResponse.value.json() : { success: false, data: [] };

      // Handle successful data loading
      const hasWalletData = walletData.success && walletData.data;
      const hasTransactionData = transactionsData.success && transactionsData.data;
      const hasTokenData = tokensData.success && tokensData.data;

      if (hasWalletData || hasTransactionData || hasTokenData) {
        const newRealData = {
          wallet: hasWalletData ? {
            ...walletData.data,
            balance: walletData.data.ethBalance?.eth || walletData.data.balance || '0'
          } : null,
          transactions: hasTransactionData ? transactionsData.data : [],
          tokens: hasTokenData ? tokensData.data : []
        };
        
        setRealData(newRealData);
        
        console.log('✅ Etherscan data loaded (partial success allowed):', {
          wallet: hasWalletData,
          transactions: hasTransactionData,
          tokens: hasTokenData,
          balance: hasWalletData ? (walletData.data.ethBalance?.eth || walletData.data.balance) : 'N/A',
          transactionCount: hasWalletData ? walletData.data.transactionCount : 0,
          tokenCount: hasTokenData ? tokensData.data.length : 0
        });
        
        // Show success notification with partial data info
        const balance = hasWalletData ? (walletData.data.ethBalance?.eth || walletData.data.balance || '0') : '0';
        if (parseFloat(balance) > 0) {
          toast.success(`Wallet data loaded: ${parseFloat(balance).toFixed(4)} ETH`, {
            duration: 3000,
            icon: '💰',
          });
        } else {
          toast.success('Wallet data loaded successfully', {
            duration: 3000,
            icon: '✅',
          });
        }
      } else {
        // All API calls failed
        throw new Error('All API calls failed to fetch wallet data');
      }
      
      // Update cache timestamp
      setLastFetchTime(Date.now());
      setLoadingProgress(100);
      
    } catch (error) {
      console.error('❌ Error fetching real data:', error);
      
      // Show more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('All API calls failed')) {
          toast.error(`Unable to fetch wallet data for "${address}". Please try again.`, {
            duration: 5000,
            icon: '⚠️',
            style: {
              background: '#ef4444',
              color: '#ffffff',
            },
          });
        } else {
          toast.error(`Network error: ${error.message}`, {
            duration: 5000,
            icon: '🌐',
            style: {
              background: '#f59e0b',
              color: '#ffffff',
            },
          });
        }
      } else {
        toast.error(`Failed to fetch wallet data for "${address}"`, {
          duration: 5000,
          icon: '⚠️',
          style: {
            background: '#ef4444',
            color: '#ffffff',
          },
        });
      }
      
      // Set error state but don't clear existing data
      setError(error instanceof Error ? error.message : 'Failed to fetch wallet data');
    } finally {
      setIsLoadingRealData(false);
      setLoadingProgress(0);
    }
  }, [lastFetchTime, setLastFetchTime, setIsLoadingRealData, CACHE_DURATION, loadFromCache]);


  // Copy address to clipboard function
  const handleCopyAddress = async () => {
    if (!searchedAddress) return;
    
    try {
      await navigator.clipboard.writeText(searchedAddress);
      setAddressCopied(true);
      toast.success('Address copied to clipboard!', {
        duration: 2000,
        icon: '📋',
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setAddressCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
      toast.error('Failed to copy address', {
        duration: 3000,
        icon: '⚠️',
      });
    }
  };

  /**
   * Effect hook to create wallet profile from Etherscan API data
   * 
   * This effect:
   * 1. Triggers when searchedAddress changes
   * 2. Only fetches data on first load (not when returning to page)
   * 3. Creates wallet profile from the data
   * 4. Updates component state with created profile
   * 
   * @effect
   * @dependencies [searchedAddress] - Re-runs when address changes
   */
  // Reset initial load flag when address changes
  useEffect(() => {
    if (searchedAddress) {
      setHasInitiallyLoaded(false);
      setWalletProfile(null);
      setRealData(null);
    }
  }, [searchedAddress]);

  useEffect(() => {
    if (searchedAddress && !hasInitiallyLoaded) {
      console.log('🚀 Starting initial wallet profile creation for:', searchedAddress);
      setIsLoading(true);
      setError(null);
      setHasInitiallyLoaded(true);
      
      // First check if we have cached data
      const cachedData = loadFromCache(searchedAddress);
      if (cachedData) {
        console.log('📦 Loading cached wallet profiler data for:', searchedAddress);
        setRealData(cachedData.realData);
        setWalletProfile(cachedData.walletProfile);
        setLastFetchTime(cachedData.lastFetchTime);
        setIsLoading(false);
      } else {
        // Fetch real Etherscan data if no cache
        fetchRealData(searchedAddress).then(() => {
          // Profile will be created when realData is available
          setIsLoading(false);
        });
      }
    } else if (searchedAddress && hasInitiallyLoaded && !realData) {
      // If we have loaded before but no data (e.g., page refresh), show loading but don't auto-fetch
      setIsLoading(false);
      setError(null);
    }
  }, [searchedAddress, hasInitiallyLoaded, realData, fetchRealData, loadFromCache]);

  // Create wallet profile when real data is available
  useEffect(() => {
    if (realData && !walletProfile) {
      console.log('📊 Creating wallet profile from Etherscan data');
      const profile = createWalletProfile(realData);
      setWalletProfile(profile);
      
      // Save to persistent cache when profile is created
      const fetchTime = Date.now();
      saveToCache(searchedAddress, realData, profile, fetchTime);
      setLastFetchTime(fetchTime);
    }
  }, [realData, createWalletProfile, walletProfile, searchedAddress, saveToCache]);

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <Card className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-blue-800/60 backdrop-blur-md">
          <CardContent className="p-8">
            <div className="flex items-center space-x-4 mb-6">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <span className="text-blue-300">Loading Base Blockchain Profile...</span>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-zinc-900/40 border-zinc-800/60">
              <CardContent className="p-4">
                <Skeleton className="h-8 w-8 rounded-full mx-auto mb-2" />
                <Skeleton className="h-6 w-16 mx-auto mb-1" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <Card className="bg-red-900/40 border-red-800/60 backdrop-blur-md">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
                <h3 className="text-xl font-semibold text-white mb-2">Base Blockchain Profile Error</h3>
                <p className="text-red-300 mb-6">
                  {error}
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-red-400">
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Base Blockchain Analytics Unavailable</span>
                  </div>
                </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!walletProfile) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <Card className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-blue-800/60 backdrop-blur-md">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Creating Wallet Profile</h3>
            <p className="text-gray-300">
              Analyzing Base blockchain data and creating comprehensive wallet profile...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <Card className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-blue-800/60 backdrop-blur-md">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 flex-shrink-0">
              {primaryProfile?.avatar ? (
                <MediaRenderer
                  client={client}
                  src={primaryProfile.avatar}
                  className="w-full h-full rounded-full object-cover border-2 border-blue-400"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-blue-400"></div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-2xl font-bold text-white">
                    {walletProfile.label}
                  </CardTitle>
                  <Badge className={`${
                    walletProfile.category === 'Exchange' ? 'bg-blue-600' :
                    walletProfile.category === 'Fund' ? 'bg-purple-600' :
                    walletProfile.category === 'Individual' ? 'bg-green-600' :
                    'bg-gray-600'
                  } text-white`}>
                    {walletProfile.category}
                  </Badge>
                </div>
                <Button
                  onClick={onShare}
                  variant="outline"
                  size="sm"
                  className="bg-zinc-700 text-zinc-300 hover:bg-zinc-600 border-zinc-600"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
              <div className="flex items-center space-x-3 mb-2">
                <p className="text-blue-200 font-mono text-lg">
                  {searchedAddress}
                </p>
                <Button
                  onClick={handleCopyAddress}
                  variant="outline"
                  size="sm"
                  className="bg-zinc-700/50 text-zinc-300 hover:bg-zinc-600/50 border-zinc-600/50 h-8 px-2"
                >
                  {addressCopied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={() => window.open(`https://basescan.org/address/${searchedAddress}`, '_blank', 'noopener,noreferrer')}
                  variant="outline"
                  size="sm"
                  className="bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border-blue-500/50 h-8 px-3"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  BaseScan
                </Button>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-300">
                <span>Confidence: {Math.round(walletProfile.confidence * 100)}%</span>
                <span>•</span>
                <span>First seen: {walletProfile.firstSeen}</span>
                <span>•</span>
                <span>Last activity: {walletProfile.lastActivity}</span>
              </div>
              {primaryProfile?.bio && (
                <p className="text-gray-300 text-sm max-w-2xl mt-2">
                  {primaryProfile.bio}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>


      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-zinc-900/40 border-zinc-800/60">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Behavior Patterns */}
          <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                  <span>Behavior Patterns</span>
                  <Badge className="bg-green-600/20 text-green-300 border-green-600/30">
                    Live Data
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="text-white font-medium">Trading Frequency</div>
                        <div className="text-gray-400 text-sm">
                          {(() => {
                            const recentTxs = realData?.transactions || [];
                            if (recentTxs.length > 0) {
                              const sortedTxs = recentTxs.sort((a: TransactionData, b: TransactionData) => {
                                const timeA = typeof a.timestamp === 'number' ? a.timestamp : parseInt(a.timestamp);
                                const timeB = typeof b.timestamp === 'number' ? b.timestamp : parseInt(b.timestamp);
                                return timeA - timeB;
                              });
                              const firstTx = sortedTxs[0];
                              const lastTx = sortedTxs[sortedTxs.length - 1];
                              if (firstTx && lastTx) {
                                const firstTime = typeof firstTx.timestamp === 'number' ? firstTx.timestamp : parseInt(firstTx.timestamp);
                                const lastTime = typeof lastTx.timestamp === 'number' ? lastTx.timestamp : parseInt(lastTx.timestamp);
                                const timeSpanDays = Math.max(1, (lastTime - firstTime) / (24 * 60 * 60));
                                const txsPerDay = (recentTxs.length / timeSpanDays).toFixed(2);
                                return `${txsPerDay} transactions/day (${recentTxs.length} recent txs)`;
                              }
                            }
                            return `Based on ${walletProfile.totalTransactions} total transactions`;
                          })()}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${
                      walletProfile.behaviorPatterns.tradingFrequency === 'Very High' ? 'border-red-400 text-red-300' :
                      walletProfile.behaviorPatterns.tradingFrequency === 'High' ? 'border-orange-400 text-orange-300' :
                      walletProfile.behaviorPatterns.tradingFrequency === 'Medium' ? 'border-yellow-400 text-yellow-300' :
                      walletProfile.behaviorPatterns.tradingFrequency === 'Low' ? 'border-blue-400 text-blue-300' :
                      'border-gray-400 text-gray-300'
                    }`}>
                      {walletProfile.behaviorPatterns.tradingFrequency}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <div>
                        <div className="text-white font-medium">Avg Transaction Size</div>
                        <div className="text-gray-400 text-sm">
                          {(() => {
                            const nonZeroTxs = realData?.transactions?.filter(tx => parseFloat(tx.value || '0') > 0) || [];
                            if (nonZeroTxs.length > 0) {
                              const maxTxSize = Math.max(...nonZeroTxs.map(tx => parseFloat(tx.value || '0') / Math.pow(10, 18)));
                              const minTxSize = Math.min(...nonZeroTxs.map(tx => parseFloat(tx.value || '0') / Math.pow(10, 18)));
                              return `${nonZeroTxs.length} value txs • Range: ${minTxSize.toFixed(4)}-${maxTxSize.toFixed(4)} ETH`;
                            }
                            return 'No value transactions found';
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {walletProfile.behaviorPatterns.avgTransactionSize > 0 
                          ? walletProfile.behaviorPatterns.avgTransactionSize.toFixed(6) + ' ETH'
                          : 'No value txs'
                        }
                      </div>
                      {walletProfile.behaviorPatterns.avgTransactionSize > 0 && (
                        <div className="text-xs text-gray-400">
                          {(() => {
                            const nonZeroTxs = realData?.transactions?.filter(tx => parseFloat(tx.value || '0') > 0) || [];
                            const totalValueInETH = nonZeroTxs.reduce((sum: number, tx: TransactionData) => sum + parseFloat(tx.value || '0'), 0) / Math.pow(10, 18);
                            return `Total: ${totalValueInETH.toFixed(4)} ETH`;
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="text-white font-medium">Weekend Activity</div>
                        <div className="text-gray-400 text-sm">Trading on Weekends</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${walletProfile.behaviorPatterns.weekendActivity ? 'border-green-400 text-green-300' : 'border-red-400 text-red-300'}`}>
                      {walletProfile.behaviorPatterns.weekendActivity ? 'Yes' : 'No'}
                    </Badge>
                  </div>

                  {walletProfile.behaviorPatterns.preferredTokens.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <div>
                          <div className="text-white font-medium">Preferred Tokens</div>
                          <div className="text-gray-400 text-sm">Most held tokens</div>
                        </div>
                      </div>
                      <div className="text-white font-semibold">
                        {walletProfile.behaviorPatterns.preferredTokens.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Transaction History Stats */}
          <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Database className="w-5 h-5 text-yellow-400" />
                <span>Transaction History</span>
                <Badge className="bg-blue-600/20 text-blue-300 border-blue-600/30">
                  Live Data
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">{walletProfile.transactionHistory.totalTxs.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Total Transactions</div>
                </div>
                <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{walletProfile.transactionHistory.successfulTxs.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Recent Success</div>
                </div>
                <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-red-400">{walletProfile.transactionHistory.failedTxs.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Recent Failed</div>
                </div>
                  <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{walletProfile.transactionHistory.avgGasUsed > 0 ? walletProfile.transactionHistory.avgGasUsed.toLocaleString() : '0'}</div>
                    <div className="text-sm text-gray-400">Avg Gas Used</div>
                  </div>
              </div>
              <div className="mt-4 p-3 bg-zinc-800/30 rounded-lg">
                <div className="text-sm text-gray-400 text-center">
                  Success/Failure rates based on recent 10 transactions • Total count from blockchain
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  <span>Recent Transactions</span>
                </div>
                <div className="text-sm text-gray-400">
                  Top 6 recent transactions (last 30 days)
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {walletProfile.recent_transactions && walletProfile.recent_transactions.length > 0 ? (
                  walletProfile.recent_transactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                          tx.type === 'Success' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {tx.type === 'Success' ? '✓' : '✗'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">
                            {tx.functionName || 'Contract Interaction'}
                          </div>
                          <a
                            href={`https://basescan.org/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 truncate block hover:underline"
                          >
                            {tx.hash.slice(0, 10)}...{tx.hash.slice(-6)}
                          </a>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="text-white font-semibold">{(parseFloat(tx.value || '0') / Math.pow(10, 18)).toFixed(6)} ETH</div>
                        <a
                          href={`https://basescan.org/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          Block {tx.blockNumber || 'N/A'}
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 p-8">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p>No transactions found in the last 30 days</p>
                    <p className="text-sm text-gray-500 mt-2">
                      This wallet may be inactive or all transactions are older than 30 days
                    </p>
                  </div>
                )}
                
                {/* Show More Button removed - showing only top 6 transactions */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>




      {/* Loading Real Data */}
      {isLoadingRealData && (
        <Card className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-800/60 backdrop-blur-md">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Loading Real Base Data</h3>
            <p className="text-gray-300 mb-4">
              Fetching live blockchain data from Etherscan...
            </p>
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400">
              {loadingProgress < 30 && "Starting data fetch..."}
              {loadingProgress >= 30 && loadingProgress < 70 && "Fetching wallet data..."}
              {loadingProgress >= 70 && loadingProgress < 100 && "Processing results..."}
              {loadingProgress === 100 && "Complete!"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-purple-800/60 backdrop-blur-md">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {profiles.map((profile, index) => (
              <a
                key={index}
                href={getProfileUrl(profile)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors"
              >
                <div className={`w-6 h-6 ${getPlatformColor(profile.type)} rounded-full flex items-center justify-center text-white text-xs`}>
                  {getPlatformIcon(profile.type)}
                </div>
                <span className="text-white text-sm font-medium">{profile.type}</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

        <TabsContent value="portfolio" className="space-y-6">
          {/* Simplified Portfolio Overview */}
          <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span>Portfolio Overview</span>
                <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-600/30">
                  Live Data
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ETH Balance */}
                <div className="text-center p-6 bg-zinc-800/50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl font-bold">Ξ</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {(() => {
                      if (!realData?.wallet?.balance) return '0.0000';
                      const balance = parseFloat(realData.wallet.balance);
                      // Balance should already be in ETH from the API, but handle edge cases
                      if (balance > 1000000) {
                        // Likely in wei, convert to ETH
                        return (balance / Math.pow(10, 18)).toFixed(4);
                      } else if (balance > 0) {
                        // Already in ETH, format appropriately
                        return balance.toFixed(4);
                      }
                      return '0.0000';
                    })()} ETH
                  </div>
                  <div className="text-sm text-gray-400">Native Balance</div>
                </div>

                {/* Token Count */}
                <div className="text-center p-6 bg-zinc-800/50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Coins className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {realData?.tokens?.length || 0}
                  </div>
                  <div className="text-sm text-gray-400">Token Types</div>
                </div>

                {/* Transaction Count */}
                <div className="text-center p-6 bg-zinc-800/50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {realData?.wallet?.transactionCount || 0}
                  </div>
                  <div className="text-sm text-gray-400">Total Transactions</div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-3">Quick Stats</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {realData?.transactions?.filter((tx: TransactionData) => !tx.isError).length || 0}
                    </div>
                    <div className="text-sm text-gray-400">Successful Txs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">
                      {realData?.transactions?.filter((tx: TransactionData) => tx.isError).length || 0}
                    </div>
                    <div className="text-sm text-gray-400">Failed Txs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">
                      {realData?.transactions?.length > 0 ? 
                        (realData.transactions
                          .filter(tx => parseFloat(tx.value || '0') > 0)
                          .reduce((sum: number, tx: TransactionData) => sum + parseFloat(tx.value || '0'), 0) / Math.pow(10, 18)).toFixed(4)
                      : '0.0000'} ETH
                    </div>
                    <div className="text-sm text-gray-400">Total Volume</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">
                      {realData?.transactions?.length > 0 ? 
                        (realData.transactions.reduce((sum: number, tx: TransactionData) => sum + parseFloat(tx.gasPrice || '0'), 0) / realData.transactions.length / Math.pow(10, 9)).toFixed(2)
                      : '0.00'} Gwei
                    </div>
                    <div className="text-sm text-gray-400">Avg Gas Price</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Wallet Risk Analysis */}
          <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span>Wallet Analysis</span>
                <Badge className="bg-blue-600/20 text-blue-300 border-blue-600/30">
                  Analytics
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                  <div className="text-3xl font-bold text-white mb-2">{Math.round(walletProfile.confidence * 100)}%</div>
                  <div className="text-sm text-gray-400">Confidence</div>
                  <div className="text-xs text-gray-500 mt-1">Profile Accuracy</div>
                </div>
                <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                  <div className="text-3xl font-bold text-white mb-2">{walletProfile.category}</div>
                  <div className="text-sm text-gray-400">Wallet Type</div>
                  <div className="text-xs text-gray-500 mt-1">Classification</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Base Blockchain Analytics */}
          <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Network className="w-5 h-5 text-blue-400" />
                <span>Base Blockchain Analytics</span>
                <Badge className="bg-blue-600/20 text-blue-300 border-blue-600/30">
                  Live Data
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Contract Interactions */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-blue-300 mb-3 flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  Contract Interactions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-white">
                      {realData?.transactions?.filter((tx: TransactionData) => tx.to !== '0x0000000000000000000000000000000000000000').length || 0}
                    </div>
                    <div className="text-sm text-gray-400">Contract Calls</div>
                  </div>
                  <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-white">
                      {realData?.transactions?.filter((tx: TransactionData) => tx.functionName && tx.functionName !== 'transfer').length || 0}
                    </div>
                    <div className="text-sm text-gray-400">Smart Contract Functions</div>
                  </div>
                  <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-white">
                      {realData?.transactions?.filter((tx: TransactionData) => tx.methodId === '0x095ea7b3').length || 0}
                    </div>
                    <div className="text-sm text-gray-400">Token Approvals</div>
                  </div>
                </div>
              </div>

              {/* Network Health */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-green-300 mb-3 flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Network Health
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {realData?.transactions?.length > 0 ? 
                          (realData.transactions.reduce((sum: number, tx: TransactionData) => sum + parseFloat(tx.gasPrice || '0'), 0) / realData.transactions.length / Math.pow(10, 9)).toFixed(2)
                        : 0}
                      </div>
                      <div className="text-sm text-gray-400">Avg Gas Price (Gwei)</div>
                    </div>
                    <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {realData?.transactions?.length > 0 ? 
                          Math.round(realData.transactions.reduce((sum: number, tx: TransactionData) => sum + parseFloat(tx.gasUsed || '0'), 0) / realData.transactions.length)
                        : 0}
                      </div>
                      <div className="text-sm text-gray-400">Avg Gas Used</div>
                    </div>
                  <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-white">
                      {realData?.transactions?.filter((tx: TransactionData) => !tx.isError).length > 0 ? 
                        Math.round((realData.transactions.filter((tx: TransactionData) => !tx.isError).length / realData.transactions.length) * 100) : 0
                      }%
                    </div>
                    <div className="text-sm text-gray-400">Success Rate</div>
                  </div>
                </div>
              </div>

              {/* DeFi Activity */}
              <div>
                <h4 className="text-md font-semibold text-purple-300 mb-3 flex items-center">
                  <Coins className="w-4 h-4 mr-2" />
                  DeFi Activity
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-white">
                      {realData?.transactions?.filter((tx: TransactionData) => 
                        tx.functionName?.includes('swap') || 
                        tx.functionName?.includes('addLiquidity') || 
                        tx.functionName?.includes('removeLiquidity')
                      ).length || 0}
                    </div>
                    <div className="text-sm text-gray-400">DEX Interactions</div>
                  </div>
                  <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-white">
                      {realData?.transactions?.filter((tx: TransactionData) => 
                        tx.functionName?.includes('deposit') || 
                        tx.functionName?.includes('withdraw') || 
                        tx.functionName?.includes('borrow') || 
                        tx.functionName?.includes('repay')
                      ).length || 0}
                    </div>
                    <div className="text-sm text-gray-400">Lending Protocol</div>
                  </div>
                  <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-white">
                      {realData?.tokens?.length || 0}
                    </div>
                    <div className="text-sm text-gray-400">Token Holdings</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* DeFi Protocol Analysis */}
          <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Network className="w-5 h-5 text-purple-400" />
                <span>DeFi Protocol Analysis</span>
                <Badge className="bg-purple-600/20 text-purple-300 border-purple-600/30">
                  Enhanced Detection
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {realData?.transactions?.filter((tx: TransactionData) => {
                      // Enhanced DEX detection using method IDs and function names
                      const isDexFunction = tx.functionName?.toLowerCase().includes('swap') || 
                                          tx.functionName?.toLowerCase().includes('addliquidity') || 
                                          tx.functionName?.toLowerCase().includes('removeliquidity') ||
                                          tx.functionName?.toLowerCase().includes('exacttokensforswap') ||
                                          tx.functionName?.toLowerCase().includes('exactethfortokens');
                      
                      // Common DEX method IDs
                      const isDexMethodId = tx.methodId === '0x38ed1739' || // swapExactTokensForTokens
                                         tx.methodId === '0x7ff36ab5' || // swapExactETHForTokens
                                         tx.methodId === '0x18cbafe5' || // swapExactTokensForETH
                                         tx.methodId === '0x2195995c' || // addLiquidity
                                         tx.methodId === '0xbaa2abde';   // removeLiquidity
                      
                      return isDexFunction || isDexMethodId;
                    }).length || 0}
                  </div>
                  <div className="text-sm text-gray-400">DEX Interactions</div>
                  <div className="text-xs text-gray-500 mt-1">Uniswap, SushiSwap, etc.</div>
                </div>
                <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {realData?.transactions?.filter((tx: TransactionData) => {
                      // Enhanced lending detection
                      const isLendingFunction = tx.functionName?.toLowerCase().includes('deposit') || 
                                             tx.functionName?.toLowerCase().includes('withdraw') || 
                                             tx.functionName?.toLowerCase().includes('borrow') || 
                                             tx.functionName?.toLowerCase().includes('repay') ||
                                             tx.functionName?.toLowerCase().includes('supply') ||
                                             tx.functionName?.toLowerCase().includes('redeem');
                      
                      // Common lending method IDs
                      const isLendingMethodId = tx.methodId === '0x6e553f65' || // supply
                                             tx.methodId === '0x69328dec' || // withdraw
                                             tx.methodId === '0xa415bcad' || // borrow
                                             tx.methodId === '0x573ade81';   // repay
                      
                      return isLendingFunction || isLendingMethodId;
                    }).length || 0}
                  </div>
                  <div className="text-sm text-gray-400">Lending Activity</div>
                  <div className="text-xs text-gray-500 mt-1">Aave, Compound, etc.</div>
                </div>
                <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {realData?.transactions?.filter((tx: TransactionData) => {
                      // Enhanced staking detection
                      const isStakingFunction = tx.functionName?.toLowerCase().includes('stake') || 
                                             tx.functionName?.toLowerCase().includes('unstake') || 
                                             tx.functionName?.toLowerCase().includes('claim') ||
                                             tx.functionName?.toLowerCase().includes('harvest') ||
                                             tx.functionName?.toLowerCase().includes('compound');
                      
                      // Common staking method IDs
                      const isStakingMethodId = tx.methodId === '0xa694fc3a' || // stake
                                             tx.methodId === '0x2e17de78' || // unstake
                                             tx.methodId === '0x2e1a7d4d' || // withdraw
                                             tx.methodId === '0x1249c58b';   // claim
                      
                      return isStakingFunction || isStakingMethodId;
                    }).length || 0}
                  </div>
                  <div className="text-sm text-gray-400">Staking Activity</div>
                  <div className="text-xs text-gray-500 mt-1">Yield farming, staking</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Smart Contract Interactions */}
          <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Database className="w-5 h-5 text-orange-400" />
                <span>Smart Contract Interactions</span>
                <Badge className="bg-orange-600/20 text-orange-300 border-orange-600/30">
                  Live Data
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-800/50 rounded-lg">
                    <div className="text-lg font-semibold text-white mb-2">Most Active Contracts</div>
                    <div className="space-y-2">
                      {realData?.transactions?.slice(0, 3).map((tx: TransactionData, index: number) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-300 truncate">
                            {tx.to ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : 'Unknown'}
                          </span>
                          <span className="text-blue-400">{tx.functionName || 'Contract Call'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-zinc-800/50 rounded-lg">
                    <div className="text-lg font-semibold text-white mb-2">Contract Categories</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">DeFi Protocols</span>
                        <span className="text-green-400">
                          {realData?.transactions?.filter((tx: TransactionData) => {
                            const isDexFunction = tx.functionName?.toLowerCase().includes('swap') || 
                                                tx.functionName?.toLowerCase().includes('addliquidity') || 
                                                tx.functionName?.toLowerCase().includes('removeliquidity');
                            const isLendingFunction = tx.functionName?.toLowerCase().includes('deposit') || 
                                                   tx.functionName?.toLowerCase().includes('withdraw') || 
                                                   tx.functionName?.toLowerCase().includes('borrow') || 
                                                   tx.functionName?.toLowerCase().includes('repay');
                            const isStakingFunction = tx.functionName?.toLowerCase().includes('stake') || 
                                                   tx.functionName?.toLowerCase().includes('unstake') || 
                                                   tx.functionName?.toLowerCase().includes('claim');
                            return isDexFunction || isLendingFunction || isStakingFunction;
                          }).length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Token Operations</span>
                        <span className="text-blue-400">
                          {realData?.transactions?.filter((tx: TransactionData) => 
                            tx.functionName?.toLowerCase().includes('transfer') || 
                            tx.functionName?.toLowerCase().includes('approve') ||
                            tx.methodId === '0xa9059cbb' || // transfer
                            tx.methodId === '0x095ea7b3'    // approve
                          ).length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Contract Calls</span>
                        <span className="text-purple-400">
                          {realData?.transactions?.filter((tx: TransactionData) => 
                            tx.to && tx.to !== '0x0000000000000000000000000000000000000000' &&
                            !tx.functionName?.toLowerCase().includes('transfer') &&
                            !tx.functionName?.toLowerCase().includes('approve') &&
                            !tx.functionName?.toLowerCase().includes('swap') &&
                            !tx.functionName?.toLowerCase().includes('deposit')
                          ).length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Patterns */}
          <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Clock className="w-5 h-5 text-green-400" />
                <span>Activity Patterns</span>
                <Badge className="bg-green-600/20 text-green-300 border-green-600/30">
                  Enhanced Analysis
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {(() => {
                      if (!realData?.transactions?.length) return 0;
                      
                      // Calculate actual date range from transactions
                      const timestamps = realData.transactions.map((tx: TransactionData) => {
                        const timestamp = typeof tx.timestamp === 'number' ? tx.timestamp : parseInt(tx.timestamp);
                        // Handle both seconds and milliseconds
                        return timestamp > 1e10 ? Math.floor(timestamp / 1000) : timestamp;
                      });
                      
                      const minTime = Math.min(...timestamps);
                      const maxTime = Math.max(...timestamps);
                      const daysDiff = Math.max(1, Math.ceil((maxTime - minTime) / (24 * 60 * 60)));
                      
                      return Math.round(realData.transactions.length / daysDiff);
                    })()}
                  </div>
                  <div className="text-sm text-gray-400">Avg Daily Txs</div>
                  <div className="text-xs text-gray-500 mt-1">Based on actual timeframe</div>
                </div>
                <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {realData?.transactions?.filter((tx: TransactionData) => {
                      try {
                        const timestamp = typeof tx.timestamp === 'number' ? tx.timestamp : parseInt(tx.timestamp);
                        // Handle both seconds and milliseconds
                        const normalizedTimestamp = timestamp > 1e10 ? Math.floor(timestamp / 1000) : timestamp;
                        const date = new Date(normalizedTimestamp * 1000);
                        const day = date.getDay();
                        return day === 0 || day === 6; // Weekend (Sunday = 0, Saturday = 6)
                      } catch {
                        return false;
                      }
                    }).length || 0}
                  </div>
                  <div className="text-sm text-gray-400">Weekend Activity</div>
                  <div className="text-xs text-gray-500 mt-1">Saturday & Sunday</div>
                </div>
                <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {realData?.transactions?.length > 0 ? 
                      (realData.transactions.reduce((sum: number, tx: TransactionData) => sum + parseFloat(tx.value || '0'), 0) / realData.transactions.length / Math.pow(10, 18)).toFixed(6)
                    : 0} ETH
                  </div>
                  <div className="text-sm text-gray-400">Avg Tx Value</div>
                  <div className="text-xs text-gray-500 mt-1">Per transaction</div>
                </div>
                <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {realData?.tokens?.length || 0}
                  </div>
                  <div className="text-sm text-gray-400">Token Diversity</div>
                  <div className="text-xs text-gray-500 mt-1">Unique tokens held</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Health & Efficiency */}
          <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>Network Health & Efficiency</span>
                <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-600/30">
                  Performance
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Gas Efficiency</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                      <span className="text-gray-300">Avg Gas Price</span>
                      <span className="text-white font-semibold">
                        {realData?.transactions?.length > 0 ? 
                          (realData.transactions.reduce((sum: number, tx: TransactionData) => sum + parseFloat(tx.gasPrice || '0'), 0) / realData.transactions.length).toFixed(2)
                        : 0} Gwei
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                      <span className="text-gray-300">Avg Gas Used</span>
                      <span className="text-white font-semibold">
                        {realData?.transactions?.length > 0 ? 
                          Math.round(realData.transactions.reduce((sum: number, tx: TransactionData) => sum + parseFloat(tx.gasUsed || '0'), 0) / realData.transactions.length) : 0
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                      <span className="text-gray-300">Success Rate</span>
                      <span className="text-green-400 font-semibold">
                        {realData?.transactions?.filter((tx: TransactionData) => !tx.isError).length > 0 ? 
                          Math.round((realData.transactions.filter((tx: TransactionData) => !tx.isError).length / realData.transactions.length) * 100) : 0
                        }%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Network Activity</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                      <span className="text-gray-300">Total Transactions</span>
                      <span className="text-white font-semibold">
                        {realData?.transactions?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                      <span className="text-gray-300">Contract Interactions</span>
                      <span className="text-blue-400 font-semibold">
                        {realData?.transactions?.filter((tx: TransactionData) => tx.to !== '0x0000000000000000000000000000000000000000').length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                      <span className="text-gray-300">Token Operations</span>
                      <span className="text-purple-400 font-semibold">
                        {realData?.transactions?.filter((tx: TransactionData) => tx.functionName?.includes('transfer')).length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getProfileUrl(profile: SocialProfile): string {
  const metadata = profile.metadata as Record<string, unknown>;
  
  switch (profile.type) {
    case 'farcaster':
      return `https://warpcast.com/${profile.name}`;
    case 'lens':
      return `https://hey.xyz/u/${profile.name || metadata.handle}`;
    case 'ens':
      return `https://app.ens.domains/${profile.name}`;
    default:
      return '#';
  }
}

function getPlatformColor(type: string): string {
  switch (type) {
    case 'farcaster':
      return 'bg-purple-600';
    case 'lens':
      return 'bg-green-600';
    case 'ens':
      return 'bg-blue-600';
    default:
      return 'bg-gray-600';
  }
}

function getPlatformIcon(type: string): string {
  switch (type) {
    case 'farcaster':
      return '📱';
    case 'lens':
      return '🌿';
    case 'ens':
      return '🌐';
    default:
      return '❓';
  }
}
