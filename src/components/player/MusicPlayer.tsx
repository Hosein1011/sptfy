"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Heart,
  ListMusic,
  Maximize2,
  Mic2,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import PlayerSidePanel from "./PlayerSidePanel";
import FullPlayerModal from "./FullPlayerModal";
import MeloraWaveform from "../brand/MeloraWaveform";
import Slider from "../ui/Slider";
import IconButton from "../ui/IconButton";
import { ApiError, songsApi, tokenStorage } from "../../lib/api";
import { usePlayerStore } from "../../store/playerStore";
import { useUIStore } from "../../store/uiStore";

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
};

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastStreamedRef = useRef<string | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [sidePanelTab, setSidePanelTab] = useState<"queue" | "lyrics">("queue");
  const [liked, setLiked] = useState(false);
  const [playbackError, setPlaybackError] = useState("");

  const { sidebarCollapsed } = useUIStore();

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
    setLiked(Boolean(currentSong?.isLiked));
    setPlaybackError("");
  }, [currentSong?.id, currentSong?.isLiked]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
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
    if (audio.getAttribute("src") !== currentSong.src) {
      audio.src = currentSong.src;
      audio.load();
    }
    const sync = async () => {
      try {
        if (isPlaying) await audio.play();
        else audio.pause();
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setIsPlaying(false);
        }
      }
    };
    sync();
  }, [currentSong?.id, currentSong?.src, isPlaying, setIsPlaying]);

  // Stream metrics tracking
  useEffect(() => {
    if (
      !currentSong ||
      !isPlaying ||
      !tokenStorage.get() ||
      lastStreamedRef.current === currentSong.id ||
      currentSong.id.startsWith("demo-")
    ) {
      return;
    }
    lastStreamedRef.current = currentSong.id;
    songsApi.stream(currentSong.id, 0).catch((error) => {
      if (error instanceof ApiError && (error.status === 403 || error.status === 429)) {
        setPlaybackError(error.message);
        setIsPlaying(false);
        audioRef.current?.pause();
      }
    });
  }, [currentSong?.id, isPlaying, setIsPlaying]);

  const handlePlayPause = () => {
    if (!currentSong && queue.length) {
      playSong(queue[0]);
      return;
    }
    togglePlay();
  };

  const handleSeek = (value: number) => {
    seekTo(value);
    if (audioRef.current) audioRef.current.currentTime = value;
  };

  const openSidePanel = (tab: "queue" | "lyrics") => {
    setSidePanelTab(tab);
    setIsSidePanelOpen(true);
  };

  const toggleLike = async () => {
    if (!currentSong) return;
    try {
      if (liked) await songsApi.unlike(currentSong.id);
      else await songsApi.like(currentSong.id);
      setLiked(!liked);
    } catch {
      setLiked(!liked);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() =>
          audioRef.current && setDuration(audioRef.current.duration || currentSong?.duration || 0)
        }
        onEnded={() => {
          if (repeatMode === "ONE" && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          } else {
            nextSong();
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
      />

      {/* Side Panel (Queue & Lyrics Drawer) */}
      <PlayerSidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        defaultTab={sidePanelTab}
      />

      {/* Fullscreen Cinematic Player Modal */}
      <FullPlayerModal
        isOpen={isFullPlayerOpen}
        onClose={() => setIsFullPlayerOpen(false)}
        onOpenSidePanel={openSidePanel}
      />

      {/* Floating Error Toast if playback restricted */}
      {playbackError && (
        <div className="fixed bottom-28 md:bottom-28 left-1/2 -translate-x-1/2 z-[85] max-w-md w-[90%] rounded-card bg-melora-error/20 border border-melora-error/40 px-4 py-2.5 text-xs text-red-200 text-center backdrop-blur-md shadow-soft-lg">
          {playbackError}
        </div>
      )}

      {/* Floating Glass Player Bar */}
      <div
        className={`
          fixed z-40
          bottom-18 md:bottom-5
          left-3 right-3 md:right-6 lg:right-8
          ${
            sidebarCollapsed
              ? "md:left-[calc(5rem+1.5rem)] lg:left-[calc(5rem+2rem)]"
              : "md:left-[calc(16rem+1.5rem)] lg:left-[calc(18rem+2rem)]"
          }
          h-[68px] md:h-[84px]
          glass-player rounded-player
          px-3 md:px-6
          flex items-center justify-between gap-3 md:gap-6
          shadow-glow-ambient
          transition-all duration-base ease-out
        `}
      >
        {/* Left Track Info */}
        <div className="flex items-center gap-3 w-auto md:w-1/4 min-w-0 max-w-[240px] md:max-w-xs">
          <button
            onClick={() => setIsFullPlayerOpen(true)}
            className="w-11 h-11 md:w-14 md:h-14 rounded-xl bg-melora-cardElevated overflow-hidden flex items-center justify-center shrink-0 group relative border border-white/10"
            title="Expand Fullscreen Player"
          >
            {currentSong?.coverUrl ? (
              <img
                src={currentSong.coverUrl}
                alt=""
                className="w-full h-full object-cover transition-transform duration-base group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                <Play className="w-5 h-5 text-white/50" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </button>

          <div
            onClick={() => setIsFullPlayerOpen(true)}
            className="min-w-0 cursor-pointer flex-1 text-left"
          >
            <p className="font-bold text-xs md:text-sm text-white truncate hover:underline">
              {currentSong?.title || "Nothing Playing"}
            </p>
            <p className="text-[11px] md:text-xs text-melora-textSecondary truncate">
              {currentSong?.artistName || "Select a melody"}
            </p>
          </div>

          {currentSong && (
            <IconButton
              variant="ghost"
              size="sm"
              isActive={liked}
              onClick={toggleLike}
              className="hidden sm:inline-flex shrink-0"
              aria-label="Like song"
            >
              <Heart
                className={`w-4 h-4 ${liked ? "fill-melora-pink text-melora-pink" : "text-melora-textMuted"}`}
              />
            </IconButton>
          )}
        </div>

        {/* Center Playback Controls & Scrubber (Desktop) */}
        <div className="hidden md:flex flex-col items-center justify-center flex-1 max-w-xl">
          <div className="flex items-center justify-center gap-5 mb-1.5">
            <IconButton
              variant="ghost"
              size="sm"
              isActive={shuffleMode}
              onClick={toggleShuffle}
              aria-label="Toggle shuffle"
            >
              <Shuffle
                className={`w-3.5 h-3.5 ${shuffleMode ? "text-melora-purple" : "text-melora-textMuted"}`}
              />
            </IconButton>

            <IconButton
              variant="ghost"
              size="sm"
              onClick={previousSong}
              aria-label="Previous track"
            >
              <SkipBack className="w-4 h-4 fill-current text-white" />
            </IconButton>

            <button
              onClick={handlePlayPause}
              className="w-10 h-10 rounded-full bg-gradient-primary text-white flex items-center justify-center shadow-glow hover:scale-105 active:scale-95 transition-all"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <IconButton
              variant="ghost"
              size="sm"
              onClick={nextSong}
              aria-label="Next track"
            >
              <SkipForward className="w-4 h-4 fill-current text-white" />
            </IconButton>

            <IconButton
              variant="ghost"
              size="sm"
              isActive={repeatMode !== "OFF"}
              onClick={cycleRepeat}
              aria-label="Toggle repeat"
            >
              <div className="relative">
                <Repeat
                  className={`w-3.5 h-3.5 ${repeatMode !== "OFF" ? "text-melora-purple" : "text-melora-textMuted"}`}
                />
                {repeatMode === "ONE" && (
                  <span className="absolute -top-1 -right-1 text-[8px] font-bold text-melora-purple">
                    1
                  </span>
                )}
              </div>
            </IconButton>
          </div>

          {/* Scrubber Bar */}
          <div className="w-full flex items-center gap-3 text-[11px] font-mono text-melora-textMuted">
            <span className="w-9 text-right">{formatTime(currentTime)}</span>
            <Slider
              min={0}
              max={Math.max(duration, 1)}
              value={currentTime}
              onChange={handleSeek}
              accentColor="purple"
            />
            <span className="w-9">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Tools & Volume Area */}
        <div className="flex items-center justify-end gap-2 md:gap-3 w-auto md:w-1/4 shrink-0">
          {/* Mobile Fast Controls */}
          <div className="flex md:hidden items-center gap-1.5">
            <IconButton
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              className="bg-white/10 text-white"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
            </IconButton>
            <IconButton variant="ghost" size="sm" onClick={nextSong}>
              <SkipForward className="w-4 h-4" />
            </IconButton>
          </div>

          {/* Desktop Right Panel Actions */}
          <div className="hidden md:flex items-center gap-2">
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => openSidePanel("lyrics")}
              tooltip="View lyrics"
            >
              <Mic2 className="w-4 h-4" />
            </IconButton>

            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => openSidePanel("queue")}
              tooltip="Current queue"
            >
              <ListMusic className="w-4 h-4" />
            </IconButton>

            {/* Volume Control */}
            <div className="flex items-center gap-2 w-28 pl-1">
              <button
                onClick={() => setVolume(volume > 0 ? 0 : 75)}
                className="text-melora-textMuted hover:text-white"
              >
                {volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
              <Slider
                min={0}
                max={100}
                value={volume}
                onChange={setVolume}
                accentColor="purple"
              />
            </div>

            {/* Expand Fullscreen Player */}
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => setIsFullPlayerOpen(true)}
              tooltip="Fullscreen view"
            >
              <Maximize2 className="w-4 h-4" />
            </IconButton>
          </div>
        </div>
      </div>
    </>
  );
}
