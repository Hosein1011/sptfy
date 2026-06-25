"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, 
  Shuffle, Repeat, Volume2, Heart, 
  Mic2, ListMusic, Maximize2 
} from "lucide-react";

export default function MusicPlayer() {
  // --- STATE (Person 3 will replace these with playerStore later) ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35); // Percentage 0-100
  const [volume, setVolume] = useState(80); // Percentage 0-100
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");

  // Simulated current song
  const currentSong = {
    title: "Midnight City",
    artist: "M83",
    cover: "bg-gradient-01", // Placeholder for actual image
    duration: "4:03",
    currentTime: "1:25",
  };

  // --- INTERNAL METHODS (Prepared for Person 3's audio logic) ---
  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleNext = () => console.log("Next song");
  const handlePrevious = () => console.log("Previous song");
  const handleShuffleToggle = () => setIsShuffle(!isShuffle);
  const handleRepeatToggle = () => {
    const modes: ("off" | "all" | "one")[] = ["off", "all", "one"];
    setRepeatMode(modes[(modes.indexOf(repeatMode) + 1) % modes.length]);
  };
  
  const handleProgressUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(Number(e.target.value));
    // playerStore.seekTo(...) will go here
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
    // playerStore.setVolume(...) will go here
  };

  // Sync effect placeholder
  useEffect(() => {
    // Logic to sync isPlaying and currentSong with actual <audio> tag
  }, [isPlaying]);

  return (
    <div className="fixed bottom-0 left-0 w-full h-[90px] md:h-[100px] bg-melora-surfaceLayer/80 backdrop-blur-[20px] border-t border-white/5 z-50 px-4 md:px-8 flex items-center justify-between transition-all duration-500">
      
      {/* 1. Left: Track Info */}
      <div className="flex items-center gap-4 w-1/4 min-w-[150px]">
        {/* Album Art Simulator */}
        <div className={`w-14 h-14 rounded-md ${currentSong.cover} shadow-soft flex-shrink-0 relative overflow-hidden group cursor-pointer`}>
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-base flex items-center justify-center">
            <Maximize2 className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="hidden sm:block truncate">
          <h4 className="text-white font-semibold text-sm truncate hover:underline cursor-pointer">{currentSong.title}</h4>
          <p className="text-melora-textSecondary text-xs truncate hover:underline cursor-pointer">{currentSong.artist}</p>
        </div>
        <button className="hidden md:block ml-2 text-melora-textMuted hover:text-melora-pink transition-colors duration-base">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Center: Player Controls */}
      <div className="flex flex-col items-center justify-center w-2/4 max-w-[600px]">
        {/* Buttons */}
        <div className="flex items-center gap-6 mb-2">
          <button 
            onClick={handleShuffleToggle}
            className={`hidden sm:block transition-colors duration-base ${isShuffle ? 'text-melora-purple' : 'text-melora-textMuted hover:text-white'}`}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          
          <button onClick={handlePrevious} className="text-melora-textMuted hover:text-white transition-colors duration-base active:scale-95">
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Large Glowing Play Button */}
          <button 
            onClick={handlePlayPause}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-01 shadow-glow text-white hover:scale-105 active:scale-95 transition-all duration-base"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-1" />}
          </button>

          <button onClick={handleNext} className="text-melora-textMuted hover:text-white transition-colors duration-base active:scale-95">
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button 
            onClick={handleRepeatToggle}
            className={`hidden sm:block transition-colors duration-base ${repeatMode !== 'off' ? 'text-melora-purple' : 'text-melora-textMuted hover:text-white'}`}
          >
            <Repeat className="w-4 h-4" />
            {repeatMode === 'one' && <span className="absolute text-[8px] font-bold mt-[-18px] ml-[6px] text-melora-purple">1</span>}
          </button>
        </div>

        {/* Progress Bar (Waveform Aesthetic) */}
        <div className="w-full flex items-center gap-3 text-xs text-melora-textMuted font-medium">
          <span className="w-10 text-right">{currentSong.currentTime}</span>
          <div className="relative flex-1 h-1.5 group flex items-center">
            {/* Custom Range Slider */}
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={progress}
              onChange={handleProgressUpdate}
              className="absolute w-full h-full opacity-0 cursor-pointer z-10"
            />
            {/* Track Background */}
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden flex items-center group-hover:h-1.5 transition-all duration-base">
              {/* Active Progress */}
              <div 
                className="h-full bg-melora-purple"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Hover Thumb */}
            <div 
              className="absolute h-3 w-3 bg-white rounded-full shadow-[0_0_10px_rgba(123,92,255,0.8)] opacity-0 group-hover:opacity-100 transition-opacity duration-base pointer-events-none"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
          <span className="w-10">{currentSong.duration}</span>
        </div>
      </div>

      {/* 3. Right: Extra Controls & Volume */}
      <div className="flex items-center justify-end gap-4 w-1/4 min-w-[150px]">
        <button className="hidden lg:block text-melora-textMuted hover:text-white transition-colors duration-base">
          <Mic2 className="w-4 h-4" />
        </button>
        <button className="hidden lg:block text-melora-textMuted hover:text-white transition-colors duration-base">
          <ListMusic className="w-4 h-4" />
        </button>
        
        <div className="hidden md:flex items-center gap-2 w-24 group relative">
          <Volume2 className="w-4 h-4 text-melora-textMuted" />
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume}
            onChange={handleVolumeChange}
            className="absolute w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden flex items-center group-hover:h-1.5 transition-all duration-base">
            <div 
              className="h-full bg-white transition-all"
              style={{ width: `${volume}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}