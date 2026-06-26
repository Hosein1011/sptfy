"use client";

import React, { useState } from "react";
import { Play, Heart, Share2, ListPlus, Mic2, MoreHorizontal } from "lucide-react";
import Button from "../../../../../components/common/Button";

export default function SongDetailPage({ params }: { params: { id: string } }) {
  // --- UI STATE (Person 3 will wire this to the playerStore and current time) ---
  const [activeLyricIndex, setActiveLyricIndex] = useState(3); // Mocking the 4th line as "currently playing"

  const mockSong = {
    id: params.id,
    title: "Nightcall",
    artist: "Kavinsky",
    album: "OutRun",
    year: "2013",
    plays: "412.5M",
    duration: "4:19",
    cover: "bg-gradient-03",
    ambientGlow: "bg-melora-orange/20",
  };

  const mockLyrics = [
    "I'm giving you a night call to tell you how I feel",
    "I want to drive you through the night, down the hills",
    "I'm gonna tell you something you don't want to hear",
    "I'm gonna show you where it's dark, but have no fear", // Active line
    "There's something inside you",
    "It's hard to explain",
    "They're talking about you, boy",
    "But you're still the same",
    "(Instrumental Synth Solo)",
    "I'm giving you a night call to tell you how I feel",
    "I want to drive you through the night, down the hills",
  ];

  return (
    <main className="flex-1 w-full pb-32 relative min-h-[calc(100vh-100px)] flex flex-col">
      
      {/* Cinematic Ambient Background Glow */}
      <div className={`absolute top-0 right-0 w-full md:w-3/4 h-full ${mockSong.ambientGlow} blur-[150px] pointer-events-none -z-10 opacity-50`} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 md:p-10 flex-1">
        
        {/* Left Column: Song Art & Controls */}
        <section className="flex flex-col items-center lg:items-start justify-center lg:sticky lg:top-10 h-fit">
          
          {/* Huge Album Art */}
          <div className={`w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-card ${mockSong.cover} shadow-glow mb-8 group relative overflow-hidden flex-shrink-0`}>
            {/* Hover Play State */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-base flex items-center justify-center cursor-pointer">
              <button className="w-20 h-20 rounded-full bg-melora-purple/90 shadow-glow flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-base">
                <Play className="w-10 h-10 text-white fill-white ml-2" />
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="text-center lg:text-left w-full max-w-md">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight truncate">
              {mockSong.title}
            </h1>
            <p className="text-xl text-melora-textPrimary font-medium mb-1 hover:text-melora-purple transition-colors cursor-pointer inline-block">
              {mockSong.artist}
            </p>
            <p className="text-melora-textSecondary text-sm mb-8">
              {mockSong.album} • {mockSong.year} • {mockSong.plays} plays
            </p>

            {/* Quick Actions */}
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <Button variant="secondary" className="px-4 group">
                <Heart className="w-5 h-5 group-hover:text-melora-pink transition-colors" />
              </Button>
              <Button variant="secondary" className="px-4">
                <ListPlus className="w-5 h-5" />
              </Button>
              <Button variant="secondary" className="px-4">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="secondary" className="px-4 ml-auto lg:ml-0">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Right Column: Immersive Lyrics Experience */}
        <section className="bg-melora-surfaceLayer/30 border border-white/5 rounded-panel p-8 backdrop-blur-md flex flex-col h-[600px] lg:h-auto overflow-hidden relative">
          
          <div className="flex items-center gap-2 mb-8">
            <Mic2 className="w-6 h-6 text-melora-purple" />
            <h2 className="text-xl font-bold text-white">Lyrics</h2>
          </div>

          {/* Scrollable Lyrics Container */}
          <div className="flex-1 overflow-y-auto hide-scrollbar space-y-6 relative mask-image-linear-y">
            
            {mockLyrics.map((line, index) => {
              const isActive = index === activeLyricIndex;
              const isPast = index < activeLyricIndex;
              
              return (
                <p 
                  key={index} 
                  onClick={() => setActiveLyricIndex(index)} // For Person 1 testing purposes
                  className={`
                    text-2xl md:text-3xl font-bold transition-all duration-500 cursor-pointer origin-left
                    ${isActive 
                      ? "text-white scale-105 shadow-white" 
                      : isPast 
                        ? "text-white/30 hover:text-white/50" 
                        : "text-white/50 hover:text-white/70"}
                  `}
                >
                  {line}
                </p>
              );
            })}

          </div>

          {/* Bottom Fade Mask (CSS trick for smooth scroll fade) */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-melora-bgPrimary/80 to-transparent pointer-events-none rounded-b-panel" />
        </section>

      </div>
    </main>
  );
}