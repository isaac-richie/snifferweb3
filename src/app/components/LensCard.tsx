import { MediaRenderer } from "thirdweb/react";
import { SocialProfile } from "thirdweb/social";
import { client } from "../client";

interface LensCardProps {
  profile: SocialProfile;
}

export function LensCard({ profile }: LensCardProps) {
  const lensMetadata = profile.metadata as { handle?: string };

  return (
    <div className="w-full h-full bg-zinc-800 rounded-xl shadow-lg p-6">
      <div className="flex flex-col justify-between h-full">
        <div>
          <p className="inline-block px-2 py-1 text-sm text-white bg-green-600 rounded-lg w-fit">Lens</p>
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
              <h2 className="text-xl font-bold text-neutral-200">{profile.name || lensMetadata.handle || 'Unnamed Lens'}</h2>
              {profile.bio && <p className="mt-2 text-sm text-gray-300">{profile.bio}</p>}
            </div>
          </div>
        </div>
        <div className="mt-4 w-full flex gap-2">
          <a 
            href={`https://hey.xyz/u/${profile.name || lensMetadata.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 flex items-center justify-center text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-green-500/20"
          >
            View on Hey
          </a>
          <a 
            href={`https://orb.club/@${profile.name || lensMetadata.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 flex items-center justify-center text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-green-500/20"
          >
            View on Orb
          </a>
        </div>
      </div>
    </div>
  );
}