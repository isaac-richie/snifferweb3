/**
 * Farcaster Card Component
 * 
 * Sleek and modern social profile card for Farcaster users.
 * Features gradient backgrounds, hover animations, and professional styling.
 * 
 * @author Sniffer Web3 Team
 * @version 2.0.0 - Sleek Design
 */

import React from "react";
import { MediaRenderer } from "thirdweb/react";
import { SocialProfile } from "thirdweb/social";
import { ExternalLink, Users, MessageCircle, Heart, RefreshCw } from "lucide-react";
import { client } from "../client";

interface FarcasterCardProps {
  profile: SocialProfile;
}

// Function to fetch fresh Farcaster data
const fetchFarcasterData = async (username: string) => {
  try {
    console.log(`🔍 Attempting to fetch Farcaster data for: ${username}`);
    
    // Try multiple Farcaster API endpoints for follower data
    const endpoints = [
      {
        url: `https://api.neynar.com/v2/farcaster/user/bulk?usernames=${username}`,
        name: 'Neynar API v2 (Bulk)',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SnifferWeb3/1.0',
          'api_key': 'NEYNAR_API_KEY', // This would need to be configured
        }
      },
      {
        url: `https://api.neynar.com/v1/farcaster/user?username=${username}`,
        name: 'Neynar API v1',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SnifferWeb3/1.0',
          'api_key': 'NEYNAR_API_KEY', // This would need to be configured
        }
      },
      {
        url: `https://api.warpcast.com/v2/user-by-username?username=${username}`,
        name: 'Warpcast API v2',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SnifferWeb3/1.0',
          'Origin': 'https://warpcast.com',
        }
      },
      {
        url: `https://api.farcaster.xyz/v2/user-by-username?username=${username}`,
        name: 'Farcaster API v2',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SnifferWeb3/1.0',
          'Origin': 'https://warpcast.com',
        }
      },
      {
        url: `https://api.warpcast.com/v1/user-by-username?username=${username}`,
        name: 'Warpcast API v1',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SnifferWeb3/1.0',
          'Origin': 'https://warpcast.com',
        }
      },
      {
        url: `https://api.farcaster.xyz/v1/user-by-username?username=${username}`,
        name: 'Farcaster API v1',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SnifferWeb3/1.0',
          'Origin': 'https://warpcast.com',
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
          if (data.result?.user) {
            user = data.result.user;
          } else if (data.user) {
            user = data.user;
          } else if (data.data?.user) {
            user = data.data.user;
          } else if (data.users && Array.isArray(data.users) && data.users.length > 0) {
            // Neynar bulk API format
            user = data.users[0];
          } else if (data.result && Array.isArray(data.result) && data.result.length > 0) {
            // Neynar alternative format
            user = data.result[0];
          }
          
          if (user) {
            const result = {
              fid: user.fid?.toString() || user.id?.toString(),
              display_name: user.display_name || user.displayName,
              follower_count: user.follower_count || user.followerCount || user.followers_count || user.followers?.length || 0,
              following_count: user.following_count || user.followingCount || user.following?.length || 0,
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
    
    console.log('⚠️ All Farcaster API endpoints failed');
    return null;
  } catch (error) {
    console.error('Error fetching Farcaster data:', error);
    return null;
  }
};

export function FarcasterCard({ profile }: FarcasterCardProps) {
  const [freshFarcasterData, setFreshFarcasterData] = React.useState<{
    fid?: string;
    display_name?: string;
    follower_count?: number;
    following_count?: number;
  } | null>(null);
  const [isLoadingFreshData, setIsLoadingFreshData] = React.useState(false);

  const farcasterMetadata = profile.metadata as { 
    fid?: string; 
    display_name?: string;
    follower_count?: number;
    following_count?: number;
    // Alternative field names
    followers?: number;
    followerCount?: number;
    following?: number;
    followingCount?: number;
  };

  // Use fresh data if available, otherwise fall back to metadata with alternative field names
  const displayData = freshFarcasterData || {
    ...farcasterMetadata,
    follower_count: farcasterMetadata.follower_count || farcasterMetadata.followers || farcasterMetadata.followerCount,
    following_count: farcasterMetadata.following_count || farcasterMetadata.following || farcasterMetadata.followingCount,
  };

  // Debug logging to see what data we're getting
  console.log('🔍 FarcasterCard data:', {
    profileName: profile.name,
    metadata: farcasterMetadata,
    freshData: freshFarcasterData,
    displayData: displayData,
    fullProfile: profile
  });
  
  // Enhanced debugging for metadata structure
  console.log('🔍 Farcaster metadata keys:', Object.keys(farcasterMetadata || {}));
  console.log('🔍 Farcaster metadata values:', farcasterMetadata);
  
  // Check for alternative field names
  const alternativeFields = {
    followers: farcasterMetadata.followers,
    follower_count: farcasterMetadata.follower_count,
    followerCount: farcasterMetadata.followerCount,
    following: farcasterMetadata.following,
    following_count: farcasterMetadata.following_count,
    followingCount: farcasterMetadata.followingCount,
  };
  console.log('🔍 Alternative field names:', alternativeFields);

  // Fetch fresh Farcaster data on component mount
  React.useEffect(() => {
    const fetchData = async () => {
      // Check if we already have follower data in any form
      const hasFollowerData = farcasterMetadata.follower_count || 
                             farcasterMetadata.followers || 
                             farcasterMetadata.followerCount;
      
      if (!profile.name || hasFollowerData) {
        // Skip if we already have follower data or no username
        console.log('⏭️ Skipping fresh data fetch - already have data or no username');
        return;
      }

      setIsLoadingFreshData(true);
      try {
        console.log(`🔄 Fetching fresh Farcaster data for ${profile.name}`);
        const freshData = await fetchFarcasterData(profile.name);
        if (freshData) {
          setFreshFarcasterData(freshData);
          console.log(`✅ Fresh Farcaster data fetched:`, freshData);
        } else {
          console.log(`⚠️ No fresh Farcaster data available for ${profile.name}`);
        }
      } catch (error) {
        console.error('Error fetching fresh Farcaster data:', error);
      } finally {
        setIsLoadingFreshData(false);
      }
    };

    fetchData();
  }, [profile.name, farcasterMetadata.follower_count, farcasterMetadata.followerCount, farcasterMetadata.followers]);

  // Show toast if follower data is available
  React.useEffect(() => {
    if (displayData.follower_count && displayData.follower_count > 0) {
      console.log(`✅ Farcaster follower data available for ${profile.name}: ${displayData.follower_count} followers`);
    } else {
      console.log(`⚠️ No follower data available for ${profile.name}`);
    }
  }, [displayData.follower_count, profile.name]);

  const handleViewProfile = () => {
    window.open(`https://warpcast.com/${profile.name}`, '_blank', 'noopener,noreferrer');
  };

  const handleRefreshData = async () => {
    if (!profile.name) return;
    
    setIsLoadingFreshData(true);
    try {
      console.log(`🔄 Manual refresh for ${profile.name}`);
      const freshData = await fetchFarcasterData(profile.name);
      if (freshData) {
        setFreshFarcasterData(freshData);
        console.log(`✅ Manual refresh successful:`, freshData);
      } else {
        console.log(`⚠️ Manual refresh failed for ${profile.name}`);
      }
    } catch (error) {
      console.error('Error during manual refresh:', error);
    } finally {
      setIsLoadingFreshData(false);
    }
  };

  return (
    <div className="relative group w-full h-full bg-gradient-to-br from-purple-900/90 via-violet-900/80 to-purple-800/90 backdrop-blur-xl rounded-3xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:shadow-purple-500/40 hover:scale-[1.02] hover:border-purple-400/60">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-violet-600/5 to-purple-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10 p-6 flex flex-col justify-between h-full">
        {/* Header with Platform Badge */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-2 rounded-2xl shadow-lg">
                <span className="text-white font-bold text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Farcaster
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-purple-300/60 text-xs font-medium">
                #{displayData.fid || 'Unknown'}
              </div>
              <button
                onClick={handleRefreshData}
                disabled={isLoadingFreshData}
                className="p-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white transition-all duration-200 disabled:opacity-50"
                title="Refresh follower data"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingFreshData ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Profile Section */}
          <div className="flex items-start gap-4 mb-6">
            {/* Avatar with enhanced styling */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 to-violet-600 p-1 shadow-xl group-hover:shadow-purple-500/50 transition-all duration-300">
                {profile.avatar ? (
                  <MediaRenderer
                    client={client}
                    src={profile.avatar}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-violet-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-black text-white bg-gradient-to-r from-white via-purple-100 to-violet-100 bg-clip-text text-transparent leading-tight">
                  {profile.name || displayData.display_name || 'Unnamed Farcaster'}
                </h2>
                {displayData.follower_count && (
                  <div className="bg-gradient-to-r from-purple-600/80 to-violet-600/80 px-2 py-1 rounded-lg text-white text-xs font-semibold flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {displayData.follower_count > 1000 ? 
                      `${(displayData.follower_count / 1000).toFixed(1)}K` : 
                      displayData.follower_count.toLocaleString()
                    }
                  </div>
                )}
                {isLoadingFreshData && (
                  <div className="bg-gradient-to-r from-purple-600/40 to-violet-600/40 px-2 py-1 rounded-lg text-white text-xs font-semibold flex items-center gap-1">
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                    Loading...
                  </div>
                )}
              </div>
              {displayData.display_name && profile.name !== displayData.display_name && (
                <p className="text-purple-300/80 text-sm font-medium mb-2">
                  {displayData.display_name}
                </p>
              )}
              {profile.bio && (
                <p className="text-gray-300/90 text-sm leading-relaxed line-clamp-2">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Stats Section - Enhanced Follower Display */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Followers - Primary Stat */}
            <div className="relative bg-gradient-to-br from-purple-800/70 to-violet-700/50 rounded-xl p-4 backdrop-blur-sm border border-purple-600/30 hover:border-purple-500/50 transition-all duration-300 group/stat">
              <div className="text-purple-300/80 text-[10px] font-medium mb-2 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Followers
              </div>
              <div className="text-white font-black text-xl">
                {displayData.follower_count ? 
                  (displayData.follower_count > 1000 ? 
                    `${(displayData.follower_count / 1000).toFixed(1)}K` : 
                    displayData.follower_count.toLocaleString()
                  ) : (
                    isLoadingFreshData ? (
                      <span className="text-purple-300/60 text-sm">Loading...</span>
                    ) : (
                      <span className="text-purple-300/60 text-sm">No data</span>
                    )
                  )
                }
              </div>
              {displayData.follower_count && displayData.follower_count > 1000 && (
                <div className="text-purple-300/60 text-xs mt-1">
                  {displayData.follower_count.toLocaleString()} total
                </div>
              )}
              {!displayData.follower_count && !isLoadingFreshData && (
                <div className="text-purple-300/50 text-xs mt-1">
                  Follower data unavailable
                </div>
              )}
              {displayData.follower_count && (
                <div className="text-purple-300/40 text-[10px] mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>API data may be inaccurate</span>
                </div>
              )}
            </div>
            
            {/* Following - Secondary Stat */}
            <div className="relative bg-gradient-to-br from-purple-800/70 to-violet-700/50 rounded-xl p-4 backdrop-blur-sm border border-purple-600/30 hover:border-purple-500/50 transition-all duration-300 group/stat">
              <div className="text-purple-300/80 text-[10px] font-medium mb-2 flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                Following
              </div>
              <div className="text-white font-black text-xl">
                {displayData.following_count ? 
                  (displayData.following_count > 1000 ? 
                    `${(displayData.following_count / 1000).toFixed(1)}K` : 
                    displayData.following_count.toLocaleString()
                  ) : (
                    isLoadingFreshData ? (
                      <span className="text-purple-300/60 text-sm">Loading...</span>
                    ) : (
                      <span className="text-purple-300/60 text-sm">No data</span>
                    )
                  )
                }
              </div>
              {displayData.following_count && displayData.following_count > 1000 && (
                <div className="text-purple-300/60 text-xs mt-1">
                  {displayData.following_count.toLocaleString()} total
                </div>
              )}
              {!displayData.following_count && !isLoadingFreshData && (
                <div className="text-purple-300/50 text-xs mt-1">
                  Following data unavailable
                </div>
              )}
              {displayData.following_count && (
                <div className="text-purple-300/40 text-[10px] mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>API data may be inaccurate</span>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Social Activity Section */}
          {(displayData.follower_count || displayData.following_count) && (
            <div className="mb-4">
              <div className="bg-gradient-to-r from-purple-800/30 to-violet-700/30 rounded-xl p-4 border border-purple-600/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-purple-300/80 text-xs font-medium flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    Social Metrics
                  </div>
                  <div className="text-white font-semibold text-sm">
                    {displayData.follower_count && displayData.following_count ? 
                      `Ratio: ${(displayData.follower_count / displayData.following_count).toFixed(1)}x` :
                      'Active Profile'
                    }
                  </div>
                </div>
                
                {/* API Accuracy Note */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 mb-2">
                  <div className="text-yellow-300/80 text-xs flex items-center gap-1">
                    <span>⚠️</span>
                    <span>API data may differ from official counts</span>
                  </div>
                  <div className="text-yellow-200/60 text-[10px] mt-1">
                    Check official profile for accurate numbers
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
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleViewProfile}
            className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 group/btn shadow-lg hover:shadow-xl hover:shadow-purple-500/25 text-sm hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
            View on Warpcast
          </button>
          <button
            onClick={() => window.open(`https://farcaster.xyz/${profile.name}`, '_blank', 'noopener,noreferrer')}
            className="flex-1 bg-gradient-to-r from-purple-500/80 to-violet-500/80 hover:from-purple-600/90 hover:to-violet-600/90 text-white font-semibold py-3 rounded-xl transition-all duration-300 group/btn shadow-lg hover:shadow-xl hover:shadow-purple-500/25 text-sm hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
            Official Profile
          </button>
        </div>
      </div>
    </div>
  );
}