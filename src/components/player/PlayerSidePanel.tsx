"use client";

import React, { useEffect, useState } from "react";
import { ListMusic, Mic2, Music, Play, Trash2, X } from "lucide-react";
import { usePlayerStore } from "../../store/playerStore";

interface PlayerSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "queue" | "lyrics";
}

export default function PlayerSidePanel({ isOpen, onClose, defaultTab = "queue" }: PlayerSidePanelProps) {
  const [activeTab, setActiveTab] = useState<"queue" | "lyrics">(defaultTab);
  const [activeLyricIndex, setActiveLyricIndex] = useState(0);
  const { currentSong, queue, playSong, removeFromQueue, clearQueue } = usePlayerStore();
  const parsedLyrics = currentSong?.lyrics
    ?.split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const lyricsLines = parsedLyrics?.length
    ? parsedLyrics
    : ["Lyrics not available for this song."];

  useEffect(() => { setActiveTab(defaultTab); }, [defaultTab, isOpen]);
  useEffect(() => { setActiveLyricIndex(0); }, [currentSong?.id]);

  return <>
    {isOpen && <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />}
    <aside className={`fixed top-0 right-0 h-[calc(100vh-90px)] md:h-[calc(100vh-100px)] w-full sm:w-96 bg-melora-surfaceLayer/95 backdrop-blur-[30px] border-l border-white/10 z-[70] flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.3)] transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
      <div className="p-5 border-b border-white/5 space-y-4">
        <div className="flex justify-between items-center"><h2 className="text-xl font-bold">Currently Playing</h2><button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button></div>
        <div className="bg-black/20 p-1 rounded-lg flex"><button onClick={() => setActiveTab("queue")} className={`flex-1 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 ${activeTab === "queue" ? "bg-white/10" : "text-melora-textMuted"}`}><ListMusic className="w-4 h-4" /> Queue</button><button onClick={() => setActiveTab("lyrics")} className={`flex-1 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 ${activeTab === "lyrics" ? "bg-white/10" : "text-melora-textMuted"}`}><Mic2 className="w-4 h-4" /> Lyrics</button></div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "queue" ? <div className="space-y-6">
          <div><p className="text-xs uppercase tracking-wider font-bold text-melora-purple mb-3">Now Playing</p>{currentSong ? <div className="flex items-center gap-3 p-3 rounded-xl bg-melora-purple/10 border border-melora-purple/20"><div className="w-12 h-12 rounded-lg bg-gradient-01 overflow-hidden flex items-center justify-center">{currentSong.coverUrl ? <img src={currentSong.coverUrl} alt="" className="w-full h-full object-cover" /> : <Music className="w-5 h-5 text-white/50" />}</div><div className="min-w-0"><p className="font-bold truncate">{currentSong.title}</p><p className="text-sm text-melora-textSecondary truncate">{currentSong.artistName}</p></div></div> : <p className="text-sm text-melora-textMuted">No song is currently playing.</p>}</div>
          <div><div className="flex justify-between items-center mb-3"><p className="text-xs uppercase tracking-wider font-bold text-melora-textMuted">Next In Queue</p>{queue.some((track) => track.id !== currentSong?.id) && <button onClick={clearQueue} className="text-xs text-melora-textMuted hover:text-red-300">Clear queue</button>}</div><div className="space-y-1">{queue.filter((track) => track.id !== currentSong?.id).map((track) => <div key={track.id} className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-white/5 group"><button onClick={() => playSong(track)} className="flex items-center gap-3 min-w-0 flex-1 text-left"><div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center shrink-0"><Play className="w-4 h-4" /></div><div className="min-w-0"><p className="text-sm font-semibold truncate">{track.title}</p><p className="text-xs text-melora-textMuted truncate">{track.artistName}</p></div></button><button onClick={() => removeFromQueue(track.id)} className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-300"><Trash2 className="w-4 h-4" /></button></div>)}{!queue.filter((track) => track.id !== currentSong?.id).length && <p className="text-sm text-melora-textMuted p-3 rounded-xl bg-white/5">Queue is empty.</p>}</div></div>
        </div> : <div className="space-y-5 pb-16">{lyricsLines.map((line, index) => <p key={`${line}-${index}`} onClick={() => setActiveLyricIndex(index)} className={`text-xl font-bold cursor-pointer transition-all ${index === activeLyricIndex ? "text-white scale-[1.02]" : index < activeLyricIndex ? "text-white/30" : "text-white/55"}`}>{line}</p>)}</div>}
      </div>
    </aside>
  </>;
}
