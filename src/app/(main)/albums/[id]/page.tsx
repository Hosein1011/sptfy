"use client";

import React from "react";
import { Play, Heart, MoreHorizontal, Clock, Shuffle } from "lucide-react";
import Button from "../../../../../components/common/Button";

// Next.js passes the dynamic URL parameter (e.g., /albums/1) via the params prop
export default function AlbumDetailPage({ params }: { params: { id: string } }) {
  // --- UI STATE (Person 3 will fetch real data based on params.id later) ---
  const mockAlbum = {
    id: params.id,
    title: "Midnight City",
    artist: "M83",
    year: "2011",
    totalDuration: "45 min 12 sec",
    cover: "bg-gradient-01",
    ambientGlow: "bg-melora-purple/30",
  };

  const mockTracks = [
    { id: 1, title: "Intro", plays: "1.2M", duration: "1:22" },
    { id: 2, title: "Midnight City", plays: "45.8M", duration: "4:03" },
    { id: 3, title: "Reunion", plays: "12.4M", duration: "3:55" },
    { id: 4, title: "Where the Boats Go", plays: "8.1M", duration: "1:46" },
    { id: 5, title: "Wait", plays: "32.6M", duration: "5:43" },
  ];

  return (
    <main className="flex-1 w-full pb-32 relative">
      
      {/* Cinematic Ambient Background Glow */}
      <div className={`absolute top-0 left-0 w-full h-[500px] ${mockAlbum.ambientGlow} blur-[120px] pointer-events-none -z-10 opacity-60`} />

      {/* Header Section */}
      <section className="p-6 md:p-10 pt-12 md:pt-20 flex flex-col md:flex-row items-end gap-8 mb-8">
        
        {/* Album Art */}
        <div className={`w-48 h-48 md:w-64 md:h-64 rounded-card ${mockAlbum.cover} shadow-glow flex-shrink-0 relative group`} />

        {/* Album Meta */}
        <div className="flex-1">
          <p className="text-melora-textSecondary uppercase tracking-widest text-xs font-bold mb-2">Album</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            {mockAlbum.title}
          </h1>
          <div className="flex items-center gap-2 text-sm md:text-base mb-6">
            <div className="w-6 h-6 rounded-full bg-melora-surfaceLayer flex items-center justify-center text-white font-bold text-xs">
              {mockAlbum.artist.charAt(0)}
            </div>
            <span className="text-white font-bold hover:underline cursor-pointer">{mockAlbum.artist}</span>
            <span className="text-melora-textMuted">•</span>
            <span className="text-melora-textSecondary">{mockAlbum.year}</span>
            <span className="text-melora-textMuted">•</span>
            <span className="text-melora-textSecondary">{mockTracks.length} songs, {mockAlbum.totalDuration}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button className="w-14 h-14 rounded-full bg-gradient-01 shadow-glow flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-base">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </button>
            <button className="w-12 h-12 rounded-full bg-melora-surfaceLayer/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-melora-surfaceLayer hover:text-melora-purple transition-all duration-base">
              <Shuffle className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-full bg-melora-surfaceLayer/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-melora-surfaceLayer hover:text-melora-pink transition-all duration-base">
              <Heart className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center text-melora-textSecondary hover:text-white transition-all duration-base ml-auto md:ml-0">
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Tracklist Section */}
      <section className="px-6 md:px-10">
        <div className="bg-melora-surfaceLayer/30 border border-white/5 rounded-panel p-4 md:p-6 backdrop-blur-md">
          
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 pb-3 border-b border-white/5 text-xs font-bold text-melora-textMuted uppercase tracking-wider">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-7 md:col-span-6">Title</div>
            <div className="col-span-3 hidden md:block">Plays</div>
            <div className="col-span-3 md:col-span-2 text-right flex justify-end">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          {/* Tracks */}
          <div className="mt-2 flex flex-col">
            {mockTracks.map((track, index) => (
              <div 
                key={track.id} 
                className="grid grid-cols-12 gap-4 px-4 py-3 items-center rounded-xl hover:bg-white/5 transition-colors duration-base group cursor-pointer"
              >
                {/* Track Number / Play Hover */}
                <div className="col-span-1 text-center relative flex items-center justify-center">
                  <span className="text-melora-textSecondary font-medium group-hover:opacity-0 transition-opacity duration-base">
                    {index + 1}
                  </span>
                  <Play className="w-4 h-4 text-white fill-white absolute opacity-0 group-hover:opacity-100 transition-opacity duration-base" />
                </div>
                
                {/* Title */}
                <div className="col-span-7 md:col-span-6 flex flex-col pr-4">
                  <span className="text-white font-semibold group-hover:text-melora-purple transition-colors duration-base truncate">
                    {track.title}
                  </span>
                  <span className="text-xs text-melora-textSecondary truncate">{mockAlbum.artist}</span>
                </div>
                
                {/* Plays */}
                <div className="col-span-3 hidden md:block text-melora-textSecondary text-sm">
                  {track.plays}
                </div>
                
                {/* Duration & Quick Actions */}
                <div className="col-span-3 md:col-span-2 flex items-center justify-end gap-4 text-melora-textSecondary text-sm">
                  <button className="opacity-0 group-hover:opacity-100 hover:text-melora-pink transition-all duration-base">
                    <Heart className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-right">{track.duration}</span>
                  <button className="opacity-0 group-hover:opacity-100 hover:text-white transition-all duration-base hidden sm:block">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </section>
      
    </main>
  );
}