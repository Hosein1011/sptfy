import React from "react";
import { ListMusic, Play, Plus, MoreVertical } from "lucide-react";
import Button from "../../../components/common/Button";

export default function PlaylistsPage() {
  // Visual mock data for UI/UX design testing (Person 1)
  // Person 3 will later replace this with data from storage.ts & playerStore
  const mockPlaylists = [
    { id: 1, title: "Midnight Drive", creator: "You", tracks: 24, type: "Public", cover: "bg-gradient-01" },
    { id: 2, title: "Deep Focus", creator: "Melora Curators", tracks: 45, type: "Public", cover: "bg-gradient-02" },
    { id: 3, title: "Weekend Vibes", creator: "You", tracks: 12, type: "Private", cover: "bg-gradient-03" },
    { id: 4, title: "Neon Nights", creator: "Melora Curators", tracks: 38, type: "Public", cover: "bg-gradient-04" },
    { id: 5, title: "Acoustic Sunrise", creator: "You", tracks: 18, type: "Private", cover: "bg-gradient-01" },
    { id: 6, title: "Gym Flow", creator: "You", tracks: 55, type: "Public", cover: "bg-gradient-02" },
  ];

  return (
    <main className="flex-1 w-full p-6 md:p-10 pb-32">
      {/* Header Section */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <ListMusic className="w-8 h-8 text-melora-pink" />
            Your Playlists
          </h1>
          <p className="text-melora-textSecondary font-medium">
            Curate your mood. Share your vibe.
          </p>
        </div>
        
        {/* Create Playlist Button - Person 2/3 will wire up the modal later */}
        <Button variant="primary" className="flex items-center gap-2 w-full md:w-auto">
          <Plus className="w-5 h-5" />
          Create Playlist
        </Button>
      </header>

      {/* Playlists Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockPlaylists.map((playlist) => (
          <div 
            key={playlist.id} 
            className="group flex flex-col cursor-pointer bg-melora-surfaceLayer/30 border border-white/5 rounded-card p-4 hover:bg-melora-surfaceLayer/60 transition-colors duration-base"
          >
            {/* Playlist Cover (Widescreen format to distinguish from Albums) */}
            <div className={`
              w-full aspect-video rounded-lg ${playlist.cover} shadow-soft relative overflow-hidden mb-4
            `}>
              {/* Glassmorphism Hover State */}
              <div className="absolute inset-0 bg-melora-bgPrimary/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-base flex items-center justify-center">
                <button className="w-14 h-14 rounded-full bg-melora-pink/90 shadow-[0_0_30px_rgba(255,77,125,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-base">
                  <Play className="w-6 h-6 text-white fill-white ml-1" />
                </button>
              </div>
            </div>

            {/* Playlist Info */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-melora-pink transition-colors duration-base">
                  {playlist.title}
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white font-medium">{playlist.creator}</span>
                  <span className="text-melora-textMuted">•</span>
                  <span className="text-melora-textSecondary">{playlist.tracks} tracks</span>
                </div>
              </div>
              
              <button className="text-melora-textMuted hover:text-white transition-colors duration-base p-1">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            {/* Tag */}
            <div className="mt-4">
               <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md bg-white/5 text-melora-textSecondary">
                 {playlist.type}
               </span>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}