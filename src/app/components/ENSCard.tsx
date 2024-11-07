import { MediaRenderer } from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import { SocialProfile } from "thirdweb/social";
import { client } from "../client";

interface ENSCardProps {
  profile: SocialProfile;
}

export function ENSCard({ profile }: ENSCardProps) {
  const ensMetadata = profile.metadata as { address?: string };

  return (
    <div className="w-full h-full bg-zinc-800 rounded-xl shadow-lg p-6">
      <div className="flex flex-col justify-between h-full">
        <div>
          <p className="inline-block px-2 py-1 text-sm text-white bg-blue-600 rounded-lg w-fit">ENS</p>
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
              <h2 className="text-xl font-bold text-neutral-200">{profile.name || 'Unnamed ENS'}</h2>
              <p className="mt-2 px-2 py-1 text-xs text-gray-400 border border-gray-600 rounded-lg inline-flex items-center">
                {shortenAddress(ensMetadata.address as string)}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 w-full">
          <a 
            href={`https://app.ens.domains/${profile.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-2 flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-blue-500/20"
          >
            View on ENS
          </a>
        </div>
      </div>
    </div>
  );
}