"use client";

import React, { useState } from "react";
import { Mic2, UploadCloud, Trash2, Music, BarChart2 } from "lucide-react";
import Button from "../../components/common/Button";

export default function ArtistDashboardPage() {
  // --- UI STATE (Person 2 will replace this with real storage logic) ---
  const [songTitle, setSongTitle] = useState("");
  const [albumName, setAlbumName] = useState("");

  const mockDiscography = [
    { id: 1, title: "Neon Skyline", album: "City Lights EP", streams: "1.2M", duration: "3:45" },
    { id: 2, title: "Midnight Drive", album: "City Lights EP", streams: "845K", duration: "4:12" },
    { id: 3, title: "Echoes", album: "Singles", streams: "2.1M", duration: "3:10" },
    { id: 4, title: "Starfall", album: "Singles", streams: "450K", duration: "2:55" },
  ];

  // --- STUBS FOR PERSON 2 ---
  const handleUploadSong = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Uploading song: ${songTitle} to album: ${albumName}`);
    // storage.uploadSong({ title: songTitle, album: albumName, ... })...
    setSongTitle("");
    setAlbumName("");
  };

  const handleDeleteSong = (id: number) => {
    console.log(`Deleting song ID: ${id}`);
    // storage.deleteSong(id)...
  };

  return (
    <main className="min-h-screen p-6 md:p-10 pb-32">
      
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Mic2 className="w-8 h-8 text-melora-pink" />
            Artist Studio
          </h1>
          <p className="text-melora-textSecondary font-medium">
            Upload your vision. Track your resonance.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-6 bg-melora-surfaceLayer/30 border border-white/5 rounded-panel p-4 px-6">
          <div>
            <p className="text-melora-textMuted text-xs uppercase tracking-wider font-bold mb-1">Total Streams</p>
            <p className="text-white font-bold text-xl flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-melora-purple" /> 4.6M
            </p>
          </div>
          <div className="w-px bg-white/10"></div>
          <div>
            <p className="text-melora-textMuted text-xs uppercase tracking-wider font-bold mb-1">Listeners</p>
            <p className="text-white font-bold text-xl">842K</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Upload New Music */}
        <section className="lg:col-span-1 bg-melora-surfaceLayer/30 border border-white/5 rounded-panel p-6 md:p-8 h-fit">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-melora-purple" />
            Release New Audio
          </h2>
          
          <form onSubmit={handleUploadSong} className="space-y-5">
            
            {/* Custom File Dropzone Simulator */}
            <div className="w-full aspect-video rounded-xl border-2 border-dashed border-white/10 bg-melora-bgPrimary/30 hover:border-melora-purple hover:bg-melora-purple/5 transition-all duration-base flex flex-col items-center justify-center cursor-pointer group mb-6">
              <div className="w-12 h-12 rounded-full bg-melora-surfaceLayer flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-glow transition-all duration-base">
                <Music className="w-5 h-5 text-melora-textSecondary group-hover:text-melora-purple transition-colors" />
              </div>
              <p className="text-sm text-white font-medium">Click or drag audio file</p>
              <p className="text-xs text-melora-textMuted mt-1">WAV, FLAC, or MP3 up to 50MB</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-melora-textSecondary ml-1">Track Title</label>
              <input 
                type="text" 
                required
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                placeholder="e.g. Midnight Drive"
                className="w-full bg-melora-bgPrimary/50 border border-white/10 rounded-btn py-3 px-4 text-white placeholder:text-melora-textMuted focus:outline-none focus:border-melora-purple focus:ring-1 focus:ring-melora-purple transition-all duration-base"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-melora-textSecondary ml-1">Album / EP Name</label>
              <input 
                type="text" 
                required
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                placeholder="e.g. City Lights EP"
                className="w-full bg-melora-bgPrimary/50 border border-white/10 rounded-btn py-3 px-4 text-white placeholder:text-melora-textMuted focus:outline-none focus:border-melora-purple focus:ring-1 focus:ring-melora-purple transition-all duration-base"
              />
            </div>

            <Button variant="primary" type="submit" className="w-full mt-4">
              Upload Track
            </Button>
          </form>
        </section>

        {/* Right Column: Discography Management */}
        <section className="lg:col-span-2 bg-melora-surfaceLayer/30 border border-white/5 rounded-panel p-6 md:p-8">
          <h2 className="text-xl font-bold text-white mb-6">Your Discography</h2>
          
          <div className="bg-melora-bgPrimary/30 rounded-xl overflow-hidden border border-white/5">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-xs font-bold text-melora-textMuted uppercase tracking-wider">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-5">Title</div>
              <div className="col-span-3 hidden sm:block">Streams</div>
              <div className="col-span-2 text-right">Time</div>
              <div className="col-span-1 text-center"></div>
            </div>

            {/* Track List */}
            <div className="flex flex-col">
              {mockDiscography.map((track, index) => (
                <div 
                  key={track.id} 
                  className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-melora-surfaceLayer/50 transition-colors duration-base group"
                >
                  <div className="col-span-1 text-center text-melora-textMuted font-medium">
                    {index + 1}
                  </div>
                  
                  <div className="col-span-5 flex flex-col pr-4">
                    <span className="text-white font-semibold truncate">{track.title}</span>
                    <span className="text-xs text-melora-textSecondary truncate">{track.album}</span>
                  </div>
                  
                  <div className="col-span-3 hidden sm:block text-melora-textSecondary text-sm">
                    {track.streams}
                  </div>
                  
                  <div className="col-span-2 text-right text-melora-textSecondary text-sm">
                    {track.duration}
                  </div>
                  
                  <div className="col-span-1 flex justify-center">
                    <button 
                      onClick={() => handleDeleteSong(track.id)}
                      className="p-2 text-melora-textMuted hover:text-melora-pink hover:bg-melora-pink/10 rounded-full transition-all duration-base opacity-0 group-hover:opacity-100"
                      title="Delete Track"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {mockDiscography.length === 0 && (
                <div className="p-8 text-center text-melora-textSecondary">
                  Your discography is currently empty. Upload your first track!
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}