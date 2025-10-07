import { MediaRenderer } from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import { SocialProfile } from "thirdweb/social";
import { client } from "../client";
import { useEffect, useState } from "react";

interface BaseCardProps {
  profile: SocialProfile;
}

interface BaseNameData {
  name?: string;
  avatar?: string;
  description?: string;
  isVerified?: boolean;
}

export function BaseCard({ profile }: BaseCardProps) {
  const baseMetadata = profile.metadata as { address?: string };
  const [baseNameData, setBaseNameData] = useState<BaseNameData>({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Base name data for the address
  useEffect(() => {
    const fetchBaseNameData = async () => {
      if (!baseMetadata.address) return;
      
      setIsLoading(true);
      try {
        // Try to fetch Base name data using reverse lookup
        const response = await fetch(`https://api.basescan.org/api?module=account&action=txlist&address=${baseMetadata.address}&startblock=0&endblock=99999999&page=1&offset=1&sort=desc&apikey=4BX3N5QR9QQREKWAKT5IJQTWF5R8SM8ZV9`);
        const data = await response.json();
        
        if (data.status === '1' && data.result && data.result.length > 0) {
          // Check if this address has any Base name activity
          const hasBaseActivity = data.result.some((tx: { to?: string; input?: string }) => 
            (tx.to && tx.to.toLowerCase().includes('base')) || 
            (tx.input && tx.input.includes('base'))
          );
          
          if (hasBaseActivity) {
            setBaseNameData({
              name: profile.name || `Base User ${shortenAddress(baseMetadata.address)}`,
              isVerified: true
            });
          }
        }
      } catch (error) {
        console.log('Could not fetch Base name data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBaseNameData();
  }, [baseMetadata.address, profile.name]);

  return (
    <div className="w-full h-full bg-zinc-800 rounded-xl shadow-lg p-6">
      <div className="flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <p className="inline-block px-2 py-1 text-sm text-white bg-sky-600 rounded-lg w-fit">Base</p>
            {baseNameData.isVerified && (
              <span className="px-2 py-1 text-xs text-green-300 bg-green-600/20 border border-green-600/30 rounded-lg">
                ✓ Verified
              </span>
            )}
            {isLoading && (
              <span className="px-2 py-1 text-xs text-blue-300 bg-blue-600/20 border border-blue-600/30 rounded-lg">
                Loading...
              </span>
            )}
          </div>
          <div className="flex flex-row mt-2">
            <div className="mr-4 w-24 h-24 flex-shrink-0">
              {profile.avatar ? (
                <MediaRenderer
                  client={client}
                  src={profile.avatar}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-sky-400 to-cyan-500"></div>
                </div>
              )}
            </div>
            <div className="flex flex-col h-fit">
              <h2 className="text-xl font-bold text-neutral-200">
                {baseNameData.name || profile.name || 'Base User'}
              </h2>
              <p className="mt-2 px-2 py-1 text-xs text-gray-400 border border-gray-600 rounded-lg inline-flex items-center">
                {shortenAddress(baseMetadata.address as string)}
              </p>
              {baseNameData.description && (
                <p className="mt-2 text-sm text-gray-300">{baseNameData.description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 w-full space-y-2">
          <a 
            href={baseMetadata.address 
              ? `https://names.base.org/address/${encodeURIComponent(baseMetadata.address)}`
              : `https://names.base.org/`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-2 flex items-center justify-center text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-sky-500/20"
          >
            View on Base Names
          </a>
          <a 
            href={baseMetadata.address 
              ? `https://basescan.org/address/${baseMetadata.address}`
              : `https://basescan.org/`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-2 flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-blue-500/20"
          >
            View on Basescan
          </a>
        </div>
      </div>
    </div>
  );
}
