/**
 * ENS Card Component
 * 
 * Sleek and modern domain name service card for ENS users.
 * Features gradient backgrounds, hover animations, and professional styling.
 * 
 * @author Sniffer Web3 Team
 * @version 2.0.0 - Sleek Design
 */

import { shortenAddress } from "thirdweb/utils";
import { SocialProfile } from "thirdweb/social";
import { ExternalLink, Globe, Shield, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

interface ENSCardProps {
  profile: SocialProfile;
}

export function ENSCard({ profile }: ENSCardProps) {
  const ensMetadata = profile.metadata as { 
    address?: string;
    resolver?: string;
    expiry_date?: string;
  };

  const [copied, setCopied] = useState(false);

  const handleViewProfile = () => {
    window.open(`https://app.ens.domains/${profile.name}`, '_blank', 'noopener,noreferrer');
  };

  const handleCopyAddress = async () => {
    if (ensMetadata.address) {
      try {
        await navigator.clipboard.writeText(ensMetadata.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  const formatExpiryDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Invalid date';
    }
  };

  const isExpired = (dateString?: string) => {
    if (!dateString) return false;
    try {
      return new Date(dateString) < new Date();
    } catch {
      return false;
    }
  };

  return (
    <div className="relative group w-full h-full bg-gradient-to-br from-blue-900/90 via-cyan-900/80 to-blue-800/90 backdrop-blur-xl rounded-3xl border border-blue-500/30 shadow-2xl shadow-blue-500/20 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:shadow-blue-500/40 hover:scale-[1.02] hover:border-blue-400/60">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-600/5 to-blue-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10 p-6 flex flex-col justify-between h-full">
        {/* Header with Platform Badge */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 rounded-2xl shadow-lg">
                <span className="text-white font-bold text-sm flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  ENS Domain
                </span>
              </div>
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded-lg ${
              isExpired(ensMetadata.expiry_date) 
                ? 'text-red-300 bg-red-900/30 border border-red-600/30' 
                : 'text-green-300 bg-green-900/30 border border-green-600/30'
            }`}>
              {isExpired(ensMetadata.expiry_date) ? 'Expired' : 'Active'}
            </div>
          </div>

          {/* Domain Section */}
          <div className="flex items-start gap-4 mb-6">
            {/* Domain Icon with enhanced styling */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-600 p-1 shadow-xl group-hover:shadow-blue-500/50 transition-all duration-300">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Globe className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Domain Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black text-white mb-1 bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent leading-tight">
                {profile.name || 'Unnamed ENS'}
              </h2>
              <div className="flex items-center gap-2 mb-2">
                <div className="relative bg-gradient-to-br from-blue-800/70 to-cyan-700/50 rounded-lg p-2 backdrop-blur-sm border border-blue-600/30 hover:border-blue-500/50 transition-all duration-300 flex items-center gap-2">
                  <span className="text-blue-300/80 text-xs font-medium">
                    {shortenAddress(ensMetadata.address as string)}
                  </span>
                  <button
                    onClick={handleCopyAddress}
                    className="text-blue-300/60 hover:text-blue-300 transition-colors duration-200"
                  >
                    {copied ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
              {ensMetadata.expiry_date && (
                <p className="text-blue-300/80 text-xs font-medium">
                  Expires: {formatExpiryDate(ensMetadata.expiry_date)}
                </p>
              )}
            </div>
          </div>

          {/* Domain Details */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="relative bg-gradient-to-br from-blue-800/70 to-cyan-700/50 rounded-xl p-3 backdrop-blur-sm border border-blue-600/30 hover:border-blue-500/50 transition-all duration-300">
              <div className="text-blue-300/80 text-[10px] font-medium mb-1 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Resolver
              </div>
              <div className="text-white font-bold text-sm truncate">
                {ensMetadata.resolver ? 
                  shortenAddress(ensMetadata.resolver) : 
                  'Default'
                }
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-blue-800/70 to-cyan-700/50 rounded-xl p-3 backdrop-blur-sm border border-blue-600/30 hover:border-blue-500/50 transition-all duration-300">
              <div className="text-blue-300/80 text-[10px] font-medium mb-1 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                Status
              </div>
              <div className="text-white font-bold text-sm flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {isExpired(ensMetadata.expiry_date) ? 'Expired' : 'Active'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleViewProfile}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 group/btn shadow-lg hover:shadow-xl hover:shadow-blue-500/25 text-sm hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
          View on ENS
        </button>
      </div>
    </div>
  );
}