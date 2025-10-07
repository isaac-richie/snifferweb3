/**
 * Sniffer Web3 - Main Application Page
 * 
 * This is the main page component for the Sniffer Web3 application, which provides
 * comprehensive identity discovery and wallet profiling across multiple platforms.
 * 
 * Features:
 * - Universal identity search (ENS, Basenames, Farcaster, Lens, Zora)
 * - Base blockchain wallet profiling with Etherscan API integration
 * - Social profile aggregation and display
 * - Modern responsive UI with dark theme
 * 
 * @author Sniffer Web3 Team
 * @version 1.0.0
 */

"use client";
import { useEffect, useState } from "react";
import { getSocialProfiles,SocialProfile } from "thirdweb/social";
import { client } from "./client";
// import { shortenAddress } from "thirdweb/utils";
import { ENSCard } from "./components/ENSCard";
import { FarcasterCard } from "./components/FarcasterCard";
import { LensCard } from "./components/LensCard";
import { CardSkeleton } from "./components/CardSkeleton";
import { resolveAddress, BASENAME_RESOLVER_ADDRESS } from "thirdweb/extensions/ens";
import { base } from "thirdweb/chains";
import { BaseCard } from "./components/BaseCard";
import { ZoraCard } from "./components/ZoraCard";
import { WalletProfiler } from "./components/WalletProfiler";
import { TokenExplorer } from "./components/TokenExplorer";
import Footer from "./Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Sparkles, Users, Globe, Camera, Zap, Moon, Sun, User, BarChart3, Coins } from "lucide-react";
import toast from "react-hot-toast";


/**
 * Filter types for the tab navigation system
 * Controls which profiles are displayed in the results grid
 */
type FilterType = "all" | "ens" | "farcaster" | "lens" | "base" | "zora" | "profiler" | "tokens";

/**
 * Validates if a string is a valid Ethereum address
 * @param address - The string to validate
 * @returns boolean - True if valid Ethereum address format
 */
const isValidEthereumAddress = (address: string) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Determines if a search term is likely a name (ENS/Basename) rather than an address
 * @param value - The search term to analyze
 * @returns boolean - True if likely a name format
 */
const isLikelyName = (value: string) => {
  if (!value) return false;
  const lower = value.trim().toLowerCase();
  // Accept common ENS/Basenames inputs: .eth, .base, .cb.id, and names with dots
  return lower.endsWith(".eth") || lower.endsWith(".base") || lower.endsWith(".cb.id") || lower.includes(".");
};

/**
 * Normalizes Basename formats to canonical ENS format
 * Converts "name.base" or "name.cb.id" to "name.base.eth" format
 * @param value - The name to normalize
 * @returns string - Normalized name in ENS format
 */
const normalizeBasename = (value: string) => {
  const lower = value.trim().toLowerCase();
  // Map "name.base" or "name.cb.id" to the canonical L2 ENS style under base: name.base.eth
  if (lower.endsWith(".base")) return `${lower}.eth`;
  if (lower.endsWith(".cb.id")) return `${lower.replace(/\.cb\.id$/, ".base")}.eth`;
  return lower;
};

/**
 * Checks if a name is a Basename (Base blockchain ENS name)
 * @param name - The name to check
 * @returns boolean - True if it's a Basename
 */
const isBasenameName = (name: string | undefined | null) => {
  if (!name) return false;
  const lower = name.toLowerCase();
  return (
    lower.endsWith('.base.eth') ||
    lower.endsWith('.base') ||
    lower.endsWith('.cb.id') ||
    lower.includes('.base') ||
    lower.includes('.cb.id')
  );
};

/**
 * Main Home Component - Sniffer Web3 Application
 * 
 * This component manages the entire application state and user interactions.
 * It handles search functionality, profile fetching, and UI state management.
 * 
 * @returns JSX.Element - The complete application interface
 */
