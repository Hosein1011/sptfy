"use client";

import React, { useState } from "react";
import { X, GripVertical, Play, Mic2, ListMusic, Music } from "lucide-react";

interface PlayerSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "queue" | "lyrics";
}

export default function PlayerSidePanel({ 
  isOpen, 
  onClose, 
  defaultTab = "queue" 
}: PlayerSidePanelProps) {
  const [activeTab, setActiveTab] = useState<"queue" | "lyrics">(defaultTab);
  const [activeLyricIndex, setActiveLyricIndex] = useState(3);

  // --- MOCK DATA ---
  const nowPlaying = { title: "Midnight City", artist: "M83", cover: "bg-gradient-01" };
  const nextUp = [
    { id: 1, title: "Starboy", artist: "The Weeknd", cover: "bg-gradient-02" },
    { id: 2, title: "Nightcall", artist: "Kavinsky", cover: "bg-gradient-03" },
    { id: 3, title: "Blinding Lights", artist: "The Weeknd", cover: "bg-gradient-04" },
    { id: 4, title: "Discovery", artist: "Daft Punk", cover: "bg-gradient-01" },
  ];

  const mockLyrics = [
    "I'm giving you a night call to tell you how I feel",
    "I want to drive you through the night, down the hills",
    "I'm gonna tell you something you don't want to hear",
    "I'm gonna show you where it's dark, but have no fear",
    "There's something inside you",
    "It's hard to explain",
  ];

  return (
    <>
      {/* Backdrop for mobile only (to click away) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sliding Glass Drawer */}
      <div 
        className={`
          fixed top-0 right-0 h-[calc(100vh-90px)] md:h-[calc(100vh-100px)] w-full sm:w-96 
          bg-melora-surfaceLayer/90 backdrop-blur-[30px] border-l border-white/10 z-50 
          flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.3)]
          transition-transform duration-500 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        
        {/* Header & Tabs */}
        <div className="p-6 pb-4 border-b border-white/5 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Currently Playing</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-melora-textSecondary hover:text-white transition-colors duration-base"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Glass Pill Tabs */}
          <div className="bg-melora-bgPrimary/50 p-1 rounded-lg border border-white/5 flex">
            <button 
              onClick={() => setActiveTab("queue")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all duration-base ${activeTab === "queue" ? "bg-white/10 text-white shadow-soft" : "text-melora-textMuted hover:text-white"}`}
            >
              <ListMusic className="w-4 h-4" /> Queue
            </button>
            <button 
              onClick={() => setActiveTab("lyrics")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all duration-base ${activeTab === "lyrics" ? "bg-white/10 text-white shadow-soft" : "text-melora-textMuted hover:text-white"}`}
            >
              <Mic2 className="w-4 h-4" /> Lyrics
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          
          {/* QUEUE TAB */}
          {activeTab === "queue" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              
              {/* Now Playing Section */}
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-melora-purple mb-3">Now Playing</p>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-melora-purple/10 border border-melora-purple/20">
                  <div className={`w-12 h-12 rounded-md ${nowPlaying.cover} shadow-glow flex-shrink-0 relative flex items-center justify-center`}>
                    <Music className="w-5 h-5 text-white/50" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{nowPlaying.title}</h4>
                    <p className="text-sm text-melora-textSecondary">{nowPlaying.artist}</p>
                  </div>
                </div>
              </div>

              {/* Next In Queue Section */}
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-melora-textMuted mb-3">Next In Queue</p>
                <div className="flex flex-col gap-1">
                  {nextUp.map((track) => (
                    <div 
                      key={track.id} 
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors duration-base group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-md ${track.cover} shadow-soft flex-shrink-0 relative flex items-center justify-center`}>
                          <Play className="w-4 h-4 text-white fill-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-semibold text-sm group-hover:text-melora-purple transition-colors">{track.title}</span>
                          <span className="text-xs text-melora-textSecondary">{track.artist}</span>
                        </div>
                      </div>
                      
                      <button className="text-melora-textMuted hover:text-white cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all p-1">
                        <GripVertical className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* LYRICS TAB */}
          {activeTab === "lyrics" && (
            <div className="flex flex-col h-full animate-in fade-in duration-300 relative">
              <div className="space-y-6 pb-20 mask-image-linear-y">
                {mockLyrics.map((line, index) => {
                  const isActive = index === activeLyricIndex;
                  const isPast = index < activeLyricIndex;
                  
                  return (
                    <p 
                      key={index}
                      onClick={() => setActiveLyricIndex(index)}
                      className={`
                        text-xl font-bold transition-all duration-500 cursor-pointer origin-left
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
            </div>
          )}

        </div>
      </div>
    </>
  );
}