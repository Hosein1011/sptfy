"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  Heart,
  Mic2,
  ListMusic,
  Maximize2,
} from "lucide-react";
import PlayerSidePanel from "./PlayerSidePanel";
import { usePlayerStore } from "../../store/playerStore";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<"queue" | "lyrics">("queue");

  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffleMode,
    repeatMode,
    queue,
    playSong,
    togglePlay,
    nextSong,
    previousSong,
    setCurrentTime,
    setDuration,
    seekTo,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    setIsPlaying,
  } = usePlayerStore();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentSong?.src) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      setIsPlaying(false);
      return;
    }

    if (audio.src !== currentSong.src) {
      audio.src = currentSong.src;
      audio.load();
    }

    const playAudio = async () => {
      try {
        if (isPlaying) {
          await audio.play();
        } else {
          audio.pause();
        }
      } catch (error) {
        console.error("Audio playback error:", error);
        setIsPlaying(false);
      }
    };

    playAudio();
  }, [currentSong, isPlaying, setIsPlaying]);

  const handlePlayPause = () => {
    if (!currentSong && queue.length > 0) {
      playSong(queue[0]);
      return;
    }
    togglePlay();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    seekTo(value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value / 100;
    }
  };

  const openSidePanel = (tab: "queue" | "lyrics") => {
    setPanelTab(tab);
    setIsPanelOpen(true);
  };

  const progress =
    duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <>
      <PlayerSidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        defaultTab={panelTab}
      />

      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (!audioRef.current) return;
          setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (!audioRef.current) return;
          setDuration(audioRef.current.duration || 0);
        }}
        onEnded={() => {
          if (repeatMode === "ONE" && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(console.error);
            return;
          }
          nextSong();
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
      />

      <div className="fixed bottom-0 left-0 w-full h-[90px] md:h-[100px] bg-melora-surfaceLayer/80 backdrop-blur-[20px] border-t border-white/5 z-50 px-4 md:px-8 flex items-center justify-between transition-all duration-500">
        <div className="flex items-center gap-4 w-1/4 min-w-[150px]">
          <div className="w-14 h-14 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 shadow-soft flex-shrink-0 relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-base flex items-center justify-center">
              <Maximize2 className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="hidden sm:block truncate">
            <h4 className="text-white font-semibold text-sm truncate hover:underline cursor-pointer">
              {currentSong?.title ?? "Nothing playing"}
            </h4>
            <p className="text-melora-textSecondary text-xs truncate hover:underline cursor-pointer">
              {currentSong?.artistName ?? "—"}
            </p>
          </div>

          <button className="hidden md:block ml-2 text-melora-textMuted hover:text-melora-pink transition-colors duration-base">
            <Heart className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center w-2/4 max-w-[600px]">
          <div className="flex items-center gap-6 mb-2">
            <button
              onClick={toggleShuffle}
              className={`hidden sm:block transition-colors duration-base ${shuffleMode ? "text-melora-purple" : "text-melora-textMuted hover:text-white"
                }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={previousSong}
              className="text-melora-textMuted hover:text-white transition-colors duration-base"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={handlePlayPause}
              className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform duration-base shadow-lg"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={nextSong}
              className="text-melora-textMuted hover:text-white transition-colors duration-base"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={cycleRepeat}
              className={`hidden sm:flex items-center gap-1 transition-colors duration-base ${repeatMode !== "OFF" ? "text-melora-purple" : "text-melora-textMuted hover:text-white"
                }`}
            >
              <Repeat className="w-4 h-4" />
              {repeatMode === "ONE" && <span className="text-[10px] font-bold">1</span>}
            </button>
          </div>

          <div className="w-full flex items-center gap-3 text-xs text-melora-textMuted font-medium">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <div className="relative flex-1 h-1.5 group flex items-center">
              <input
                type="range"
                min="0"
                max={Math.max(duration, 1)}
                value={currentTime}
                onChange={handleSeek}
                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-melora-purple" style={{ width: `${progress}%` }} />
              </div>
              <div
                className="absolute h-3 w-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>
            <span className="w-10">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 w-1/4 min-w-[150px]">
          <button
            onClick={() => openSidePanel("lyrics")}
            className="text-melora-textMuted hover:text-white transition-colors duration-base"
          >
            <Mic2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => openSidePanel("queue")}
            className="text-melora-textMuted hover:text-white transition-colors duration-base"
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
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-white transition-all" style={{ width: `${volume}%` }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
