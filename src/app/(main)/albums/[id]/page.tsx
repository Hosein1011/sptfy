"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Disc3, Play, Shuffle, Download, Heart, Music, Clock } from "lucide-react";
import { albumsApi, playlistsApi, songsApi } from "../../../../lib/api";
import { useAuthStore } from "../../../../store/authStore";
import { usePlayerStore } from "../../../../store/playerStore";
import { Album, Playlist, Song } from "../../../../types";
import Button from "../../../../components/common/Button";
import IconButton from "../../../../components/ui/IconButton";
import { useToast } from "../../../../components/ui/ToastProvider";

const fmt = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export default function AlbumDetailPage() {
  const params = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const playSong = usePlayerStore((state) => state.playSong);
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const { toast } = useToast();

  const [album, setAlbum] = useState<Album | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    albumsApi
      .get(params.id)
      .then(setAlbum)
      .catch((e) => setError(e instanceof Error ? e.message : "Album not found."));
  }, [params.id]);

  useEffect(() => {
    if (user) {
      playlistsApi
        .list({ owner: user.id, page_size: 100 })
        .then((r) => setPlaylists(r.results))
        .catch(() => {});
    }
  }, [user?.id]);

  const playAll = (shuffle = false) => {
    if (!album?.tracks.length) return;
    const tracks = shuffle
      ? [...album.tracks].sort(() => Math.random() - 0.5)
      : album.tracks;
    tracks.slice(1).forEach(addToQueue);
    playSong(tracks[0]);
    toast(`Playing "${album.title}"`, "info");
  };

  const addToPlaylist = async (playlistId: string, song: Song) => {
    if (!playlistId) return;
    try {
      await playlistsApi.addSong(playlistId, song.id);
      const r = await playlistsApi.list({ owner: user?.id, page_size: 100 });
      setPlaylists(r.results);
      toast("Added to playlist", "success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add song.");
    }
  };

  const handleDownload = async (song: Song) => {
    if (!user) {
      toast("Please log in to download songs.", "info");
      return;
    }
    if (user.tier !== "SILVER" && user.tier !== "GOLD") {
      toast("Downloads require a Silver or Gold membership.", "info");
      return;
    }

    try {
      const response = await songsApi.download(song.id);
      if (response.downloadUrl) {
        const link = document.createElement("a");
        link.href = response.downloadUrl;
        link.setAttribute("download", `${song.title}.mp3`);
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast("Download started", "success");
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to download the song.", "error");
    }
  };

  if (error && !album) {
    return (
      <main className="w-full p-10 text-center text-xs text-red-300">
        {error}
      </main>
    );
  }

  if (!album) {
    return (
      <main className="w-full p-16 text-center text-xs text-melora-textMuted">
        Loading album experience...
      </main>
    );
  }

  return (
    <main className="w-full px-4 md:px-8 lg:px-10 py-6 md:py-8 max-w-7xl mx-auto space-y-10">
      {/* Cinematic Album Hero Banner */}
      <section className="relative rounded-hero glass-panel p-6 md:p-10 border border-white/10 overflow-hidden shadow-soft-lg flex flex-col md:flex-row items-center md:items-end gap-8">
        {/* Dominant artwork atmospheric background */}
        {album.coverUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 blur-[90px] scale-125 pointer-events-none -z-10"
            style={{ backgroundImage: `url(${album.coverUrl})` }}
          />
        )}

        {/* Cover Artwork */}
        <div className="w-48 h-48 md:w-60 md:h-60 rounded-card-lg bg-gradient-purple-glow overflow-hidden shadow-glow border border-white/15 shrink-0">
          {album.coverUrl ? (
            <img
              src={album.coverUrl}
              alt={album.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Disc3 className="w-16 h-16 text-white/40" />
            </div>
          )}
        </div>

        {/* Metadata & Actions */}
        <div className="flex-1 text-center md:text-left min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-melora-pink">
            Album Release
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mt-1 truncate">
            {album.title}
          </h1>

          <p className="mt-2 text-xs md:text-sm text-melora-textSecondary">
            <Link
              href={`/artists/${album.artistId}`}
              className="text-white font-semibold hover:underline"
            >
              {album.artistName}
            </Link>{" "}
            • {new Date(album.releaseDate).getFullYear()} • {album.songCount} songs •{" "}
            {Math.floor(album.totalDuration / 60)} min
          </p>

          {album.genre && (
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs bg-white/8 text-melora-lavender border border-white/10">
              {album.genre}
            </span>
          )}

          {/* Controls */}
          <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Play className="w-4 h-4 fill-current" />}
              onClick={() => playAll(false)}
              className="rounded-full shadow-glow"
            >
              Play Album
            </Button>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Shuffle className="w-4 h-4" />}
              onClick={() => playAll(true)}
              className="rounded-full"
            >
              Shuffle
            </Button>
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Tracklist
        </h2>

        <div className="glass-panel rounded-card-lg p-2.5 space-y-1 border border-white/6">
          {album.tracks.map((song, index) => (
            <div
              key={song.id}
              className="flex items-center justify-between p-3 rounded-card hover:bg-white/6 transition-colors group select-none"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <span className="w-6 text-center text-xs font-mono text-melora-textMuted">
                  {index + 1}
                </span>

                <button
                  onClick={() => playSong(song)}
                  className="text-left min-w-0 flex-1"
                >
                  <p className="font-semibold text-sm text-white truncate group-hover:text-melora-purple transition-colors">
                    {song.title}
                  </p>
                  <p className="text-xs text-melora-textSecondary truncate">
                    {song.genre || album.genre || "Melora Melody"}
                  </p>
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-melora-textMuted">
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(song)}
                  tooltip="Download"
                >
                  <Download className="w-4 h-4" />
                </IconButton>

                <span>{fmt(song.duration)}</span>

                {playlists.length > 0 && (
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      addToPlaylist(e.target.value, song);
                      e.currentTarget.value = "";
                    }}
                    className="max-w-[140px] bg-melora-cardSurface border border-white/10 rounded-full px-2.5 py-1 text-[11px] text-melora-textSecondary focus:outline-none focus:border-melora-purple cursor-pointer hidden sm:block"
                  >
                    <option value="">+ Playlist…</option>
                    {playlists.map((p) => (
                      <option
                        key={p.id}
                        value={p.id}
                        disabled={p.songIds.includes(song.id)}
                      >
                        {p.songIds.includes(song.id) ? "✓ " : ""}
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}