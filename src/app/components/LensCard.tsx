/**
 * Lens Card Component
 * 
 * Sleek and modern social profile card for Lens Protocol users.
 * Features gradient backgrounds, hover animations, and professional styling.
 * 
 * @author Sniffer Web3 Team
 * @version 2.0.0 - Sleek Design
 */

import { MediaRenderer } from "thirdweb/react";
import { SocialProfile } from "thirdweb/social";
import { Users, Zap, Globe } from "lucide-react";
import { client } from "../client";

interface LensCardProps {
  profile: SocialProfile;
}

export function LensCard({ profile }: LensCardProps) {
  const lensMetadata = profile.metadata as { 
    handle?: string;
    follower_count?: number;
    following_count?: number;
    post_count?: number;
  };

  const handleViewHey = () => {
    window.open(`https://hey.xyz/u/${profile.name || lensMetadata.handle}`, '_blank', 'noopener,noreferrer');
  };

  const handleViewOrb = () => {
    window.open(`https://orb.club/@${profile.name || lensMetadata.handle}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative group w-full h-full bg-gradient-to-br from-green-900/90 via-emerald-900/80 to-teal-900/90 backdrop-blur-xl rounded-3xl border border-green-500/30 shadow-2xl shadow-green-500/20 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:shadow-green-500/40 hover:scale-[1.02] hover:border-green-400/60">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-emerald-600/5 to-teal-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10 p-6 flex flex-col justify-between h-full">
        {/* Header with Platform Badge */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 rounded-2xl shadow-lg">
                <span className="text-white font-bold text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Lens Protocol
                </span>
              </div>
            </div>
            <div className="text-green-300/60 text-xs font-medium">
              @{lensMetadata.handle || 'unknown'}
            </div>
          </div>

          {/* Profile Section */}
          <div className="flex items-start gap-4 mb-6">
            {/* Avatar with enhanced styling */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-green-600 to-emerald-600 p-1 shadow-xl group-hover:shadow-green-500/50 transition-all duration-300">
                {profile.avatar ? (
                  <MediaRenderer
                    client={client}
                    src={profile.avatar}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black text-white mb-1 bg-gradient-to-r from-white via-green-100 to-emerald-100 bg-clip-text text-transparent leading-tight">
                {profile.name || lensMetadata.handle || 'Unnamed Lens'}
              </h2>
              {lensMetadata.handle && profile.name !== lensMetadata.handle && (
                <p className="text-green-300/80 text-sm font-medium mb-2">
                  @{lensMetadata.handle}
                </p>
              )}
              {profile.bio && (
                <p className="text-gray-300/90 text-sm leading-relaxed line-clamp-2">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="relative bg-gradient-to-br from-green-800/70 to-emerald-700/50 rounded-xl p-3 backdrop-blur-sm border border-green-600/30 hover:border-green-500/50 transition-all duration-300">
              <div className="text-green-300/80 text-[10px] font-medium mb-1 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                Followers
              </div>
              <div className="text-white font-bold text-sm">
                {lensMetadata.follower_count ? 
                  (lensMetadata.follower_count > 1000 ? 
                    `${(lensMetadata.follower_count / 1000).toFixed(1)}K` : 
                    lensMetadata.follower_count
                  ) : '—'
                }
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-green-800/70 to-emerald-700/50 rounded-xl p-3 backdrop-blur-sm border border-green-600/30 hover:border-green-500/50 transition-all duration-300">
              <div className="text-green-300/80 text-[10px] font-medium mb-1 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                Following
              </div>
              <div className="text-white font-bold text-sm">
                {lensMetadata.following_count ? 
                  (lensMetadata.following_count > 1000 ? 
                    `${(lensMetadata.following_count / 1000).toFixed(1)}K` : 
                    lensMetadata.following_count
                  ) : '—'
                }
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-green-800/70 to-emerald-700/50 rounded-xl p-3 backdrop-blur-sm border border-green-600/30 hover:border-green-500/50 transition-all duration-300">
              <div className="text-green-300/80 text-[10px] font-medium mb-1 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
                Posts
              </div>
              <div className="text-white font-bold text-sm">
                {lensMetadata.post_count ? 
                  (lensMetadata.post_count > 1000 ? 
                    `${(lensMetadata.post_count / 1000).toFixed(1)}K` : 
                    lensMetadata.post_count
                  ) : '—'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleViewHey}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 group/btn shadow-lg hover:shadow-xl hover:shadow-green-500/25 text-sm hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <Globe className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
            Hey.xyz
          </button>
          <button
            onClick={handleViewOrb}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 group/btn shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 text-sm hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
            Orb.club
          </button>
        </div>
      </div>
    </div>
  );
}