"use client";
import { useEffect, useState } from "react";
import { getSocialProfiles,SocialProfile } from "thirdweb/social";
import { client } from "./client";
import { shortenAddress } from "thirdweb/utils";
import { ENSCard } from "./components/ENSCard";
import { FarcasterCard } from "./components/FarcasterCard";
import { LensCard } from "./components/LensCard";
import { CardSkeleton } from "./components/CardSkeleton";


//import { SocialProfile } from "thirdweb/react";//+

type FilterType = "all" | "ens" | "farcaster" | "lens";

const isValidEthereumAddress = (address: string) => { //check if address is a valid evm address for search
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export default function Home() {

  const [searchInput, setSearchInput] = useState("");
  const [searchedAddress, setSearchedAddress] = useState("");
  const [userProfiles, setUserProfiles] = useState<SocialProfile[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(false);

  useEffect(() => { setIsValidAddress(isValidEthereumAddress(searchInput)); },
    [searchInput]
  );

  const handleSearch = async () => {
    if (!isValidAddress) return
    setIsLoading(true);
    setSearchedAddress(searchInput);
    try {
      const profiles = await getSocialProfiles({
        client: client,
        address: searchInput,
      });
      setUserProfiles(profiles);
     
      setHasSearched(true);

    } catch (error) { console.error(error) }
    finally {
      setIsLoading(false);
      setSearchInput("");
    }
  }

  const filteredProfiles = userProfiles.filter(profile =>
    activeFilter == "all" || profile.type === activeFilter);

  return (
       <main className="min-h-screen bg-zinc-950 flex flex-col items-center p-6">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold mb-10 text-neutral-200 tracking-tight">Sniffer Web3</h1>
        
        <div className="flex flex-row items-center justify-center space-x-3 mb-4">
          <input
            type="text"
            placeholder="Enter wallet address"
            className={`bg-zinc-800/90 text-neutral-200 border border-zinc-700/50 rounded-lg px-5 py-2.5 w-full max-w-sm transition-colors duration-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${!isValidAddress && searchInput ? 'border-red-500/50 focus:ring-red-500/50' : 'hover:border-zinc-600'}`}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={isLoading}
          />
          <button 
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/20" 
            onClick={handleSearch}
            disabled={isLoading || !isValidAddress}
          >
            {isLoading ? "searching..." : "search"}
          </button>
        </div>
        {searchInput && !isValidAddress && (
          <p className="text-red-500 text-xs text-left mt-1 font-medium">Kindly enter a valid ethereum address</p>
        )}
        {hasSearched && (<>
          <p className="text-sm text-gray-400 mb-4 font-medium tracking-wide"> search results for: {shortenAddress(searchedAddress)} </p>
          <div className="flex space-x-2 bg-zinc-800/90 p-1.5 rounded-lg shadow-lg">
            {["all", "ens", "farcaster", "lens"].map((filter) => (<button key={filter}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeFilter === filter ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-gray-400 hover:bg-zinc-700/80 hover:text-white"}`}
              onClick={() => setActiveFilter(filter as FilterType)}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
              ))}
          </div>
        </>)}
      </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 w-full max-w-7xl mx-auto">
        {isLoading ? (
          Array(3).fill(0).map((_, index) => <CardSkeleton key={index} />)
        ) : hasSearched && filteredProfiles.length > 0 ? (
          filteredProfiles.map((profile, index) => (
            <div key={index} className="w-full h-full transform hover:scale-[1.02] transition-transform duration-200">
              {profile.type === "ens" && <ENSCard profile={profile} />}
              {profile.type === "farcaster" && <FarcasterCard profile={profile} />}
              {profile.type === "lens" && <LensCard profile={profile} />}
            </div>
          ))
        ) : hasSearched ? (
          <p className="text-center text-gray-500 col-span-full text-lg font-medium">Profile not found for this address</p>
        ) : null}
      </div>
      </main> 
  );
}
