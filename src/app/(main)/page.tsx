import React from "react";
import { Play, Heart, MoreHorizontal } from "lucide-react";

export default function MainPage() {
  // Visual mock data for UI/UX design testing (Person 1)
  // Person 3 will later replace this with the Zustand store and storage.ts
  const trendingSongs = [
    { id: 1, title: "Midnight City", artist: "M83", duration: "4:03", cover: "bg-gradient-01" },
    { id: 2, title: "Starboy", artist: "The Weeknd", duration: "3:50", cover: "bg-gradient-02" },
    { id: 3, title: "Nightcall", artist: "Kavinsky", duration: "4:19", cover: "bg-gradient-03" },
    { id: 4, title: "Blinding Lights", artist: "The Weeknd", duration: "3:20", cover: "bg-gradient-04" },
  ];

  const madeForYou = [
    { id: 1, title: "Late Night Drive", description: "Deep vibes and neon lights", gradient: "bg-gradient-01" },
    { id: 2, title: "Focus Flow", description: "Atmospheric and calm", gradient: "bg-gradient-02" },
    { id: 3, title: "Acoustic Sunrise", description: "Warm and acoustic", gradient: "bg-gradient-03" },
  ];

  return (
    <main className="flex-1 w-full p-6 md:p-10 pb-32">
      {/* Header Section */}
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-melora-textPrimary mb-2">
          Good Evening
        </h1>
        <p className="text-melora-textSecondary font-medium">
          Feel Every Melody.
        </p>
      </header>

      {/* Made For You (Horizontal Scroll Cards) */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-melora-textPrimary mb-6">Made For You</h2>
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
              {/* Glassmorphism content block inside the card */}
              <div className="bg-melora-bgPrimary/20 backdrop-blur-md rounded-panel p-4 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-1">{playlist.title}</h3>
                <p className="text-sm text-white/80">{playlist.description}</p>
              </div>

              {/* Hover Play Button */}
              <button className="absolute top-6 right-6 w-12 h-12 rounded-full bg-melora-bgPrimary/40 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-base hover:scale-105">
                <Play className="w-5 h-5 text-white fill-white ml-1" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Songs List */}
      <section>
        <h2 className="text-2xl font-bold text-melora-textPrimary mb-6">Trending Right Now</h2>
        <div className="flex flex-col gap-2">
          {trendingSongs.map((song, index) => (
            <div
              key={song.id}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-melora-surfaceLayer transition-colors duration-base group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <span className="text-melora-textMuted w-4 text-center font-medium">
                  {index + 1}
                </span>
                
                {/* Simulated Album Cover using Gradients */}
                <div className={`w-12 h-12 rounded-md ${song.cover} shadow-soft relative flex items-center justify-center`}>
                  <Play className="w-4 h-4 text-white fill-white opacity-0 group-hover:opacity-100 transition-opacity duration-base absolute" />
                </div>
                
                <div>
                  <h4 className="text-melora-textPrimary font-semibold">{song.title}</h4>
                  <p className="text-sm text-melora-textSecondary">{song.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm text-melora-textSecondary hidden md:block">
                  {song.duration}
                </span>
                <button className="text-melora-textSecondary hover:text-melora-pink transition-colors duration-base">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="text-melora-textSecondary hover:text-white transition-colors duration-base">
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