export default function Home() {
  // Search and address state
  const [searchInput, setSearchInput] = useState(""); // Current search input
  const [searchedAddress, setSearchedAddress] = useState(""); // Resolved address from search
  const [originalSearchTerm, setOriginalSearchTerm] = useState(""); // Original search term for display
  
  // Profile and data state
  const [userProfiles, setUserProfiles] = useState<SocialProfile[]>([]); // Fetched social profiles
  const [activeFilter, setActiveFilter] = useState<FilterType>("all"); // Current tab filter
  const [hasSearched, setHasSearched] = useState(false); // Whether a search has been performed
  const [isLoading, setIsLoading] = useState(false); // Loading state for API calls
  
  // Validation and UI state
  const [isValidAddress, setIsValidAddress] = useState(false); // Address format validation
  // Search history disabled for now
  // const [searchHistory, setSearchHistory] = useState<string[]>([]);
  // const [isSearchHistoryOpen, setIsSearchHistoryOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Theme preference
  const [isHydrated, setIsHydrated] = useState(false); // Hydration state
  const [searchAbortController, setSearchAbortController] = useState<AbortController | null>(null); // For canceling searches
  
  // Computed validation state
  const isValidSearch = isValidAddress || isLikelyName(searchInput);

  useEffect(() => { setIsValidAddress(isValidEthereumAddress(searchInput)); },
    [searchInput]
  );

  // Initialize app state from localStorage with hydration safety
  useEffect(() => {
    const initializeApp = () => {
      try {
        // Search history disabled for now
        // const savedHistory = localStorage.getItem('sniffer-search-history');
        // if (savedHistory) {
        //   const parsed = JSON.parse(savedHistory);
        //   if (Array.isArray(parsed)) {
        //     setSearchHistory(parsed);
        //   }
        // }

        // Load theme preference
        const savedTheme = localStorage.getItem('sniffer-theme');
        setIsDarkMode(savedTheme === 'dark' || savedTheme === null);
      } catch (error) {
        console.warn('Failed to load app preferences:', error);
        // Reset to defaults on error
        // setSearchHistory([]);
        setIsDarkMode(true);
      } finally {
        // Mark as hydrated after initialization
        setIsHydrated(true);
      }
    };

    // Only initialize on client side
    if (typeof window !== 'undefined') {
      initializeApp();
    }
  }, []);

  // Apply theme to document (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      document.body.classList.toggle('dark', isDarkMode);
      localStorage.setItem('sniffer-theme', isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode, isHydrated]);

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Search history disabled for now
  // Close search history when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     const target = event.target as Element;
  //     if (isSearchHistoryOpen && !target.closest('.search-container')) {
  //       setIsSearchHistoryOpen(false);
  //     }
  //   };

  //   if (isSearchHistoryOpen) {
  //     document.addEventListener('mousedown', handleClickOutside);
  //     return () => document.removeEventListener('mousedown', handleClickOutside);
  //   }
  // }, [isSearchHistoryOpen]);

  // Search history disabled for now
  // Search history management with debouncing and validation
  // const addToSearchHistory = useCallback((term: string) => {
  //   if (!term?.trim()) return;
  //   
  //   const trimmedTerm = term.trim();
  //   const MAX_HISTORY_SIZE = 10;
  //   
  //   setSearchHistory(prev => {
  //     // Remove duplicates and add to front
  //     const filtered = prev.filter(item => item !== trimmedTerm);
  //     const newHistory = [trimmedTerm, ...filtered].slice(0, MAX_HISTORY_SIZE);
  //     
  //     // Persist to localStorage
  //     try {
  //       localStorage.setItem('sniffer-search-history', JSON.stringify(newHistory));
  //     } catch (error) {
  //       console.warn('Failed to save search history:', error);
  //     }
  //     
  //     return newHistory;
  //   });
  // }, []);

  // Clear search history
  // const clearSearchHistory = useCallback(() => {
  //   setSearchHistory([]);
  //   try {
  //     localStorage.removeItem('sniffer-search-history');
  //   } catch (error) {
  //     console.warn('Failed to clear search history:', error);
  //   }
  // }, []);


  /**
   * Share profile functionality - allows users to share profiles via Web Share API or clipboard
   * 
   * @param address - The wallet address to share
   * @param name - The display name for the profile
   * @async
   * @returns Promise<void>
   */
  const shareProfile = async (address: string, name: string) => {
    const shareData = {
      title: `${name} - Sniffer Web3 Profile`,
      text: `Check out ${name}'s Web3 identity on Sniffer`,
      url: `${window.location.origin}?search=${encodeURIComponent(address)}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareData.url);
      alert('Profile link copied to clipboard!');
    }
  };

  const cancelSearch = () => {
    if (searchAbortController) {
      searchAbortController.abort();
      setSearchAbortController(null);
    }
    setIsLoading(false);
    toast.dismiss('search-loading');
    toast.error('Search cancelled by user', {
      duration: 2000,
      icon: '⏹️',
    });
  };

  /**
   * Main search handler - processes user input and fetches social profiles
   * 
   * This function:
   * 1. Validates the search input
   * 2. Resolves ENS/Basenames to addresses if needed
   * 3. Fetches social profiles from multiple platforms
   * 4. Updates application state with results
   * 
   * @async
   * @returns Promise<void>
   */
  const handleSearch = async () => {
    if (!searchInput.trim()) {
      toast.error('Please enter an address or username to search', {
        duration: 4000,
        icon: '🔍',
        style: {
          background: '#f59e0b',
          color: '#ffffff',
        },
      });
      return;
    }
    
    if (!isValidSearch) {
      toast.error('Please enter a valid Ethereum address or ENS domain', {
        duration: 4000,
        icon: '❌',
        style: {
          background: '#ef4444',
          color: '#ffffff',
        },
      });
      return;
    }
    setIsLoading(true);
    setOriginalSearchTerm(searchInput);
    // addToSearchHistory(searchInput); // Search history disabled
    let addressToLookup = searchInput;
    
    // Show initial loading message
    toast.loading('Starting search...', {
      id: 'search-loading',
      duration: 1000,
    });
    
    try {
      if (!isValidAddress) {
        // Update loading message for ENS resolution
        toast.loading('Resolving ENS/Basename...', {
          id: 'search-loading',
          duration: 1000,
        });
        
        // Resolve ENS / Basename to an address
        const maybeBasename = normalizeBasename(searchInput);
        // If it's a basename variant, use the Basename resolver on Base
        const isBasenameLike = maybeBasename.endsWith(".base.eth");
        const resolved = await resolveAddress({
          client,
          name: maybeBasename,
          ...(isBasenameLike ? { resolverAddress: BASENAME_RESOLVER_ADDRESS, resolverChain: base } : {}),
        });
        if (!resolved) throw new Error("Name could not be resolved to an address");
        addressToLookup = resolved;
        
        // Update loading message for profile fetching
        toast.loading('Fetching social profiles...', {
          id: 'search-loading',
          duration: 2000,
        });
      }
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      setHasSearched(true);
      setUserProfiles([]);
      toast.dismiss('search-loading');
      toast.error(`Username "${searchInput}" not found or could not be resolved`, {
        duration: 5000,
        icon: '❌',
        style: {
          background: '#ef4444',
          color: '#ffffff',
        },
      });
      return;
    }
    
    setSearchedAddress(addressToLookup);
    
    try {
      // Show progress message for social profile fetching
      toast.loading('Searching social platforms (Farcaster, Lens, ENS, etc.)...', {
        id: 'search-loading',
        duration: 3000,
      });
      
      // Add timeout to prevent hanging
      console.log(`🔍 Starting social profile search for address: ${addressToLookup}`);
      const startTime = Date.now();
      
      const profilesPromise = getSocialProfiles({
        client: client,
        address: addressToLookup,
      });
      
      // Race between profiles fetch and timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          const elapsed = Date.now() - startTime;
          console.log(`⏰ Social profile search timed out after ${elapsed}ms`);
          reject(new Error('Social profile fetch timed out after 30 seconds'));
        }, 30000);
      });
      
      const profiles = await Promise.race([profilesPromise, timeoutPromise]);
      const elapsed = Date.now() - startTime;
      console.log(`✅ Social profile search completed in ${elapsed}ms`);
      console.log(`🔍 Raw profiles data:`, JSON.stringify(profiles, null, 2));
      
      // Log each profile's metadata in detail
      profiles.forEach((profile, index) => {
        console.log(`📊 Profile ${index + 1} (${profile.type}):`, {
          name: profile.name,
          avatar: profile.avatar,
          bio: profile.bio,
          metadata: profile.metadata,
          fullProfile: profile
        });
      });
      
      // Dismiss loading toast
      toast.dismiss('search-loading');
      
      setUserProfiles(profiles);
      setHasSearched(true);
      
      // Debug log to see what profile data we're getting
      console.log('🔍 Social profiles fetched:', profiles);
      profiles.forEach((profile, index) => {
        console.log(`Profile ${index + 1}:`, {
          type: profile.type,
          name: profile.name,
          metadata: profile.metadata
        });
      });
      
      // Show notification if no profiles found
      if (profiles.length === 0) {
        toast.error(`No social profiles found for "${originalSearchTerm}"`, {
          duration: 4000,
          icon: '👤',
          style: {
            background: '#f59e0b',
            color: '#ffffff',
          },
        });
      } else {
        toast.success(`Found ${profiles.length} profile${profiles.length > 1 ? 's' : ''} for "${originalSearchTerm}"`, {
          duration: 3000,
          icon: '✅',
        });
      }
    } catch (error) { 
      console.error(error);
      toast.dismiss('search-loading');
      
      // Show specific error messages
      if (error instanceof Error && error.message.includes('timed out')) {
        toast.error(`Social profile search timed out after 30 seconds. The services may be slow or overloaded. Please try again.`, {
          duration: 6000,
          icon: '⏰',
          style: {
            background: '#f59e0b',
            color: '#ffffff',
          },
        });
      } else if (error instanceof Error && error.message.includes('fetch')) {
        toast.error(`Network error while fetching profiles. Please check your connection and try again.`, {
          duration: 5000,
          icon: '🌐',
          style: {
            background: '#ef4444',
            color: '#ffffff',
          },
        });
      } else if (error instanceof Error && error.message.includes('rate limit')) {
        toast.error(`API rate limit exceeded. Please wait a moment and try again.`, {
          duration: 5000,
          icon: '🚦',
          style: {
            background: '#f59e0b',
            color: '#ffffff',
          },
        });
      } else {
        toast.error(`Failed to fetch profiles for "${originalSearchTerm}". ${error instanceof Error ? error.message : 'Unknown error'}`, {
          duration: 5000,
          icon: '⚠️',
        });
      }
    }
    finally {
      setIsLoading(false);
    }
  }

  const filteredProfiles = userProfiles.filter(profile => {
    if (activeFilter === "all") return true;
    if (activeFilter === "profiler") {
      // Profiler tab shows only the profiler dashboard, no social profiles
      return false;
    }
    if (activeFilter === "base") {
      return profile.type === "ens" && isBasenameName(profile.name);
    }
    if (activeFilter === "zora") {
      // Show only the Zora card (outside the map), skip social profiles in the grid loop
      return false;
    }
    return profile.type === activeFilter;
  });

  const includeZoraCard = activeFilter === "zora" || activeFilter === "all";

  // Show loading state during hydration to prevent layout shifts
  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-transparent flex flex-col">
        <div className="flex-1 container mx-auto px-4 py-8 relative z-10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl shadow-2xl shadow-blue-500/30 animate-pulse">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-blue-100 via-cyan-200 to-blue-300 bg-clip-text text-transparent leading-tight tracking-tight">
              Sniffer
            </h1>
            <p className="text-xl text-blue-200 mt-4">Web3 Identity Discovery Platform</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-blue-900/40 border-blue-800/60 backdrop-blur-md shadow-xl">
              <CardContent className="p-8">
                <div className="animate-pulse">
                  <div className="h-4 bg-blue-800/50 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-blue-800/50 rounded w-1/2 mx-auto"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl shadow-2xl shadow-blue-500/30 animate-pulse">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <div className="text-center relative">
                <h1 className="brand-title text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-blue-100 via-cyan-200 to-blue-300 bg-clip-text text-transparent leading-tight tracking-tight relative">
                  Sniffer
                  <span className="brand-shimmer absolute inset-0 bg-gradient-to-r from-white via-blue-100 via-cyan-200 to-blue-300 bg-clip-text text-transparent"></span>
                </h1>
                <h2 className="brand-subtitle text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-300 via-blue-200 to-white bg-clip-text text-transparent leading-tight tracking-wider relative">
                  Web3
                  <span className="brand-shimmer absolute inset-0 bg-gradient-to-r from-cyan-300 via-blue-200 to-white bg-clip-text text-transparent"></span>
                </h2>
              </div>
            </div>
          </div>
          <p className="text-lg text-blue-200 mb-8 max-w-2xl mx-auto">
            Discover onchain identities across ENS, Basenames, Farcaster, Lens, and Zora
          </p>

          {/* Search Section */}
          <Card className="max-w-2xl mx-auto bg-blue-900/40 border-blue-800/60 backdrop-blur-md shadow-2xl">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <div className="relative flex-1 search-container">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                  <Input
                    type="text"
                    placeholder="Enter address or name (ENS/Basename)"
                    className="pl-10 bg-blue-800/30 border-blue-700/50 text-white placeholder:text-blue-300 focus:border-cyan-400 focus:ring-cyan-400/20"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter' && !isLoading && isValidSearch) {
                        handleSearch();
                      } else if (e.key === 'Escape') {
                        // setIsSearchHistoryOpen(false); // Search history disabled
                      }
                    }}
                    // onFocus={() => setIsSearchHistoryOpen(true)} // Search history disabled
                    // onBlur={(e) => {
                    //   // Delay closing to allow clicking on history items
                    //   setTimeout(() => {
                    //     const activeElement = document.activeElement;
                    //     if (activeElement && e.currentTarget && !e.currentTarget.contains(activeElement)) {
                    //       setIsSearchHistoryOpen(false);
                    //     }
                    //   }, 150);
                    // }} // Search history disabled
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  
                  {/* Search History Dropdown - Disabled for now */}
                  {/* {isSearchHistoryOpen && searchHistory.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-blue-900/95 border border-blue-700/50 rounded-lg shadow-xl z-[9999] backdrop-blur-md max-h-60 overflow-y-auto">
                      <div className="p-2">
                        <div className="flex items-center justify-between mb-2 px-1">
                          <span className="text-blue-300 text-sm font-medium">Recent searches</span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearSearchHistory}
                              className="text-blue-400 hover:text-red-400 h-6 px-2 text-xs"
                              title="Clear history"
                            >
                              Clear
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsSearchHistoryOpen(false)}
                              className="text-blue-400 hover:text-white h-6 w-6 p-0"
                              title="Close"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {searchHistory.map((term, index) => (
                            <button
                              key={`${term}-${index}`}
                              onClick={() => {
                                setSearchInput(term);
                                setIsSearchHistoryOpen(false);
                                handleSearch();
                              }}
                              className="w-full text-left px-3 py-2 text-blue-200 hover:bg-blue-800/50 rounded-md text-sm flex items-center gap-2 transition-colors duration-150"
                              onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                            >
                              <History className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{term}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )} */}
                </div>
                <Button 
                  onClick={isLoading ? cancelSearch : handleSearch}
                  disabled={!isValidSearch}
                  className={`px-8 ${
                    isLoading 
                      ? "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700" 
                      : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  } text-white`}
                >
                  {isLoading ? "Cancel Search" : "Search"}
                </Button>
                <Button
                  onClick={toggleTheme}
                  variant="outline"
                  className="border-blue-700/50 text-blue-300 hover:bg-blue-800/30"
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
              {searchInput && !isValidSearch && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span>
                  Enter a valid address or name (e.g., vitalik.eth or alice.base)
                </p>
              )}
            </CardContent>
          </Card>
        </div>


        {/* Main Dashboard - Always Visible */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Choose Your Tool</h2>
            <p className="text-blue-200 mb-6">Select from our comprehensive Web3 analysis tools</p>
            
            <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as FilterType)} className="w-full">
              <TabsList className="grid w-full grid-cols-8 bg-blue-900/40 border-blue-800/60 backdrop-blur-md shadow-xl">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  All
                </TabsTrigger>
                <TabsTrigger value="profiler" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profiler
                </TabsTrigger>
                <TabsTrigger value="tokens" className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Tokens
                </TabsTrigger>
                <TabsTrigger value="ens" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  ENS
                </TabsTrigger>
                <TabsTrigger value="base" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Baseapp
                </TabsTrigger>
                <TabsTrigger value="farcaster" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Farcaster
                </TabsTrigger>
                <TabsTrigger value="lens" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Lens
                </TabsTrigger>
                <TabsTrigger value="zora" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Zora
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Search Results Header - Only show when searched */}
        {hasSearched && (
          <div className="mb-6">
            <div className="text-center mb-6">
              <p className="text-blue-300 mb-4">
                Search results for: <span className="text-white font-mono">{originalSearchTerm}</span>
              </p>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {activeFilter === "tokens" ? (
          <TokenExplorer />
        ) : activeFilter === "profiler" ? (
          hasSearched && userProfiles.length > 0 ? (
            <WalletProfiler 
              profiles={userProfiles}
              searchedAddress={searchedAddress}
              originalSearchTerm={originalSearchTerm}
              onShare={() => shareProfile(searchedAddress, originalSearchTerm)}
            />
          ) : (
            <div className="max-w-2xl mx-auto">
              <Card className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-purple-800/60 backdrop-blur-md shadow-xl">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Wallet Profiler</h3>
                  <p className="text-gray-300 mb-6">
                    Enter an Ethereum address or ENS name above to analyze wallet behavior, transaction history, and Base blockchain activity.
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="w-4 h-4" />
                      <span>Transaction Analysis</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Coins className="w-4 h-4" />
                      <span>Token Holdings</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4" />
                      <span>Base Activity</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        ) : (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            {isLoading ? (
              Array(3).fill(0).map((_, index) => <CardSkeleton key={index} />)
            ) : hasSearched && filteredProfiles.length > 0 ? (
              <>
                {filteredProfiles.map((profile) => (
                  <div key={`${profile.type}:${profile.name || (profile.metadata as { address?: string })?.address || searchedAddress}`} className="group">
                    {profile.type === "ens" && (isBasenameName(profile.name) ? <BaseCard profile={profile} /> : <ENSCard profile={profile} />)}
                    {profile.type === "farcaster" && <FarcasterCard profile={profile} />}
                    {profile.type === "lens" && <LensCard profile={profile} />}
                  </div>
                ))}
                {includeZoraCard && (
                  <div className="group">
                    <ZoraCard profile={{
                      type: "zora",
                      address: searchedAddress,
                      name: "Zora Collector",
                      metadata: { address: searchedAddress, name: "Zora Collector" }
                    } as unknown as SocialProfile} />
                  </div>
                )}
              </>
            ) : hasSearched ? (
              <Card className="col-span-full bg-blue-900/40 border-blue-800/60 backdrop-blur-md shadow-xl">
                <CardContent className="p-12 text-center">
                  <div className="text-blue-300 text-lg">
                    No profiles found for this address
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Show tool descriptions when no search has been performed */}
                {activeFilter === "all" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border-blue-800/60 backdrop-blur-md shadow-xl">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Coins className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Token Explorer</h3>
                        <p className="text-gray-300 text-sm">
                          Explore Base ecosystem tokens with real-time market data and analytics
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-purple-800/60 backdrop-blur-md shadow-xl">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Wallet Profiler</h3>
                        <p className="text-gray-300 text-sm">
                          Analyze wallet behavior, transactions, and Base blockchain activity
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
                {(activeFilter === "ens" || activeFilter === "farcaster" || activeFilter === "lens" || activeFilter === "base" || activeFilter === "zora") && (
                  <Card className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-blue-800/60 backdrop-blur-md shadow-xl">
                    <CardContent className="p-12 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Social Profile Search</h3>
                      <p className="text-gray-300 mb-6">
                        Enter an Ethereum address or ENS name above to discover social profiles across {activeFilter} platform.
                      </p>
                      <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>Identity Discovery</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Camera className="w-4 h-4" />
                          <span>Social Profiles</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

