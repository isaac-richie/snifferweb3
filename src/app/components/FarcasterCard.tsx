import { MediaRenderer } from "thirdweb/react";
import { SocialProfile } from "thirdweb/social";
import { client } from "../client";

interface FarcasterCardProps {
  profile: SocialProfile;
}

export function FarcasterCard({ profile }: FarcasterCardProps) {
  const farcasterMetadata = profile.metadata as { fid?: string; display_name?: string };

  return (
    <div className="w-full h-full bg-zinc-800 rounded-xl shadow-lg p-6">
      <div className="flex flex-col justify-between h-full">
        <div>
          <p className="inline-block px-2 py-1 text-sm text-white bg-purple-600 rounded-lg w-fit">Farcaster</p>
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
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                </div>
              )}
            </div>
            <div className="flex flex-col h-fit">
              <h2 className="text-xl font-bold text-neutral-200">{profile.name || 'Unnamed Farcaster'}</h2>
              <div className="flex items-center space-x-2 mt-2">
                <span className="px-2 py-1 text-xs text-gray-400 border border-gray-600 rounded-lg">{farcasterMetadata.fid}</span>
                <p className="text-sm text-gray-400">{farcasterMetadata.display_name}</p>
              </div>
              {profile.bio && <p className="mt-2 text-sm text-gray-300">{profile.bio}</p>}
            </div>
          </div>
        </div>
        <div className="mt-4 w-full">
          <a 
            href={`https://warpcast.com/${profile.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-2 flex items-center justify-center text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-purple-500/20"
          >
            View on Warpcast
          </a>
        </div>
      </div>
    </div>
  );
}