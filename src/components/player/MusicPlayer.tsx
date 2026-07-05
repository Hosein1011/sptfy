"use client";

import React, { useState, useEffect } from "react";
import {
  Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Volume2, Heart,
  Mic2, ListMusic, Maximize2
} from "lucide-react";
import PlayerSidePanel from "./PlayerSidePanel";
import { usePlayerStore } from "../../store/playerStore";

export default function MusicPlayer() {
  // --- UI STATE ---
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<"queue" | "lyrics">("queue");

  const [progress, setProgress] = useState(35); // Percentage 0-100
  const [volume, setVolume] = useState(80); // Percentage 0-100

  // --- AUDIO STATE (تغییرات بر اساس playerStore) ---
  const {
    currentSong: storeSong,
    isPlaying,
    togglePlay,
    shuffleMode,
    toggleShuffle,
    repeatMode,
    cycleRepeat
  } = usePlayerStore();

  // داده‌های فعلی ساختگی به عنوان Fallback
  const fallbackSong = {
    title: "Midnight City",
    artist: "M83",
    cover: "bg-gradient-01",
    duration: "4:03",
    currentTime: "1:25",
  };

  const currentSong = storeSong ? {
    title: storeSong.title,
    artist: storeSong.artistId,
    cover: storeSong.coverUrl ? storeSong.coverUrl : "bg-gradient-01",
    duration: storeSong.duration.toString(),
    currentTime: "0:00"
  } : fallbackSong;

  // --- INTERNAL METHODS ---
  const handlePlayPause = () => togglePlay();
  const handleNext = () => console.log("Next song");
  const handlePrevious = () => console.log("Previous song");
  const handleShuffleToggle = () => toggleShuffle();
  const handleRepeatToggle = () => cycleRepeat();

  const handleProgressUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(Number(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  const openSidePanel = (tab: "queue" | "lyrics") => {
    setPanelTab(tab);
    setIsPanelOpen(true);
  };

  useEffect(() => {
    // Logic to sync isPlaying and currentSong with actual <audio> tag
  }, [isPlaying]);

  return (
    <>
      <PlayerSidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        defaultTab={panelTab}
      />

      <div className="fixed bottom-0 left-0 w-full h-[90px] md:h-[100px] bg-melora-surfaceLayer/80 backdrop-blur-[20px] border-t border-white/5 z-50 px-4 md:px-8 flex items-center justify-between transition-all duration-500">

        <div className="flex items-center gap-4 w-1/4 min-w-[150px]">
          <div
            style={{
              backgroundImage: currentSong.cover.startsWith("bg-")
                ? undefined
                : `url('${currentSong.cover}')`
            }}
            className={`w-14 h-14 rounded-md shadow-soft flex-shrink-0 relative overflow-hidden group cursor-pointer bg-cover bg-center ${currentSong.cover.startsWith("bg-") ? currentSong.cover : ""
              }`}
          >
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

        <div className="flex flex-col items-center justify-center w-2/4 max-w-[600px]">
          <div className="flex items-center gap-6 mb-2">
            <button
              onClick={handleShuffleToggle}
              className={`hidden sm:block transition-colors duration-base ${shuffleMode ? 'text-melora-purple' : 'text-melora-textMuted hover:text-white'}`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button onClick={handlePrevious} className="text-melora-textMuted hover:text-white transition-colors duration-base active:scale-95">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

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
              className={`hidden sm:block transition-colors duration-base ${repeatMode !== 'OFF' ? 'text-melora-purple' : 'text-melora-textMuted hover:text-white'}`}
            >
              <Repeat className="w-4 h-4" />
              {repeatMode === 'ONE' && <span className="absolute text-[8px] font-bold mt-[-18px] ml-[6px] text-melora-purple">1</span>}
            </button>
          </div>

          <div className="w-full flex items-center gap-3 text-xs text-melora-textMuted font-medium">
            <span className="w-10 text-right">{currentSong.currentTime}</span>
            <div className="relative flex-1 h-1.5 group flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleProgressUpdate}
                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden flex items-center group-hover:h-1.5 transition-all duration-base">
                <div
                  className="h-full bg-melora-purple"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div
                className="absolute h-3 w-3 bg-white rounded-full shadow-[0_0_10px_rgba(123,92,255,0.8)] opacity-0 group-hover:opacity-100 transition-opacity duration-base pointer-events-none"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>
            <span className="w-10">{currentSong.duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 w-1/4 min-w-[150px]">
          <button
            onClick={() => openSidePanel("lyrics")}
            className={`hidden lg:block transition-colors duration-base ${panelTab === "lyrics" && isPanelOpen ? "text-melora-purple" : "text-melora-textMuted hover:text-white"}`}
          >
            <Mic2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => openSidePanel("queue")}
            className={`hidden lg:block transition-colors duration-base ${panelTab === "queue" && isPanelOpen ? "text-melora-purple" : "text-melora-textMuted hover:text-white"}`}
          >
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
    </>
  );
}
