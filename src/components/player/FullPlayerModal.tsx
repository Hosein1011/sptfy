"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Heart,
  ListMusic,
  Maximize2,
  Mic2,
  Minimize2,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react";
import MeloraWaveform from "../brand/MeloraWaveform";
import Slider from "../ui/Slider";
import IconButton from "../ui/IconButton";
import { usePlayerStore } from "../../store/playerStore";
import { songsApi } from "../../lib/api";

interface FullPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSidePanel: (tab: "queue" | "lyrics") => void;
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
};

export default function FullPlayerModal({
  isOpen,
  onClose,
  onOpenSidePanel,
}: FullPlayerModalProps) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffleMode,
    repeatMode,
    togglePlay,
    nextSong,
    previousSong,
    seekTo,
    setVolume,
    toggleShuffle,
    cycleRepeat,
  } = usePlayerStore();

  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<"cover" | "lyrics">("cover");

  useEffect(() => {
    setLiked(Boolean(currentSong?.isLiked));
  }, [currentSong?.id, currentSong?.isLiked]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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

  const parsedLyrics = currentSong?.lyrics
    ?.split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0B0F16] animate-in fade-in zoom-in-95 duration-base select-none overflow-hidden">
      {/* Dynamic Dominant Artwork Background with Deep Blur */}
      {currentSong?.coverUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 blur-[100px] scale-125 pointer-events-none transition-all duration-slow"
          style={{ backgroundImage: `url(${currentSong.coverUrl})` }}
        />
      )}

      {/* Atmospheric Ambient Lighting Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-melora-purple/25 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-melora-pink/20 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Top Header Controls */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 border-b border-white/6 bg-black/20 backdrop-blur-md">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-melora-textSecondary hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
        >
          <ChevronDown className="w-5 h-5" />
          <span className="hidden sm:inline">Minimize</span>
        </button>

        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-melora-purple flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-melora-pink animate-pulse" />
            <span>Now Playing</span>
          </p>
          {currentSong?.albumTitle && (
            <p className="text-xs text-melora-textMuted truncate max-w-xs md:max-w-md">
              {currentSong.albumTitle}
            </p>
          )}
        </div>

        {/* View Switcher: Cover vs Lyrics */}
        <div className="flex items-center gap-1 bg-white/6 p-1 rounded-full border border-white/10">
          <button
            onClick={() => setActiveTab("cover")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTab === "cover"
                ? "bg-white/15 text-white shadow-soft-sm"
                : "text-melora-textMuted hover:text-white"
            }`}
          >
            Artwork
          </button>
          <button
            onClick={() => setActiveTab("lyrics")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTab === "lyrics"
                ? "bg-white/15 text-white shadow-soft-sm"
                : "text-melora-textMuted hover:text-white"
            }`}
          >
            Lyrics
          </button>
        </div>
      </header>

      {/* Main Immersive Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 md:px-12 py-4 max-w-5xl mx-auto w-full min-h-0 overflow-y-auto">
        {activeTab === "cover" ? (
          <div className="flex flex-col items-center justify-center w-full max-w-md">
            {/* Center Artwork Card */}
            <div className="relative aspect-square w-full max-w-[340px] md:max-w-[380px] rounded-feature overflow-hidden shadow-glow border border-white/15 group">
              {currentSong?.coverUrl ? (
                <img
                  src={currentSong.coverUrl}
                  alt={currentSong.title}
                  className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                  <Play className="w-20 h-20 text-white/40" />
                </div>
              )}
            </div>

            {/* Signature Animated Melora Waveform below artwork */}
            <div className="mt-8 w-full max-w-xs">
              <MeloraWaveform
                isPlaying={isPlaying}
                barCount={32}
                height={32}
                color="gradient"
              />
            </div>
          </div>
        ) : (
          /* Large Lyrics Typography View */
          <div className="w-full max-w-2xl h-[420px] overflow-y-auto space-y-6 text-center px-4 custom-scrollbar py-6">
            {parsedLyrics && parsedLyrics.length > 0 ? (
              parsedLyrics.map((line, idx) => (
                <p
                  key={idx}
                  className={`text-2xl md:text-3xl font-bold transition-all duration-base leading-relaxed ${
                    idx === 0
                      ? "text-white scale-105 glow-purple"
                      : "text-white/40 hover:text-white/75 cursor-pointer"
                  }`}
                >
                  {line}
                </p>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-melora-textMuted text-lg">
                Lyrics unavailable for this melody.
              </div>
            )}
          </div>
        )}

        {/* Track Title & Metadata */}
        <div className="w-full max-w-lg mt-6 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white truncate tracking-tight">
              {currentSong?.title || "No Song Selected"}
            </h1>
            <p className="text-sm md:text-base text-melora-textSecondary truncate mt-1">
              {currentSong?.artistName ? (
                <Link
                  href={`/artists/${currentSong.artistId}`}
                  onClick={onClose}
                  className="hover:text-white hover:underline transition-colors"
                >
                  {currentSong.artistName}
                </Link>
              ) : (
                "—"
              )}
            </p>
          </div>

          {/* Like Button */}
          <IconButton
            variant="ghost"
            size="lg"
            isActive={liked}
            onClick={toggleLike}
            aria-label="Like song"
          >
            <Heart
              className={`w-7 h-7 ${liked ? "fill-melora-pink text-melora-pink" : "text-melora-textMuted"}`}
            />
          </IconButton>
        </div>

        {/* Scrubber & Timestamps */}
        <div className="w-full max-w-lg mt-5 space-y-1.5">
          <Slider
            min={0}
            max={Math.max(duration, 1)}
            value={currentTime}
            onChange={(val) => seekTo(val)}
            accentColor="gradient"
          />
          <div className="flex justify-between text-xs font-mono text-melora-textMuted">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls System */}
        <div className="w-full max-w-lg mt-6 flex items-center justify-between">
          <IconButton
            variant="ghost"
            size="md"
            isActive={shuffleMode}
            onClick={toggleShuffle}
            aria-label="Toggle shuffle"
          >
            <Shuffle
              className={`w-5 h-5 ${shuffleMode ? "text-melora-purple" : "text-melora-textMuted"}`}
            />
          </IconButton>

          <IconButton
            variant="ghost"
            size="lg"
            onClick={previousSong}
            aria-label="Previous track"
          >
            <SkipBack className="w-6 h-6 fill-current text-white" />
          </IconButton>

          {/* Large Circular Play/Pause Primary CTA */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-gradient-primary text-white flex items-center justify-center shadow-glow hover:scale-105 active:scale-95 transition-all duration-micro"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          <IconButton
            variant="ghost"
            size="lg"
            onClick={nextSong}
            aria-label="Next track"
          >
            <SkipForward className="w-6 h-6 fill-current text-white" />
          </IconButton>

          <IconButton
            variant="ghost"
            size="md"
            isActive={repeatMode !== "OFF"}
            onClick={cycleRepeat}
            aria-label="Toggle repeat"
          >
            <div className="relative">
              <Repeat
                className={`w-5 h-5 ${repeatMode !== "OFF" ? "text-melora-purple" : "text-melora-textMuted"}`}
              />
              {repeatMode === "ONE" && (
                <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-melora-purple text-white rounded-full w-3 h-3 flex items-center justify-center">
                  1
                </span>
              )}
            </div>
          </IconButton>
        </div>

        {/* Bottom Secondary Controls: Volume & Side Drawer toggles */}
        <div className="w-full max-w-lg mt-6 flex items-center justify-between pt-4 border-t border-white/6">
          <div className="flex items-center gap-2.5 w-36">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 75)}
              className="text-melora-textMuted hover:text-white"
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
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

          <div className="flex items-center gap-3">
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => {
                onClose();
                onOpenSidePanel("lyrics");
              }}
              tooltip="Open lyrics drawer"
            >
              <Mic2 className="w-4 h-4" />
            </IconButton>

            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => {
                onClose();
                onOpenSidePanel("queue");
              }}
              tooltip="Open queue"
            >
              <ListMusic className="w-4 h-4" />
            </IconButton>
          </div>
        </div>
      </main>
    </div>
  );
}
