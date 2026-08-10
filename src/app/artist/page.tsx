"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic2, UploadCloud, Trash2, Music, BarChart2, Loader2 } from "lucide-react";
import Button from "../../components/common/Button";
import { artistApi } from "@/lib/api"; // یا مسیر نسبی ../../lib/api
import { Song } from "@/types";

export default function ArtistDashboardPage() {
  const [songTitle, setSongTitle] = useState("");
  const [albumName, setAlbumName] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  const [discography, setDiscography] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // دریافت لیست موزیک‌ها از بک‌اند
  const fetchDiscography = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await artistApi.getMyCatalog();
      setDiscography(res.results || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load discography");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscography();
  }, []);

  // آپلود آهنگ جدید
  const handleUploadSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle || !audioFile) {
      alert("Please provide a track title and select an audio file.");
      return;
    }

    try {
      setSubmitting(true);
      const newSong = await artistApi.uploadSong({
        title: songTitle,
        albumName: albumName || undefined,
        audioFile,
      });

      setDiscography((prev) => [newSong, ...prev]);
      setSongTitle("");
      setAlbumName("");
      setAudioFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      alert(err?.message || "Failed to upload song.");
    } finally {
      setSubmitting(false);
    }
  };

  // حذف آهنگ
  const handleDeleteSong = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this track?")) return;

    try {
      await artistApi.deleteSong(id);
      setDiscography((prev) => prev.filter((song) => song.id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to delete track.");
    }
  };

  const totalListeners = discography.reduce((acc, song) => acc + (song.listeners || 0), 0);

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
            <p className="text-melora-textMuted text-xs uppercase tracking-wider font-bold mb-1">Total Tracks</p>
            <p className="text-white font-bold text-xl flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-melora-purple" /> {discography.length}
            </p>
          </div>
          <div className="w-px bg-white/10"></div>
          <div>
            <p className="text-melora-textMuted text-xs uppercase tracking-wider font-bold mb-1">Total Listeners</p>
            <p className="text-white font-bold text-xl">{totalListeners.toLocaleString()}</p>
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
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*"
              className="hidden"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            />

            {/* Custom Dropzone Input */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video rounded-xl border-2 border-dashed border-white/10 bg-melora-bgPrimary/30 hover:border-melora-purple hover:bg-melora-purple/5 transition-all duration-base flex flex-col items-center justify-center cursor-pointer group mb-6 p-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-melora-surfaceLayer flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-glow transition-all duration-base">
                <Music className="w-5 h-5 text-melora-textSecondary group-hover:text-melora-purple transition-colors" />
              </div>
              <p className="text-sm text-white font-medium truncate max-w-full">
                {audioFile ? audioFile.name : "Click to upload audio file"}
              </p>
              <p className="text-xs text-melora-textMuted mt-1">
                {audioFile ? `${(audioFile.size / (1024 * 1024)).toFixed(2)} MB` : "WAV, FLAC, or MP3 up to 50MB"}
              </p>
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
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                placeholder="e.g. City Lights EP (Optional)"
                className="w-full bg-melora-bgPrimary/50 border border-white/10 rounded-btn py-3 px-4 text-white placeholder:text-melora-textMuted focus:outline-none focus:border-melora-purple focus:ring-1 focus:ring-melora-purple transition-all duration-base"
              />
            </div>

            <Button
              variant="primary"
              type="submit"
              disabled={submitting || !audioFile}
              className="w-full mt-4 flex justify-center items-center gap-2"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Upload Track"}
            </Button>
          </form>
        </section>

        {/* Right Column: Discography Management */}
        <section className="lg:col-span-2 bg-melora-surfaceLayer/30 border border-white/5 rounded-panel p-6 md:p-8">
          <h2 className="text-xl font-bold text-white mb-6">Your Discography</h2>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <div className="bg-melora-bgPrimary/30 rounded-xl overflow-hidden border border-white/5">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-xs font-bold text-melora-textMuted uppercase tracking-wider">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-6">Title</div>
              <div className="col-span-4 text-right">Listeners</div>
              <div className="col-span-1 text-center"></div>
            </div>

            {/* Track List */}
            {loading ? (
              <div className="p-12 text-center text-melora-textMuted flex justify-center items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-melora-purple" />
                Loading songs...
              </div>
            ) : (
              <div className="flex flex-col">
                {discography.map((track, index) => (
                  <div
                    key={track.id}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-melora-surfaceLayer/50 transition-colors duration-base group border-b border-white/5 last:border-0"
                  >
                    <div className="col-span-1 text-center text-melora-textMuted font-medium">
                      {index + 1}
                    </div>

                    <div className="col-span-6 flex flex-col pr-4">
                      <span className="text-white font-semibold truncate">{track.title}</span>
                      <span className="text-xs text-melora-textSecondary truncate">
                        {typeof track.album === "object" ? track.album?.title : track.album || "Single"}
                      </span>
                    </div>

                    <div className="col-span-4 text-right text-melora-textSecondary text-sm">
                      {(track.listeners || 0).toLocaleString()}
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

                {discography.length === 0 && (
                  <div className="p-8 text-center text-melora-textSecondary">
                    Your discography is currently empty. Upload your first track!
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}