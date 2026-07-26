"use client";

import React from "react";
import { Play, Heart, MoreHorizontal } from "lucide-react";
import { usePlayerStore } from "../../../../store/playerStore";
import { Song } from "../../../../types";

export default function MainPage() {
  const playSong = usePlayerStore((state) => state.playSong);

  const trendingSongs: Song[] = [
    {
      id: "1",
      title: "Midnight City",
      artistId: "m83",
      artistName: "M83",
      duration: 243,
      src: "/audio/nightcall.mp3",
      listeners: 1200000,
      releaseDate: "2011-08-15",
      isGoldOnly: false,
    },
    {
      id: "2",
      title: "Starboy",
      artistId: "the-weeknd",
      artistName: "The Weeknd",
      duration: 230,
      src: "/audio/nightcall.mp3",
      listeners: 2100000,
      releaseDate: "2016-11-25",
      isGoldOnly: false,
    },
    {
      id: "3",
      title: "Nightcall",
      artistId: "kavinsky",
      artistName: "Kavinsky",
      duration: 259,
      src: "/audio/nightcall.mp3",
      listeners: 900000,
      releaseDate: "2010-03-15",
      isGoldOnly: false,
    },
    {
      id: "4",
      title: "Blinding Lights",
      artistId: "the-weeknd",
      artistName: "The Weeknd",
      duration: 200,
      src: "/audio/nightcall.mp3",
      listeners: 3200000,
      releaseDate: "2019-11-29",
      isGoldOnly: false,
    },
  ];

  const madeForYou = [
    { id: 1, title: "Late Night Drive", description: "Deep vibes and neon lights", gradient: "bg-gradient-01" },
    { id: 2, title: "Focus Flow", description: "Atmospheric and calm", gradient: "bg-gradient-02" },
    { id: 3, title: "Acoustic Sunrise", description: "Warm and acoustic", gradient: "bg-gradient-03" },
  ];

  return (
    <main className="flex-1 w-full p-6 md:p-10 pb-32">
      <header className="mb-10">
        <h1 className="text-3xl md:text-5xl font-bold text-white">Welcome back</h1>
        <p className="text-melora-textSecondary mt-2">Discover music and keep the vibe going.</p>
      </header>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">Made For You</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {madeForYou.map((playlist) => (
            <div key={playlist.id} className="rounded-2xl p-5 bg-white/5 border border-white/5 hover:bg-white/8 transition-colors">
              <div className={`w-full h-32 rounded-xl mb-4 ${playlist.gradient}`} />
              <h3 className="text-white font-semibold">{playlist.title}</h3>
              <p className="text-sm text-melora-textSecondary mt-1">{playlist.description}</p>
              <button className="mt-4 w-11 h-11 rounded-full bg-white text-black flex items-center justify-center">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-4">Trending Right Now</h2>
        <div className="space-y-2">
          {trendingSongs.map((song, index) => (
            <div
              key={song.id}
              onClick={() => playSong(song)}
              className="flex items-center justify-between rounded-xl px-4 py-3 bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-melora-textMuted w-5 text-right">{index + 1}</span>
                <div className="w-11 h-11 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-white font-medium truncate">{song.title}</h4>
                  <p className="text-sm text-melora-textSecondary truncate">{song.artistName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-sm text-melora-textMuted">{Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, "0")}</span>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="text-melora-textMuted hover:text-white transition-colors"
                >
                  <Heart className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="text-melora-textMuted hover:text-white transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
