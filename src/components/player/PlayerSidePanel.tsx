"use client";

import React, { useEffect, useState } from "react";
import {
  ListMusic,
  Mic2,
  Music,
  Play,
  Trash2,
  X,
  Sparkles,
  GripVertical,
} from "lucide-react";
import MeloraWaveform from "../brand/MeloraWaveform";
import IconButton from "../ui/IconButton";
import { usePlayerStore } from "../../store/playerStore";

interface PlayerSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "queue" | "lyrics";
}

export default function PlayerSidePanel({
  isOpen,
  onClose,
  defaultTab = "queue",
}: PlayerSidePanelProps) {
  const [activeTab, setActiveTab] = useState<"queue" | "lyrics">(defaultTab);
  const [activeLyricIndex, setActiveLyricIndex] = useState(0);

  const {
    currentSong,
    queue,
    isPlaying,
    currentTime,
    playSong,
    removeFromQueue,
    clearQueue,
    seekTo,
  } = usePlayerStore();

  const parsedLyrics = currentSong?.lyrics
    ?.split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const lyricsLines = parsedLyrics?.length
    ? parsedLyrics
    : ["No lyrics available for this melody."];

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, isOpen]);

  useEffect(() => {
    setActiveLyricIndex(0);
  }, [currentSong?.id]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-base"
          onClick={onClose}
        />
      )}

      {/* Sliding Glass Drawer */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-full sm:w-[420px]
          glass-modal border-l border-white/10 z-[70]
          flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]
          transition-transform duration-base ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Sound Experience
            </h2>
            <IconButton variant="ghost" size="sm" onClick={onClose} aria-label="Close">
              <X className="w-5 h-5" />
            </IconButton>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="bg-white/6 p-1 rounded-btn flex border border-white/8">
            <button
              onClick={() => setActiveTab("queue")}
              className={`
                flex-1 py-2 rounded-btn text-xs font-bold flex items-center justify-center gap-2
                transition-all duration-micro
                ${
                  activeTab === "queue"
                    ? "bg-gradient-primary text-white shadow-glow"
                    : "text-melora-textSecondary hover:text-white"
                }
              `}
            >
              <ListMusic className="w-4 h-4" />
              <span>Queue ({queue.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("lyrics")}
              className={`
                flex-1 py-2 rounded-btn text-xs font-bold flex items-center justify-center gap-2
                transition-all duration-micro
                ${
                  activeTab === "lyrics"
                    ? "bg-gradient-primary text-white shadow-glow"
                    : "text-melora-textSecondary hover:text-white"
                }
              `}
            >
              <Mic2 className="w-4 h-4" />
              <span>Lyrics</span>
            </button>
          </div>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pb-32">
          {activeTab === "queue" ? (
            <div className="space-y-6">
              {/* Currently Playing Card */}
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-melora-purple mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-melora-pink animate-pulse" />
                  <span>Now Playing</span>
                </p>

                {currentSong ? (
                  <div className="p-3.5 rounded-card bg-melora-purple/15 border border-melora-purple/30 flex items-center justify-between gap-3 shadow-glow">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-melora-cardElevated overflow-hidden shrink-0 border border-white/10 relative">
                        {currentSong.coverUrl ? (
                          <img
                            src={currentSong.coverUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Music className="w-5 h-5 text-white/50 m-auto mt-3.5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-sm text-white truncate">
                          {currentSong.title}
                        </p>
                        <p className="text-xs text-melora-textSecondary truncate mt-0.5">
                          {currentSong.artistName}
                        </p>
                      </div>
                    </div>

                    <MeloraWaveform
                      isPlaying={isPlaying}
                      barCount={8}
                      height={20}
                      color="pink"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-melora-textMuted p-4 rounded-card bg-white/5 border border-white/6">
                    No song is currently active.
                  </p>
                )}
              </div>

              {/* Next In Queue List */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs uppercase tracking-wider font-bold text-melora-textSecondary">
                    Next Up
                  </p>
                  {queue.some((track) => track.id !== currentSong?.id) && (
                    <button
                      onClick={clearQueue}
                      className="text-xs text-melora-textMuted hover:text-melora-pink transition-colors font-medium"
                    >
                      Clear queue
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {queue
                    .filter((track) => track.id !== currentSong?.id)
                    .map((track, idx) => (
                      <div
                        key={`${track.id}-${idx}`}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-btn hover:bg-white/6 border border-transparent hover:border-white/6 group transition-all"
                      >
                        <button
                          onClick={() => playSong(track)}
                          className="flex items-center gap-3 min-w-0 flex-1 text-left"
                        >
                          <div className="w-9 h-9 rounded-lg bg-melora-cardElevated border border-white/8 overflow-hidden flex items-center justify-center shrink-0 group-hover:border-melora-purple/40">
                            {track.coverUrl ? (
                              <img
                                src={track.coverUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Play className="w-3.5 h-3.5 text-white/50 group-hover:text-white" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate group-hover:text-melora-purple transition-colors">
                              {track.title}
                            </p>
                            <p className="text-[11px] text-melora-textSecondary truncate">
                              {track.artistName}
                            </p>
                          </div>
                        </button>

                        <button
                          onClick={() => removeFromQueue(track.id)}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-melora-textMuted hover:text-melora-error hover:bg-melora-error/10 transition-all"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                  {!queue.filter((track) => track.id !== currentSong?.id).length && (
                    <div className="text-center p-8 rounded-card border border-white/6 bg-white/[0.02]">
                      <p className="text-xs text-melora-textMuted">
                        Your queue is quiet. Add songs from your library or explore new releases.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Synced Lyrics List */
            <div className="space-y-6 py-4">
              {lyricsLines.map((line, index) => {
                const isActive = index === activeLyricIndex;
                return (
                  <p
                    key={`${line}-${index}`}
                    onClick={() => setActiveLyricIndex(index)}
                    className={`
                      text-lg md:text-xl font-bold cursor-pointer transition-all duration-base leading-relaxed
                      ${
                        isActive
                          ? "text-white scale-[1.03] glow-purple pl-2 border-l-2 border-melora-pink font-extrabold"
                          : index < activeLyricIndex
                            ? "text-white/25 hover:text-white/50"
                            : "text-white/45 hover:text-white/80"
                      }
                    `}
                  >
                    {line}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
