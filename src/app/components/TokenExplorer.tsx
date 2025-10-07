/**
 * Token Explorer Component
 * 
 * Nansen-style token explorer for Base ecosystem tokens.
 * Inspired by Nansen's professional token analytics interface.
 * 
 * Features:
 * - Nansen-style token overview layout
 * - Real-time Base ecosystem token data
 * - Professional market data presentation
 * - Token analytics and insights
 * - Social links and community metrics
 * - Responsive design with modern UI
 * 
 * @author Sniffer Web3 Team
 * @version 2.0.0 - Nansen Style
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  ExternalLink,
  RefreshCw,
  Coins,
  Globe,
  AlertCircle,
  Loader2,
  Search,
  X
} from "lucide-react";
import { BaseToken, TokenExplorerState } from "@/lib/types";
import { Input } from "@/components/ui/input";

interface TokenExplorerProps {
  className?: string;
}

// Utility functions - formatting helpers
const formatPrice = (price: number): string => {
  if (price < 0.01) return price.toFixed(6);
  if (price < 1) return price.toFixed(4);
  if (price < 100) return price.toFixed(2);
  return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const formatNumber = (num: number): string => {
  if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toFixed(0);
};

const getPriceChangeDisplay = (change: number) => {
  const isPositive = change >= 0;
  const color = isPositive ? 'text-green-400' : 'text-red-400';
  const bgColor = isPositive ? 'bg-green-500/10' : 'bg-red-500/10';
  const borderColor = isPositive ? 'border-green-500/20' : 'border-red-500/20';
  const icon = isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
  
  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${color} ${bgColor} ${borderColor} border`}>
      {icon}
      <span>{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
    </div>
  );
};

const formatVolume = (volume: number): string => {
  if (volume >= 1000000) {
    return `$${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `$${(volume / 1000).toFixed(1)}K`;
  } else {
    return `$${volume.toFixed(0)}`;
  }
};

const formatLiquidity = (liquidity: number | undefined): string => {
  if (!liquidity) return 'N/A';
  if (liquidity >= 1000000) {
    return `$${(liquidity / 1000000).toFixed(1)}M`;
  } else if (liquidity >= 1000) {
    return `$${(liquidity / 1000).toFixed(1)}K`;
  } else {
    return `$${liquidity.toFixed(0)}`;
  }
};

// Custom hook for managing token data
const useBaseTokens = () => {
  const [state, setState] = useState<TokenExplorerState>({
    tokens: [],
    searchResults: [],
    loading: true,
    searchLoading: false,
    error: null,
    searchQuery: '',
    activeTab: 'base',
    sortBy: 'market_cap',
    sortOrder: 'desc',
    currentPage: 1,
    tokensPerPage: 20, // Show 20 tokens per page for better UI
  });

  const [isHydrated, setIsHydrated] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hydration check
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const fetchTokens = useCallback(async (endpoint: string, forceRefresh: boolean = false) => {
    const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes cache for tokens

    if (!forceRefresh && lastFetchTime && (Date.now() - lastFetchTime) < CACHE_DURATION) {
      console.log('📦 Using cached token data');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setState(prev => ({
          ...prev,
          tokens: data.data,
          loading: false,
          error: null
        }));
        setLastFetchTime(Date.now());
        
        // Show success notification
        toast.success(`Loaded ${data.data.length} Base ecosystem tokens`, {
          duration: 3000,
          icon: '✅',
        });
      } else {
        throw new Error(data.error || 'Failed to fetch tokens');
      }
    } catch (error) {
      console.error('❌ Error fetching tokens:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tokens'
      }));
      
      toast.error('Failed to fetch token data', {
        duration: 4000,
        icon: '⚠️',
        style: {
          background: '#ef4444',
          color: '#ffffff',
        },
      });
    }
  }, [lastFetchTime]);

  const fetchBaseTokens = useCallback(() => {
    fetchTokens('/api/dexscreener/tokens');
  }, [fetchTokens]);


  const searchTokens = useCallback(async (query: string) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, searchResults: [], searchQuery: query }));
      return;
    }

    setState(prev => ({ ...prev, searchLoading: true, error: null }));
    
    try {
      const response = await fetch(`/api/dexscreener/tokens?search=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setState(prev => ({
          ...prev,
          searchResults: data.data,
          searchLoading: false,
          error: null
        }));
        
        toast.success(`Found ${data.data.length} tokens matching "${query}"`, {
          duration: 3000,
          icon: '🔍',
        });
      } else {
        throw new Error(data.error || 'Failed to search tokens');
      }
    } catch (error) {
      console.error('❌ Error searching tokens:', error);
      setState(prev => ({
        ...prev,
        searchLoading: false,
        error: error instanceof Error ? error.message : 'Failed to search tokens'
      }));
      
      toast.error('Failed to search tokens', {
        duration: 4000,
        icon: '⚠️',
      });
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    try {
      if (state.activeTab === 'search') {
        if (state.searchQuery) {
          searchTokens(state.searchQuery);
        }
      } else {
        fetchTokens('/api/dexscreener/tokens', true);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [state.activeTab, state.searchQuery, fetchTokens, searchTokens]);


  // Reset pagination when changing tabs or search
  useEffect(() => {
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, [state.activeTab, state.searchQuery]);

  // Initial data fetch
  useEffect(() => {
    if (isHydrated) {
      fetchBaseTokens();
    }
  }, [isHydrated, fetchBaseTokens]);






  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.searchQuery && state.activeTab === 'search') {
        searchTokens(state.searchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [state.searchQuery, state.activeTab, searchTokens]);

  // Handle sort change
  const handleSortChange = useCallback((sortBy: TokenExplorerState['sortBy']) => {
    setState(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  }, [setState]);

  // Sort tokens
  const sortedTokens = useMemo(() => {
    const tokens = [...state.tokens];
    return tokens.sort((a, b) => {
      const aValue = a[state.sortBy] || 0;
      const bValue = b[state.sortBy] || 0;
      return state.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [state.tokens, state.sortBy, state.sortOrder]);

  // Pagination functions
  const goToPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const getTotalTokens = useCallback(() => {
    return state.activeTab === 'search' ? state.searchResults.length : sortedTokens.length;
  }, [sortedTokens, state.searchResults, state.activeTab]);

  const getDisplayTokens = useCallback(() => {
    const tokens = state.activeTab === 'search' ? state.searchResults : sortedTokens;
    const startIndex = (state.currentPage - 1) * state.tokensPerPage;
    const endIndex = startIndex + state.tokensPerPage;
    return tokens.slice(startIndex, endIndex);
  }, [sortedTokens, state.searchResults, state.activeTab, state.currentPage, state.tokensPerPage]);

  const nextPage = useCallback(() => {
    const totalPages = Math.ceil(getTotalTokens() / state.tokensPerPage);
    if (state.currentPage < totalPages) {
      setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  }, [state.currentPage, state.tokensPerPage, getTotalTokens]);

  const prevPage = useCallback(() => {
    if (state.currentPage > 1) {
      setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  }, [state.currentPage]);


  return {
    state,
    setState,
    fetchBaseTokens,
    searchTokens,
    handleRefresh,
    isHydrated,
    lastFetchTime,
    isRefreshing,
    handleSortChange,
    sortedTokens,
    // Pagination functions
    goToPage,
    nextPage,
    prevPage,
    getDisplayTokens,
    getTotalTokens
  };
};

// Main component
export function TokenExplorer({ className = "" }: TokenExplorerProps) {
  const {
    state,
    setState,
    fetchBaseTokens,
    handleRefresh,
    isHydrated,
    lastFetchTime,
    isRefreshing,
    handleSortChange,
    sortedTokens,
    goToPage,
    nextPage,
    prevPage,
    getDisplayTokens,
    getTotalTokens
  } = useBaseTokens();


  // Handle tab change
  const handleTabChange = useCallback((value: 'base' | 'search') => {
    setState(prev => ({ ...prev, activeTab: value }));
    
    // Fetch appropriate data
    if (value === 'search') {
      // Don't fetch anything, wait for search query
    } else {
      fetchBaseTokens();
    }
  }, [fetchBaseTokens, setState]);

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className={`w-full max-w-7xl mx-auto space-y-8 ${className}`}>
        <div className="bg-gradient-to-r from-zinc-900/90 to-zinc-800/90 backdrop-blur-md rounded-2xl border border-zinc-700/50 p-8">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl animate-pulse"></div>
            <div className="flex-1">
              <div className="h-8 bg-zinc-700 rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-4 bg-zinc-700 rounded w-48 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-zinc-900/60 backdrop-blur-md border border-zinc-700/50 rounded-xl p-4 animate-pulse">
              <div className="w-10 h-10 bg-zinc-700 rounded-lg mb-3"></div>
              <div className="h-5 bg-zinc-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-zinc-700 rounded w-1/2 mb-3"></div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-zinc-800/50 rounded-lg p-2.5">
                  <div className="h-2 bg-zinc-700 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-zinc-700 rounded w-12"></div>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-2.5">
                  <div className="h-2 bg-zinc-700 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-zinc-700 rounded w-12"></div>
                </div>
              </div>
              <div className="h-8 bg-zinc-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-7xl mx-auto space-y-8 ${className}`}>
      {/* Nansen-style Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/95 via-blue-900/20 to-purple-900/30 backdrop-blur-xl rounded-3xl border border-blue-500/20 shadow-2xl shadow-blue-500/10">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-cyan-600/10 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl translate-y-40 -translate-x-40"></div>
        
        <div className="relative z-10 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/50 animate-pulse">
                  <Coins className="w-10 h-10 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl blur opacity-30 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                  Base Token Explorer
                </h1>
                <p className="text-gray-300/90 text-lg mt-2 font-medium">
                  Professional token analytics for Base ecosystem
                </p>
                <div className="flex items-center space-x-4 mt-3">
                  <Button
                    onClick={handleRefresh}
                    disabled={isRefreshing || state.loading}
                    variant="outline"
                    size="sm"
                    className="bg-blue-600/20 border-blue-500/50 text-blue-300 hover:bg-blue-600/30 hover:border-blue-400/70 transition-all duration-200"
                  >
                    {isRefreshing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                  {lastFetchTime && (
                    <span className="text-xs text-gray-400">
                      Last updated: {new Date(lastFetchTime).toLocaleTimeString()}
                    </span>
                  )}
                  <Badge className={`${
                    lastFetchTime && (Date.now() - lastFetchTime) < 3 * 60 * 1000 
                      ? 'bg-green-600/20 text-green-300 border-green-600/30' 
                      : 'bg-blue-600/20 text-blue-300 border-blue-600/30'
                  } px-3 py-1`}>
                    {lastFetchTime && (Date.now() - lastFetchTime) < 3 * 60 * 1000 
                      ? 'Cached Data' 
                      : 'Live Data'
                    }
                  </Badge>
                  <Badge className="bg-green-600/20 text-green-300 border-green-600/30 px-3 py-1">
                    Base Ecosystem
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="relative overflow-hidden bg-gradient-to-r from-zinc-900/80 via-slate-900/60 to-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-600/30 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-cyan-600/5"></div>
        <div className="relative z-10 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="text-gray-300 font-semibold text-sm whitespace-nowrap">
              Sort by:
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { key: "market_cap" as const, label: "Market Cap", icon: "📊" },
                { key: "current_price" as const, label: "Price", icon: "💰" },
                { key: "total_volume" as const, label: "Volume", icon: "📈" },
                { key: "price_change_percentage_24h" as const, label: "24h Change", icon: "⚡" }
              ].map((option) => (
                <Button
                  key={option.key}
                  onClick={() => handleSortChange(option.key)}
                  variant={state.sortBy === option.key ? "default" : "outline"}
                  size="sm"
                  className={`h-10 px-4 rounded-lg font-medium transition-all duration-200 ${
                    state.sortBy === option.key
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg border-blue-600"
                      : "bg-zinc-700/50 text-zinc-300 hover:bg-zinc-600/50 border-zinc-600/50"
                  }`}
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                  {state.sortBy === option.key && (
                    <span className="ml-2 text-xs font-bold">
                      {state.sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Nansen-style Content Tabs */}
      <Tabs value={state.activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-700/50 p-2 mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-transparent h-12">
            <TabsTrigger 
              value="base" 
              className="flex items-center justify-center space-x-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-200"
              disabled={state.loading}
            >
              <Globe className="w-5 h-5" />
              <span>Base Tokens</span>
              {state.tokens.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-zinc-700/50 text-zinc-300 border-zinc-600">
                  {state.tokens.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="search" 
              className="flex items-center justify-center space-x-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-200"
              disabled={state.searchLoading}
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
              {state.searchResults.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-zinc-700/50 text-zinc-300 border-zinc-600">
                  {state.searchResults.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Base Ecosystem Tab */}
        <TabsContent value="base" className="space-y-6 mt-6">
          {state.loading ? (
            <TokenGridSkeleton />
          ) : state.error ? (
            <ErrorState 
              error={state.error} 
              onRetry={handleRefresh}
              title="Error Loading Base Tokens"
            />
          ) : sortedTokens.length === 0 ? (
            <EmptyState 
              title="No Base Tokens Found"
              description="No tokens found matching your search criteria."
              icon={Coins}
            />
          ) : (
            <TokenGrid 
              tokens={getDisplayTokens()} 
              currentPage={state.currentPage}
              tokensPerPage={state.tokensPerPage}
              totalTokens={getTotalTokens()}
              onPageChange={goToPage}
              onNextPage={nextPage}
              onPrevPage={prevPage}
            />
          )}
        </TabsContent>


        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6 mt-6">
          {/* Search Input */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search tokens by name, symbol, or contract address..."
                value={state.searchQuery}
                onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="pl-10 pr-10 h-12 bg-zinc-900/60 border-zinc-600/50 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/20"
              />
              {state.searchQuery && (
                <button
                  onClick={() => setState(prev => ({ ...prev, searchQuery: '', searchResults: [] }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Search Results */}
          {state.searchLoading ? (
            <TokenGridSkeleton />
          ) : state.searchResults.length > 0 ? (
            <TokenGrid 
              tokens={getDisplayTokens()} 
              currentPage={state.currentPage}
              tokensPerPage={state.tokensPerPage}
              totalTokens={getTotalTokens()}
              onPageChange={goToPage}
              onNextPage={nextPage}
              onPrevPage={prevPage}
            />
          ) : state.searchQuery ? (
            <EmptyState 
              title="No Tokens Found"
              description={`No tokens found matching "${state.searchQuery}". Try searching with a different term.`}
              icon={Search}
            />
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-xl mb-2">Search Tokens</h3>
              <p className="text-gray-400">Enter a token name, symbol, or contract address to search</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Sub-components for better organization
 */

// Loading skeleton table (matches new table layout)
function TokenGridSkeleton() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-700/50 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-800/50 border-b border-zinc-700/50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Token
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Price
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Market Cap
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                24h Change
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Volume 24h
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Liquidity
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                <span className="flex items-center justify-end space-x-1" title="Click to trade on exchange">
                  <span>DEX</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </span>
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700/30">
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="hover:bg-zinc-800/30 transition-colors duration-150">
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </td>
                <td className="px-4 py-4 text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </td>
                <td className="px-4 py-4 text-right">
                  <Skeleton className="h-6 w-16 ml-auto rounded-full" />
                </td>
                <td className="px-4 py-4 text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </td>
                <td className="px-4 py-4 text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </td>
                <td className="px-4 py-4 text-right">
                  <Skeleton className="h-4 w-12 ml-auto" />
                </td>
                <td className="px-4 py-4 text-center">
                  <Skeleton className="h-8 w-20 mx-auto rounded-lg" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Error state component
function ErrorState({ 
  error, 
  onRetry, 
  title 
}: { 
  error: string; 
  onRetry: () => void; 
  title: string;
}) {
  return (
    <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md shadow-xl">
      <CardContent className="p-12 text-center">
        <div className="text-red-400 mb-6">
          <AlertCircle className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-white font-semibold text-xl mb-3">{title}</h3>
        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">{error}</p>
        <Button onClick={onRetry} variant="outline" className="bg-zinc-700 text-zinc-300 hover:bg-zinc-600">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}

// Empty state component
function EmptyState({ 
  title, 
  description, 
  icon: Icon 
}: { 
  title: string; 
  description: string; 
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md shadow-xl">
      <CardContent className="p-12 text-center">
        <div className="text-gray-400 mb-6">
          <Icon className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-white font-semibold text-xl mb-3">{title}</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">{description}</p>
      </CardContent>
    </Card>
  );
}

// DEXScreener-style token table component with pagination
function TokenGrid({ 
  tokens, 
  currentPage, 
  tokensPerPage, 
  totalTokens,
  onPageChange,
  onNextPage,
  onPrevPage 
}: { 
  tokens: BaseToken[];
  currentPage: number;
  tokensPerPage: number;
  totalTokens: number;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}) {
  const totalPages = Math.ceil(totalTokens / tokensPerPage);
  const startToken = (currentPage - 1) * tokensPerPage + 1;
  const endToken = Math.min(currentPage * tokensPerPage, totalTokens);

  return (
    <div className="space-y-4">
      {/* Token Count Info */}
      <div className="flex justify-between items-center text-sm text-zinc-400">
        <span>
          Showing {startToken}-{endToken} of {totalTokens} tokens
        </span>
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-zinc-800/60 to-zinc-700/40 border-b border-zinc-600/50">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Token
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Market Cap
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  24h Change
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Volume 24h
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Liquidity
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  <span className="flex items-center justify-end space-x-1" title="Click to trade on exchange">
                    <span>DEX</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </span>
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700/30">
              {tokens.map((token) => (
                <tr key={token.id} className="group hover:bg-gradient-to-r hover:from-zinc-800/20 hover:to-zinc-700/10 transition-all duration-300 border-b border-zinc-800/30 hover:border-zinc-700/50">
                  {/* Token Info */}
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Image
                          src={token.image}
                          alt={token.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-xl ring-2 ring-zinc-700/50 group-hover:ring-blue-500/30 transition-all duration-300 shadow-lg group-hover:shadow-blue-500/10"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${token.symbol}&background=6366f1&color=ffffff&size=40&bold=true`;
                          }}
                        />
                        <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-semibold text-sm tracking-tight group-hover:text-blue-100 transition-colors duration-200">
                            {token.symbol}
                          </span>
                          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20 px-2 py-0.5">
                            Base
                          </Badge>
                        </div>
                        <p className="text-zinc-400 text-xs truncate max-w-[140px] group-hover:text-zinc-300 transition-colors duration-200">{token.name}</p>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-5 text-right">
                    <span className="text-white font-semibold text-sm group-hover:text-blue-100 transition-colors duration-200">
                      ${formatPrice(token.current_price)}
                    </span>
                  </td>

                  {/* Market Cap */}
                  <td className="px-6 py-5 text-right">
                    <span className="text-white text-sm group-hover:text-blue-100 transition-colors duration-200">
                      ${formatNumber(token.market_cap || 0)}
                    </span>
                  </td>

                  {/* 24h Change */}
                  <td className="px-6 py-5 text-right">
                    {getPriceChangeDisplay(token.price_change_percentage_24h)}
                  </td>

                  {/* Volume 24h */}
                  <td className="px-6 py-5 text-right">
                    <span className="text-white text-sm group-hover:text-blue-100 transition-colors duration-200">
                      {formatVolume(token.total_volume)}
                    </span>
                  </td>

                  {/* Liquidity */}
                  <td className="px-6 py-5 text-right">
                    <span className="text-white text-sm group-hover:text-blue-100 transition-colors duration-200">
                      {formatLiquidity(token.dex_data?.liquidity?.usd)}
                    </span>
                  </td>

                  {/* DEX */}
                  <td className="px-6 py-5 text-right">
                    {token.dex_data?.dexId ? (
                      <button
                        onClick={() => {
                          const dexId = token.dex_data?.dexId;
                          const tokenAddress = token.contract_address;
                          if (!dexId || !tokenAddress) return;
                          
                          let tradingUrl: string | null = null;
                          switch (dexId.toLowerCase()) {
                            case 'uniswap':
                              tradingUrl = `https://app.uniswap.org/#/swap?chain=base&inputCurrency=${tokenAddress}`;
                              break;
                            case 'aerodrome':
                              tradingUrl = `https://aerodrome.finance/swap?inputCurrency=${tokenAddress}`;
                              break;
                            default:
                              tradingUrl = token.dex_data?.url || `https://dexscreener.com/base/${tokenAddress}`;
                          }
                          
                          if (tradingUrl) {
                            window.open(tradingUrl, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium hover:underline transition-colors duration-200 cursor-pointer"
                        title={`Trade ${token.symbol} on ${token.dex_data.dexId}`}
                      >
                        {token.dex_data.dexId.charAt(0).toUpperCase() + token.dex_data.dexId.slice(1)}
                      </button>
                    ) : (
                      <span className="text-zinc-500 text-sm">N/A</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        onClick={() => {
                          const url = token.dex_data?.url || `https://dexscreener.com/base/${token.contract_address}`;
                          if (url) window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                        size="sm"
                        variant="outline"
                        className="bg-zinc-700/50 border-zinc-600/50 text-zinc-300 hover:bg-zinc-600/50 hover:border-zinc-500/50 text-xs px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md hover:shadow-blue-500/10"
                      >
                        <ExternalLink className="w-3 h-3 mr-1.5 group-hover:scale-110 transition-transform duration-200" />
                        View
                      </Button>
                      <Button
                        onClick={() => {
                          if (token.contract_address) {
                            navigator.clipboard.writeText(token.contract_address);
                            toast.success('Contract address copied!');
                          }
                        }}
                        size="sm"
                        variant="outline"
                        className="bg-zinc-700/50 border-zinc-600/50 text-zinc-300 hover:bg-zinc-600/50 hover:border-zinc-500/50 text-xs px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md hover:shadow-blue-500/10"
                      >
                        <ExternalLink className="w-3 h-3 mr-1.5 group-hover:scale-110 transition-transform duration-200" />
                        Copy
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            onClick={onPrevPage}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            className="bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  className={`${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/50"
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            onClick={onNextPage}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
            className="bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

