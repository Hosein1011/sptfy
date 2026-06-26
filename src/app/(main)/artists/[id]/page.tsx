"use client";

import React, { useState } from "react";
import { Play, UserPlus, UserCheck, MoreHorizontal, BadgeCheck, Heart, Clock } from "lucide-react";
import Button from "../../../../../components/common/Button";

export default function ArtistProfilePage({ params }: { params: { id: string } }) {
  // --- UI STATE (Person 3 will wire this to the real database later) ---
  const [isFollowing, setIsFollowing] = useState(false);

  const mockArtist = {
    id: params.id,
    name: "The Weeknd",
    listeners: "108,452,192",
    bio: "Grammy-winning artist blending R&B, pop, and cinematic synthwave.",
    verified: true,
    avatar: "bg-gradient-04",
    ambientGlow: "bg-melora-pink/20",
  };

  const topTracks = [
    { id: 1, title: "Blinding Lights", album: "After Hours", plays: "3.8B", duration: "3:20", cover: "bg-gradient-04" },
    { id: 2, title: "Starboy", album: "Starboy", plays: "2.9B", duration: "3:50", cover: "bg-gradient-02" },
    { id: 3, title: "Save Your Tears", album: "After Hours", plays: "2.1B", duration: "3:35", cover: "bg-gradient-04" },
    { id: 4, title: "Die For You", album: "Starboy", plays: "1.8B", duration: "4:20", cover: "bg-gradient-02" },
    { id: 5, title: "I Was Never There", album: "My Dear Melancholy", plays: "950M", duration: "4:01", cover: "bg-gradient-01" },
  ];

  const artistAlbums = [
    { id: 1, title: "Dawn FM", year: "2022", type: "Album", cover: "bg-gradient-03" },
    { id: 2, title: "After Hours", year: "2020", type: "Album", cover: "bg-gradient-04" },
    { id: 3, title: "My Dear Melancholy", year: "2018", type: "EP", cover: "bg-gradient-01" },
    { id: 4, title: "Starboy", year: "2016", type: "Album", cover: "bg-gradient-02" },
  ];

  return (
    <main className="flex-1 w-full pb-32 relative">
      
      {/* Cinematic Ambient Background Glow */}
      <div className={`absolute top-0 left-0 w-full h-[600px] ${mockArtist.ambientGlow} blur-[150px] pointer-events-none -z-10 opacity-70`} />

      {/* Hero Section */}
      <section className="p-6 md:p-10 pt-16 md:pt-24 flex flex-col md:flex-row items-center md:items-end gap-8 mb-10 text-center md:text-left">
        
        {/* Large Avatar */}
        <div className={`w-48 h-48 md:w-64 md:h-64 rounded-full ${mockArtist.avatar} shadow-glow flex-shrink-0 border-4 border-melora-bgPrimary/50`} />

        {/* Artist Meta */}
        <div className="flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            {mockArtist.verified && <BadgeCheck className="w-6 h-6 text-melora-purple" />}
            <p className="text-melora-textSecondary uppercase tracking-widest text-xs font-bold">Verified Artist</p>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            {mockArtist.name}
          </h1>
          
          <p className="text-lg text-melora-textPrimary font-medium mb-6">
            {mockArtist.listeners} <span className="text-melora-textSecondary text-sm">Monthly Listeners</span>
          </p>

          {/* Actions */}
          <div className="flex items-center justify-center md:justify-start gap-4">
            <button className="w-14 h-14 rounded-full bg-gradient-01 shadow-glow flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-base">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </button>
            
            <Button 
              variant={isFollowing ? "secondary" : "primary"} 
              onClick={() => setIsFollowing(!isFollowing)}
              className="flex items-center gap-2 px-6"
            >
              {isFollowing ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {isFollowing ? "Following" : "Follow"}
            </Button>
            
            <button className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center text-melora-textSecondary hover:text-white transition-all duration-base">
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 px-6 md:px-10">
        
        {/* Left Column: Popular Tracks */}
        <section className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-6">Popular</h2>
          <div className="flex flex-col">
            {topTracks.map((track, index) => (
              <div 
                key={track.id} 
                className="grid grid-cols-12 gap-4 px-4 py-3 items-center rounded-xl hover:bg-white/5 transition-colors duration-base group cursor-pointer"
              >
                {/* Index / Play Button */}
                <div className="col-span-1 text-center relative flex items-center justify-center">
                  <span className="text-melora-textSecondary font-medium group-hover:opacity-0 transition-opacity duration-base">
                    {index + 1}
                  </span>
                  <Play className="w-4 h-4 text-white fill-white absolute opacity-0 group-hover:opacity-100 transition-opacity duration-base" />
                </div>
                
                {/* Track Info with Mini Cover */}
                <div className="col-span-7 md:col-span-6 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-md ${track.cover} shadow-soft flex-shrink-0`} />
                  <div className="flex flex-col pr-4 overflow-hidden">
                    <span className="text-white font-semibold group-hover:text-melora-purple transition-colors duration-base truncate">
                      {track.title}
                    </span>
                  </div>
                </div>
                
                {/* Plays */}
                <div className="col-span-3 hidden md:block text-melora-textSecondary text-sm">
                  {track.plays}
                </div>
                
                {/* Duration */}
                <div className="col-span-3 md:col-span-2 flex items-center justify-end gap-4 text-melora-textSecondary text-sm">
                  <button className="opacity-0 group-hover:opacity-100 hover:text-melora-pink transition-all duration-base">
                    <Heart className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-right">{track.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Artist Bio / Info */}
        <section className="lg:col-span-1">
          <h2 className="text-2xl font-bold text-white mb-6">About</h2>
          <div className="bg-melora-surfaceLayer/30 border border-white/5 rounded-panel p-6 backdrop-blur-md hover:bg-melora-surfaceLayer/50 transition-colors duration-base cursor-pointer">
            <p className="text-melora-textPrimary leading-relaxed mb-4">
              {mockArtist.bio}
            </p>
            <div className="text-sm font-bold text-melora-pink hover:text-melora-purple transition-colors duration-base">
              Read more
            </div>
          </div>
        </section>
      </div>

      {/* Discography Section */}
      <section className="px-6 md:px-10 mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Discography</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {artistAlbums.map((album) => (
            <div key={album.id} className="group cursor-pointer flex flex-col gap-3">
              <div className={`w-full aspect-square rounded-card ${album.cover} shadow-soft relative overflow-hidden transition-transform duration-slow group-hover:-translate-y-2`}>
                <div className="absolute inset-0 bg-melora-bgPrimary/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-base flex items-center justify-center">
                  <button className="w-14 h-14 rounded-full bg-melora-purple/90 shadow-glow flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-base">
                    <Play className="w-6 h-6 text-white fill-white ml-1" />
                  </button>
                </div>
              </div>
              <div className="px-1">
                <h3 className="text-white font-bold text-base truncate group-hover:text-melora-purple transition-colors duration-base">
                  {album.title}
                </h3>
                <p className="text-melora-textSecondary text-sm mt-1">
                  {album.year} • {album.type}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}