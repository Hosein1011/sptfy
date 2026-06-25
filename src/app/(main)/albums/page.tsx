import React from "react";
import { Play, Disc3, MoreHorizontal } from "lucide-react";

export default function AlbumsPage() {
  // Visual mock data for UI/UX design testing (Person 1)
  // Person 3 will later replace this with data from storage.ts
  const mockAlbums = [
    { id: 1, title: "Hurry Up, We're Dreaming", artist: "M83", year: "2011", songs: 22, cover: "bg-gradient-01" },
    { id: 2, title: "Starboy", artist: "The Weeknd", year: "2016", songs: 18, cover: "bg-gradient-02" },
    { id: 3, title: "OutRun", artist: "Kavinsky", year: "2013", songs: 13, cover: "bg-gradient-03" },
    { id: 4, title: "After Hours", artist: "The Weeknd", year: "2020", songs: 14, cover: "bg-gradient-04" },
    { id: 5, title: "Discovery", artist: "Daft Punk", year: "2001", songs: 14, cover: "bg-gradient-01" },
    { id: 6, title: "Currents", artist: "Tame Impala", year: "2015", songs: 13, cover: "bg-gradient-02" },
    { id: 7, title: "Random Access Memories", artist: "Daft Punk", year: "2013", songs: 13, cover: "bg-gradient-03" },
    { id: 8, title: "Dawn FM", artist: "The Weeknd", year: "2022", songs: 16, cover: "bg-gradient-04" },
  ];

  return (
    <main className="flex-1 w-full p-6 md:p-10 pb-32">
      {/* Header Section */}
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Disc3 className="w-8 h-8 text-melora-purple" />
            Your Albums
          </h1>
          <p className="text-melora-textSecondary font-medium">
            The collections that define your mood.
          </p>
        </div>
      </header>

      {/* Albums Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {mockAlbums.map((album) => (
          <div 
            key={album.id} 
            className="group cursor-pointer flex flex-col gap-3"
          >
            {/* Album Cover with Hover Overlay */}
            <div className={`
              w-full aspect-square rounded-card ${album.cover} shadow-soft relative overflow-hidden
              transition-transform duration-slow group-hover:-translate-y-2
            `}>
              {/* Glassmorphism Hover State */}
              <div className="absolute inset-0 bg-melora-bgPrimary/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-base flex items-center justify-center">
                <button className="w-14 h-14 rounded-full bg-melora-purple/90 shadow-glow flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-base">
                  <Play className="w-6 h-6 text-white fill-white ml-1" />
                </button>
              </div>
            </div>

            {/* Album Info */}
            <div className="px-1 flex justify-between items-start">
              <div className="overflow-hidden pr-2">
                <h3 className="text-white font-bold text-base truncate hover:underline">
                  {album.title}
                </h3>
                <p className="text-melora-textSecondary text-sm truncate hover:underline">
                  {album.artist}
                </p>
                <p className="text-melora-textMuted text-xs mt-1">
                  {album.year} • {album.songs} songs
                </p>
              </div>
              
              <button className="text-melora-textMuted hover:text-white transition-colors duration-base mt-1 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}