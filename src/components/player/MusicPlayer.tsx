"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, ListMusic, Maximize2, Mic2, Minimize2, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume2 } from "lucide-react";
import PlayerSidePanel from "./PlayerSidePanel";
import { ApiError, songsApi, tokenStorage } from "../../lib/api";
import { usePlayerStore } from "../../store/playerStore";

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
};

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastStreamedRef = useRef<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<"queue" | "lyrics">("queue");
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [playbackError, setPlaybackError] = useState("");

  const {
    currentSong, isPlaying, currentTime, duration, volume, shuffleMode, repeatMode, queue,
    playSong, togglePlay, nextSong, previousSong, setCurrentTime, setDuration, seekTo,
    setVolume, toggleShuffle, cycleRepeat, setIsPlaying,
  } = usePlayerStore();

  useEffect(() => { setLiked(Boolean(currentSong?.isLiked)); setPlaybackError(""); }, [currentSong?.id, currentSong?.isLiked]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume / 100; }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!currentSong?.src) { audio.pause(); audio.removeAttribute("src"); audio.load(); setIsPlaying(false); return; }
    if (audio.getAttribute("src") !== currentSong.src) { audio.src = currentSong.src; audio.load(); }
    const sync = async () => {
      try { if (isPlaying) await audio.play(); else audio.pause(); }
      catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) setIsPlaying(false); }
    };
    sync();
  }, [currentSong?.id, currentSong?.src, isPlaying, setIsPlaying]);

  useEffect(() => {
    if (!currentSong || !isPlaying || !tokenStorage.get() || lastStreamedRef.current === currentSong.id || currentSong.id.startsWith("demo-")) return;
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
    if (!currentSong && queue.length) { playSong(queue[0]); return; }
    togglePlay();
  };
  const handleSeek = (value: number) => { seekTo(value); if (audioRef.current) audioRef.current.currentTime = value; };
  const openSidePanel = (tab: "queue" | "lyrics") => { setPanelTab(tab); setIsPanelOpen(true); setMobileExpanded(false); };
  const toggleLike = async () => {
    if (!currentSong || currentSong.id.startsWith("demo-")) { setLiked(!liked); return; }
    try { if (liked) await songsApi.unlike(currentSong.id); else await songsApi.like(currentSong.id); setLiked(!liked); } catch { /* keep playback usable */ }
  };
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const controls = <div className="flex items-center justify-center gap-6">
    <button onClick={toggleShuffle} className={shuffleMode ? "text-melora-purple" : "text-melora-textMuted hover:text-white"}><Shuffle className="w-4 h-4" /></button>
    <button onClick={previousSong} className="text-melora-textMuted hover:text-white"><SkipBack className="w-5 h-5 fill-current" /></button>
    <button onClick={handlePlayPause} className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform">{isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}</button>
    <button onClick={nextSong} className="text-melora-textMuted hover:text-white"><SkipForward className="w-5 h-5 fill-current" /></button>
    <button onClick={cycleRepeat} className={`flex items-center gap-1 ${repeatMode !== "OFF" ? "text-melora-purple" : "text-melora-textMuted hover:text-white"}`}><Repeat className="w-4 h-4" />{repeatMode === "ONE" && <span className="text-[10px] font-bold">1</span>}</button>
  </div>;

  return <>
    <PlayerSidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} defaultTab={panelTab} />
    <audio ref={audioRef} onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)} onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration || currentSong?.duration || 0)} onEnded={() => { if (repeatMode === "ONE" && audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}); } else nextSong(); }} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} preload="metadata" />

    {mobileExpanded && <div className="fixed inset-0 z-[80] md:hidden bg-[#0B0F16] p-6 pb-10 flex flex-col">
      <div className="flex justify-between items-center"><p className="text-sm font-semibold">Now Playing</p><button onClick={() => setMobileExpanded(false)} className="p-2"><Minimize2 className="w-5 h-5" /></button></div>
      <div className="flex-1 flex flex-col justify-center min-h-0">
        <div className="aspect-square w-full max-w-sm mx-auto rounded-3xl bg-gradient-01 overflow-hidden shadow-glow flex items-center justify-center">{currentSong?.coverUrl ? <img src={currentSong.coverUrl} alt="" className="w-full h-full object-cover" /> : <Play className="w-16 h-16 text-white/30" />}</div>
        <div className="mt-7"><h3 className="text-2xl font-bold truncate">{currentSong?.title || "Nothing playing"}</h3>{currentSong ? <p className="text-melora-textSecondary truncate"><Link href={`/artists/${currentSong.artistId}`} className="hover:text-white">{currentSong.artistName}</Link>{currentSong.albumId && <> • <Link href={`/albums/${currentSong.albumId}`} className="hover:text-white">{currentSong.albumTitle}</Link></>}</p> : <p className="text-melora-textSecondary">—</p>}{currentSong?.listeners !== null && currentSong?.listeners !== undefined && <p className="text-xs text-melora-textMuted mt-2">{currentSong.listeners.toLocaleString()} listeners{currentSong.streams !== null && currentSong.streams !== undefined ? ` • ${currentSong.streams.toLocaleString()} streams` : ""}</p>}</div>
        <div className="mt-7"><input type="range" min="0" max={Math.max(duration, 1)} value={currentTime} onChange={(e) => handleSeek(Number(e.target.value))} className="w-full accent-purple-500" /><div className="flex justify-between text-xs text-melora-textMuted"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div></div>
        <div className="mt-7">{controls}</div>
        <div className="mt-7 flex items-center justify-around"><button onClick={toggleLike} className={liked ? "text-melora-pink" : "text-melora-textMuted"}><Heart className={`w-6 h-6 ${liked ? "fill-current" : ""}`} /></button><button onClick={() => openSidePanel("lyrics")} className="text-melora-textMuted"><Mic2 className="w-6 h-6" /></button><button onClick={() => openSidePanel("queue")} className="text-melora-textMuted"><ListMusic className="w-6 h-6" /></button></div>
      </div>
    </div>}

    {playbackError && <div className="fixed bottom-[90px] md:bottom-[100px] left-1/2 -translate-x-1/2 z-[55] max-w-lg w-[90%] rounded-xl bg-red-500/15 border border-red-400/20 px-4 py-2 text-sm text-red-200 text-center">{playbackError}</div>}

    <div className="fixed bottom-0 left-0 w-full h-[74px] md:h-[100px] bg-melora-surfaceLayer/90 backdrop-blur-[20px] border-t border-white/5 z-50 px-3 md:px-8 flex items-center justify-between">
      <button onClick={() => setMobileExpanded(true)} className="flex md:hidden items-center gap-3 min-w-0 flex-1 text-left"><div className="w-12 h-12 rounded-lg bg-gradient-01 overflow-hidden shrink-0">{currentSong?.coverUrl && <img src={currentSong.coverUrl} alt="" className="w-full h-full object-cover" />}</div><div className="min-w-0"><p className="font-semibold text-sm truncate">{currentSong?.title || "Nothing playing"}</p><p className="text-xs text-melora-textMuted truncate">{currentSong?.artistName || "—"}</p></div></button>
      <div className="md:hidden flex items-center gap-3"><button onClick={handlePlayPause} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">{isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}</button><button onClick={nextSong}><SkipForward className="w-5 h-5" /></button></div>

      <div className="hidden md:flex items-center gap-4 w-1/4 min-w-[180px]">
        <button onClick={() => setMobileExpanded(true)} className="w-14 h-14 rounded-md bg-gradient-01 overflow-hidden flex items-center justify-center shrink-0 group">{currentSong?.coverUrl ? <img src={currentSong.coverUrl} alt="" className="w-full h-full object-cover" /> : <Maximize2 className="w-5 h-5 text-white/40" />}</button>
        <div className="min-w-0">{currentSong ? <><Link href={`/songs/${currentSong.id}`} className="font-semibold text-sm truncate block hover:underline">{currentSong.title}</Link><p className="text-xs text-melora-textSecondary truncate"><Link href={`/artists/${currentSong.artistId}`} className="hover:underline">{currentSong.artistName}</Link>{currentSong.albumId && <> • <Link href={`/albums/${currentSong.albumId}`} className="hover:underline">{currentSong.albumTitle}</Link></>}</p>{currentSong.listeners !== null && currentSong.listeners !== undefined && <p className="text-[10px] text-melora-textMuted truncate">{currentSong.listeners.toLocaleString()} listeners{currentSong.streams !== null && currentSong.streams !== undefined ? ` • ${currentSong.streams.toLocaleString()} streams` : ""}</p>}</> : <><p className="font-semibold text-sm">Nothing playing</p><p className="text-xs text-melora-textMuted">—</p></>}</div>
        <button onClick={toggleLike} className={liked ? "text-melora-pink" : "text-melora-textMuted hover:text-melora-pink"}><Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} /></button>
      </div>

      <div className="hidden md:flex flex-col items-center justify-center w-2/4 max-w-[650px]">{controls}<div className="w-full flex items-center gap-3 text-xs text-melora-textMuted mt-2"><span className="w-10 text-right">{formatTime(currentTime)}</span><input type="range" min="0" max={Math.max(duration, 1)} value={currentTime} onChange={(e) => handleSeek(Number(e.target.value))} className="flex-1 accent-purple-500" /><span className="w-10">{formatTime(duration)}</span></div></div>

      <div className="hidden md:flex items-center justify-end gap-4 w-1/4 min-w-[180px]"><button onClick={() => openSidePanel("lyrics")} className="text-melora-textMuted hover:text-white"><Mic2 className="w-4 h-4" /></button><button onClick={() => openSidePanel("queue")} className="text-melora-textMuted hover:text-white"><ListMusic className="w-4 h-4" /></button><div className="flex items-center gap-2 w-28"><Volume2 className="w-4 h-4 text-melora-textMuted" /><input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full accent-purple-500" /></div></div>
    </div>
  </>;
}
