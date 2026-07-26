"use client";

import React from "react";
import { Play, Heart, MoreHorizontal } from "lucide-react";
import { usePlayerStore } from "../../store/playerStore";
import { Song } from "../../types";

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
    {
      id: 1,
      title: "Late Night Drive",
      description: "Deep vibes and neon lights",
      gradient: "bg-gradient-01",
    },
    {
      id: 2,
      title: "Focus Flow",
      description: "Atmospheric and calm",
      gradient: "bg-gradient-02",
    },
    {
      id: 3,
      title: "Acoustic Sunrise",
      description: "Warm and acoustic",
      gradient: "bg-gradient-03",
    },
  ];

  return (
    <main className="flex-1 w-full p-6 md:p-10 pb-32">
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-melora-textPrimary mb-2">
          Good Evening
        </h1>
        <p className="text-melora-textSecondary font-medium">
          Feel Every Melody.
        </p>
      </header>

      <section className="mb-14">
        <h2 className="text-2xl font-bold text-melora-textPrimary mb-6">
          Made For You
        </h2>
        <div className="flex gap-6 overflow-x-auto pb-6 snap-x hide-scrollbar">
          {madeForYou.map((playlist) => (
            <div
              key={playlist.id}
              className={`
                min-w-[260px] h-[320px] rounded-card p-6 flex flex-col justify-end
                ${playlist.gradient} shadow-soft relative group cursor-pointer snap-start
                transition-transform duration-slow hover:-translate-y-2
              `}
            >
              <div className="bg-melora-bgPrimary/20 backdrop-blur-md rounded-panel p-4 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-1">
                  {playlist.title}
                </h3>
                <p className="text-sm text-white/80">{playlist.description}</p>
              </div>

              <button
                type="button"
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-melora-bgPrimary/40 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-base hover:scale-105"
              >
                <Play className="w-5 h-5 text-white fill-white ml-1" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-melora-textPrimary mb-6">
          Trending Right Now
        </h2>
        <div className="flex flex-col gap-2">
          {trendingSongs.map((song, index) => (
            <div
              key={song.id}
              onClick={() => playSong(song)}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-melora-surfaceLayer transition-colors duration-base group cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-melora-textMuted w-4 text-center font-medium">
                  {index + 1}
                </span>

                <div
                  className="w-12 h-12 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 shadow-soft relative flex items-center justify-center"
                >
                  <Play className="w-4 h-4 text-white fill-white opacity-0 group-hover:opacity-100 transition-opacity duration-base absolute" />
                </div>

                <div className="min-w-0">
                  <h4 className="text-melora-textPrimary font-semibold truncate">
                    {song.title}
                  </h4>
                  <p className="text-sm text-melora-textSecondary truncate">
                    {song.artistName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm text-melora-textSecondary hidden md:block">
                  {Math.floor(song.duration / 60)}:
                  {String(song.duration % 60).padStart(2, "0")}
                </span>

                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="text-melora-textSecondary hover:text-melora-pink transition-colors duration-base"
                >
                  <Heart className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="text-melora-textSecondary hover:text-white transition-colors duration-base"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
