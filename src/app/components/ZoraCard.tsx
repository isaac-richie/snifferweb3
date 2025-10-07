/**
 * Zora Card Component
 * 
 * Sleek and modern NFT marketplace card for Zora users.
 * Features gradient backgrounds, hover animations, and professional styling.
 * 
 * @author Sniffer Web3 Team
 * @version 2.0.0 - Sleek Design
 */

import { shortenAddress } from "thirdweb/utils";
import { SocialProfile } from "thirdweb/social";
import { ExternalLink, Image, Palette, Zap, Users, RefreshCw, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import React from "react";

interface ZoraCardProps {
  profile: SocialProfile;
}

// Function to fetch fresh Zora data
const fetchZoraData = async (address: string) => {
  try {
    console.log(`🔍 Attempting to fetch Zora data for: ${address}`);
    
    // Try multiple Zora API endpoints for follower data
    const endpoints = [
      {
        url: `https://zora.co/api/users/${address}`,
        name: 'Zora Users API',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SnifferWeb3/1.0',
        }
      },
      {
        url: `https://api.zora.co/v1/users/${address}`,
        name: 'Zora API v1',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SnifferWeb3/1.0',
        }
      },
      {
        url: `https://api.zora.co/v2/users/${address}`,
        name: 'Zora API v2',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SnifferWeb3/1.0',
        }
      }
    ];
    
    for (const { url, name, headers } of endpoints) {
      try {
        console.log(`🔄 Trying ${name}: ${url}`);
        
        const response = await fetch(url, {
          headers: headers,
        });
        
        console.log(`📡 ${name} response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`📊 ${name} response data:`, data);
          
          // Handle different response formats
          let user = null;
          if (data.user) {
            user = data.user;
          } else if (data.result?.user) {
            user = data.result.user;
          } else if (data.data?.user) {
            user = data.data.user;
          } else if (data) {
            user = data; // Direct user object
          }
          
          if (user) {
            const result = {
              address: user.address || address,
              name: user.name || user.username || user.displayName,
              avatarUrl: user.avatarUrl || user.avatar || user.pfp,
              follower_count: user.follower_count || user.followerCount || user.followers || 0,
              following_count: user.following_count || user.followingCount || user.following || 0,
              nft_count: user.nft_count || user.nftCount || user.nfts?.length || 0,
              collection_count: user.collection_count || user.collectionCount || user.collections?.length || 0,
              profile_views: user.profile_views || user.profileViews || user.views || 0,
            };
            
            console.log(`✅ ${name} success:`, result);
            return result;
          }
        } else {
          console.log(`❌ ${name} failed with status ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${name} error:`, error);
        continue;
      }
    }
    
    console.log('⚠️ All Zora API endpoints failed');
    return null;
  } catch (error) {
    console.error('Error fetching Zora data:', error);
    return null;
  }
};

export function ZoraCard({ profile }: ZoraCardProps) {
  const [freshZoraData, setFreshZoraData] = useState<{
    address?: string;
    name?: string;
    avatarUrl?: string;
    follower_count?: number;
    following_count?: number;
    nft_count?: number;
    collection_count?: number;
    profile_views?: number;
  } | null>(null);
  const [isLoadingFreshData, setIsLoadingFreshData] = useState(false);

  const zoraMetadata = profile.metadata as { 
    address?: string; 
    name?: string; 
    avatarUrl?: string;
    nft_count?: number;
    collection_count?: number;
    follower_count?: number;
    following_count?: number;
    profile_views?: number;
    // Alternative field names
    followers?: number;
    followerCount?: number;
    following?: number;
    followingCount?: number;
  };

  // Use fresh data if available, otherwise fall back to metadata with alternative field names
  const displayData = freshZoraData || {
    ...zoraMetadata,
    follower_count: zoraMetadata.follower_count || zoraMetadata.followers || zoraMetadata.followerCount,
    following_count: zoraMetadata.following_count || zoraMetadata.following || zoraMetadata.followingCount,
  };

  const [copied, setCopied] = useState(false);

  // Debug logging to see what data we're getting
  console.log('🔍 ZoraCard data:', {
    profileName: profile.name,
    profileType: profile.type,
    metadata: zoraMetadata,
    freshData: freshZoraData,
    displayData: displayData,
    fullProfile: profile
  });

  // Enhanced debugging for metadata structure
  console.log('🔍 Zora metadata keys:', Object.keys(zoraMetadata || {}));
  console.log('🔍 Zora metadata values:', zoraMetadata);
  
  // Check what Thirdweb is actually providing
  console.log('🔍 Thirdweb profile analysis:', {
    hasMetadata: !!zoraMetadata,
    metadataKeys: Object.keys(zoraMetadata || {}),
    hasAddress: !!zoraMetadata.address,
    hasFollowerData: !!(zoraMetadata.follower_count || zoraMetadata.followers || zoraMetadata.followerCount),
    hasFollowingData: !!(zoraMetadata.following_count || zoraMetadata.following || zoraMetadata.followingCount),
    hasNftData: !!zoraMetadata.nft_count,
    hasCollectionData: !!zoraMetadata.collection_count,
  });

  // Fetch fresh Zora data on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Check if we already have follower data in any form
      const hasFollowerData = zoraMetadata.follower_count || 
                             zoraMetadata.followers || 
                             zoraMetadata.followerCount;
      
      if (!zoraMetadata.address || hasFollowerData) {
        // Skip if we already have follower data or no address
        console.log('⏭️ Skipping fresh data fetch - already have data or no address');
        return;
      }

      setIsLoadingFreshData(true);
      try {
        console.log(`🔄 Fetching fresh Zora data for ${zoraMetadata.address}`);
        const freshData = await fetchZoraData(zoraMetadata.address);
        if (freshData) {
          setFreshZoraData(freshData);
          console.log(`✅ Fresh Zora data fetched:`, freshData);
        } else {
          console.log(`⚠️ No fresh Zora data available for ${zoraMetadata.address}`);
        }
      } catch (error) {
        console.error('Error fetching fresh Zora data:', error);
        // Show a toast or notification about API issues
        console.log('⚠️ Zora APIs appear to be down (503 errors). Using cached/metadata data only.');
      } finally {
        setIsLoadingFreshData(false);
      }
    };

    fetchData();
  }, [zoraMetadata.address, zoraMetadata.follower_count, zoraMetadata.followerCount, zoraMetadata.followers]);
  
  // Safe URL construction with fallback
  const zoraUrl = typeof zoraMetadata.address === 'string' 
    ? `https://zora.co/${zoraMetadata.address}` 
    : 'https://zora.co';

  // Safe address validation
  const hasValidAddress = typeof zoraMetadata.address === 'string' && zoraMetadata.address.length > 0;

  const handleViewProfile = () => {
    if (hasValidAddress) {
      window.open(zoraUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyAddress = async () => {
    if (hasValidAddress) {
      try {
        await navigator.clipboard.writeText(zoraMetadata.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  const handleRefreshData = async () => {
    if (!zoraMetadata.address) return;
    
    setIsLoadingFreshData(true);
    try {
      console.log(`🔄 Manual refresh for ${zoraMetadata.address}`);
      const freshData = await fetchZoraData(zoraMetadata.address);
      if (freshData) {
        setFreshZoraData(freshData);
        console.log(`✅ Manual refresh successful:`, freshData);
      } else {
        console.log(`⚠️ Manual refresh failed for ${zoraMetadata.address}`);
      }
    } catch (error) {
      console.error('Error during manual refresh:', error);
    } finally {
      setIsLoadingFreshData(false);
    }
  };

  return (
    <div className="relative group w-full h-full bg-gradient-to-br from-rose-900/90 via-pink-900/80 to-rose-800/90 backdrop-blur-xl rounded-3xl border border-rose-500/30 shadow-2xl shadow-rose-500/20 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:shadow-rose-500/40 hover:scale-[1.02] hover:border-rose-400/60">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-600/10 via-pink-600/5 to-rose-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10 p-6 flex flex-col justify-between h-full">
        {/* Header with Platform Badge */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2 rounded-2xl shadow-lg">
                <span className="text-white font-bold text-sm flex items-center gap-2">
                  <Palette className="w-3 h-3" />
                  Zora
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-xs font-medium px-2 py-1 rounded-lg ${
                hasValidAddress 
                  ? 'text-green-300 bg-green-900/30 border border-green-600/30' 
                  : 'text-gray-300 bg-gray-900/30 border border-gray-600/30'
              }`}>
                {hasValidAddress ? 'Active' : 'No Profile'}
              </div>
              {hasValidAddress && (
                <button
                  onClick={handleRefreshData}
                  disabled={isLoadingFreshData}
                  className="p-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 hover:text-white transition-all duration-200 disabled:opacity-50"
                  title="Refresh data (APIs may be down)"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingFreshData ? 'animate-spin' : ''}`} />
                </button>
              )}
              {/* API Status Indicator */}
              {hasValidAddress && !displayData.follower_count && (
                <div className="text-xs px-2 py-1 rounded-lg bg-yellow-900/30 border border-yellow-600/30 text-yellow-300">
                  APIs Down
                </div>
              )}
            </div>
          </div>

          {/* Profile Section */}
          <div className="flex items-start gap-4 mb-6">
            {/* Avatar with enhanced styling */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-rose-600 to-pink-600 p-1 shadow-xl group-hover:shadow-rose-500/50 transition-all duration-300">
                {zoraMetadata.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={zoraMetadata.avatarUrl}
                    alt={displayData.name || zoraMetadata.name || 'Zora Profile'}
                    className="w-full h-full rounded-xl object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center">
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <Image className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/30 to-pink-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black text-white mb-1 bg-gradient-to-r from-white via-rose-100 to-pink-100 bg-clip-text text-transparent leading-tight">
                {displayData.name || zoraMetadata.name || 'Zora Collector'}
              </h2>
              <div className="flex items-center gap-2 mb-2">
                <div className="relative bg-gradient-to-br from-rose-800/70 to-pink-700/50 rounded-lg p-2 backdrop-blur-sm border border-rose-600/30 hover:border-rose-500/50 transition-all duration-300 flex items-center gap-2">
                  <span className="text-rose-300/80 text-xs font-medium">
                    {hasValidAddress ? 
                      shortenAddress(zoraMetadata.address) : 
                      'No Profile Found'
                    }
                  </span>
                  {hasValidAddress && (
                    <button
                      onClick={handleCopyAddress}
                      className="text-rose-300/60 hover:text-rose-300 transition-colors duration-200"
                    >
                      {copied ? (
                        <Zap className="w-3 h-3" />
                      ) : (
                        <Zap className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              {hasValidAddress && (
                <p className="text-rose-300/80 text-xs font-medium">
                  NFT Collector & Creator
                </p>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Followers */}
            <div className="relative bg-gradient-to-br from-rose-800/70 to-pink-700/50 rounded-xl p-4 backdrop-blur-sm border border-rose-600/30 hover:border-rose-500/50 transition-all duration-300 group/stat">
              <div className="text-rose-300/80 text-[10px] font-medium mb-2 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Followers
              </div>
              <div className="text-white font-black text-lg">
                {displayData.follower_count ? 
                  (displayData.follower_count > 1000 ? 
                    `${(displayData.follower_count / 1000).toFixed(1)}K` : 
                    displayData.follower_count.toLocaleString()
                  ) : (
                    isLoadingFreshData ? (
                      <span className="text-rose-300/60 text-sm">Loading...</span>
                    ) : (
                      '—'
                    )
                  )
                }
              </div>
              {displayData.follower_count && displayData.follower_count > 1000 && (
                <div className="text-rose-300/60 text-xs mt-1">
                  {displayData.follower_count.toLocaleString()} total
                </div>
              )}
              {displayData.follower_count && (
                <div className="text-rose-300/40 text-[10px] mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>API data may be inaccurate</span>
                </div>
              )}
              {!displayData.follower_count && !isLoadingFreshData && hasValidAddress && (
                <div className="text-yellow-300/60 text-[10px] mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>Zora APIs currently down</span>
                </div>
              )}
            </div>
            
            {/* Following */}
            <div className="relative bg-gradient-to-br from-rose-800/70 to-pink-700/50 rounded-xl p-4 backdrop-blur-sm border border-rose-600/30 hover:border-rose-500/50 transition-all duration-300 group/stat">
              <div className="text-rose-300/80 text-[10px] font-medium mb-2 flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                Following
              </div>
              <div className="text-white font-black text-lg">
                {displayData.following_count ? 
                  (displayData.following_count > 1000 ? 
                    `${(displayData.following_count / 1000).toFixed(1)}K` : 
                    displayData.following_count.toLocaleString()
                  ) : (
                    isLoadingFreshData ? (
                      <span className="text-rose-300/60 text-sm">Loading...</span>
                    ) : (
                      '—'
                    )
                  )
                }
              </div>
              {displayData.following_count && displayData.following_count > 1000 && (
                <div className="text-rose-300/60 text-xs mt-1">
                  {displayData.following_count.toLocaleString()} total
                </div>
              )}
              {displayData.following_count && (
                <div className="text-rose-300/40 text-[10px] mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>API data may be inaccurate</span>
                </div>
              )}
              {!displayData.following_count && !isLoadingFreshData && hasValidAddress && (
                <div className="text-yellow-300/60 text-[10px] mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>Zora APIs currently down</span>
                </div>
              )}
            </div>
          </div>

          {/* NFT Stats Row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* NFTs */}
            <div className="relative bg-gradient-to-br from-rose-800/70 to-pink-700/50 rounded-xl p-4 backdrop-blur-sm border border-rose-600/30 hover:border-rose-500/50 transition-all duration-300 group/stat">
              <div className="text-rose-300/80 text-[10px] font-medium mb-2 flex items-center gap-1">
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image className="w-3 h-3" />
                NFTs
              </div>
              <div className="text-white font-black text-lg">
                {displayData.nft_count || zoraMetadata.nft_count ? 
                  ((displayData.nft_count || zoraMetadata.nft_count) > 1000 ? 
                    `${((displayData.nft_count || zoraMetadata.nft_count) / 1000).toFixed(1)}K` : 
                    (displayData.nft_count || zoraMetadata.nft_count).toLocaleString()
                  ) : '—'
                }
              </div>
              {(displayData.nft_count || zoraMetadata.nft_count) && (displayData.nft_count || zoraMetadata.nft_count) > 1000 && (
                <div className="text-rose-300/60 text-xs mt-1">
                  {(displayData.nft_count || zoraMetadata.nft_count).toLocaleString()} total
                </div>
              )}
            </div>
            
            {/* Collections */}
            <div className="relative bg-gradient-to-br from-rose-800/70 to-pink-700/50 rounded-xl p-4 backdrop-blur-sm border border-rose-600/30 hover:border-rose-500/50 transition-all duration-300 group/stat">
              <div className="text-rose-300/80 text-[10px] font-medium mb-2 flex items-center gap-1">
                <Palette className="w-3 h-3" />
                Collections
              </div>
              <div className="text-white font-black text-lg">
                {displayData.collection_count || zoraMetadata.collection_count ? 
                  ((displayData.collection_count || zoraMetadata.collection_count) > 1000 ? 
                    `${((displayData.collection_count || zoraMetadata.collection_count) / 1000).toFixed(1)}K` : 
                    (displayData.collection_count || zoraMetadata.collection_count).toLocaleString()
                  ) : '—'
                }
              </div>
              {(displayData.collection_count || zoraMetadata.collection_count) && (displayData.collection_count || zoraMetadata.collection_count) > 1000 && (
                <div className="text-rose-300/60 text-xs mt-1">
                  {(displayData.collection_count || zoraMetadata.collection_count).toLocaleString()} total
                </div>
              )}
            </div>
          </div>

          {/* Profile Views Row */}
          {(displayData.profile_views || zoraMetadata.profile_views) && (
            <div className="grid grid-cols-1 gap-3 mb-4">
              <div className="relative bg-gradient-to-br from-rose-800/70 to-pink-700/50 rounded-xl p-4 backdrop-blur-sm border border-rose-600/30 hover:border-rose-500/50 transition-all duration-300 group/stat">
                <div className="text-rose-300/80 text-[10px] font-medium mb-2 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Profile Views
                </div>
                <div className="text-white font-black text-lg">
                  {(displayData.profile_views || zoraMetadata.profile_views) > 1000 ? 
                    `${((displayData.profile_views || zoraMetadata.profile_views) / 1000).toFixed(1)}K` : 
                    (displayData.profile_views || zoraMetadata.profile_views).toLocaleString()
                  }
                </div>
                {(displayData.profile_views || zoraMetadata.profile_views) > 1000 && (
                  <div className="text-rose-300/60 text-xs mt-1">
                    {(displayData.profile_views || zoraMetadata.profile_views).toLocaleString()} total
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Social Activity Section */}
        {(displayData.follower_count || displayData.following_count) && (
          <div className="mb-4">
            <div className="bg-gradient-to-r from-rose-800/30 to-pink-700/30 rounded-xl p-4 border border-rose-600/20">
              <div className="flex items-center justify-between mb-2">
                <div className="text-rose-300/80 text-xs font-medium flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Social Metrics
                </div>
                <div className="text-white font-semibold text-sm">
                  {displayData.follower_count && displayData.following_count ? 
                    `Ratio: ${(displayData.follower_count / displayData.following_count).toFixed(1)}x` :
                    'Active Profile'
                  }
                </div>
              </div>
              
              {/* API Status Note */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 mb-2">
                <div className="text-yellow-300/80 text-xs flex items-center gap-1">
                  <span>⚠️</span>
                  <span>
                    {displayData.follower_count || displayData.following_count 
                      ? 'API data may differ from official counts' 
                      : 'Zora APIs currently unavailable'}
                  </span>
                </div>
                <div className="text-yellow-200/60 text-[10px] mt-1">
                  {displayData.follower_count || displayData.following_count 
                    ? 'Check official profile for accurate numbers'
                    : 'Using cached data or check Zora directly'}
                </div>
              </div>
              
              {/* Engagement Score */}
              {displayData.follower_count && displayData.following_count && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Engagement Score</span>
                  <span className={`font-semibold ${
                    displayData.follower_count / displayData.following_count > 2 ? 'text-green-400' :
                    displayData.follower_count / displayData.following_count > 1 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {displayData.follower_count / displayData.following_count > 2 ? 'High' :
                     displayData.follower_count / displayData.following_count > 1 ? 'Medium' :
                     'Low'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleViewProfile}
            disabled={!hasValidAddress}
            className={`flex-1 font-semibold py-3 rounded-xl transition-all duration-300 group/btn shadow-lg hover:shadow-xl text-sm hover:scale-[1.02] flex items-center justify-center gap-2 ${
              hasValidAddress 
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white hover:shadow-rose-500/25' 
                : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 cursor-not-allowed opacity-60'
            }`}
          >
            <ExternalLink className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
            {hasValidAddress ? 'View on Zora' : 'Coming soon fren'}
          </button>
          {hasValidAddress && (
            <button
              onClick={() => window.open(`https://zora.co/${zoraMetadata.address}`, '_blank', 'noopener,noreferrer')}
              className="flex-1 bg-gradient-to-r from-rose-500/80 to-pink-500/80 hover:from-rose-600/90 hover:to-pink-600/90 text-white font-semibold py-3 rounded-xl transition-all duration-300 group/btn shadow-lg hover:shadow-xl hover:shadow-rose-500/25 text-sm hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
              Official Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}