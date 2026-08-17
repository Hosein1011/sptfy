"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Disc3, ListPlus, Play, Search, Download, Sparkles, Music } from "lucide-react";
import { albumsApi, playlistsApi, songsApi } from "../../../lib/api";
import { useAuthStore } from "../../../store/authStore";
import { usePlayerStore } from "../../../store/playerStore";
import { Album, Playlist, Song } from "../../../types";
import SearchBar from "../../../components/ui/SearchBar";
import IconButton from "../../../components/ui/IconButton";
import { useToast } from "../../../components/ui/ToastProvider";

type SortBy = "releaseDate" | "listeners";

export default function AlbumsPage() {
  const [requestedPlaylist, setRequestedPlaylist] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const playSong = usePlayerStore((state) => state.playSong);
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("releaseDate");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRequestedPlaylist(new URLSearchParams(window.location.search).get("playlist"));
    }
  }, []);

  const loadMusic = async () => {
    setLoading(true);
    try {
      const [albumResponse, songResponse] = await Promise.all([
        albumsApi.list({ search: query, sortBy, page_size: 100 }),
        songsApi.list({ search: query, sortBy, page_size: 100 }),
      ]);
      setAlbums(albumResponse.results);
      setSongs(songResponse.results);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load music catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadMusic, 250);
    return () => clearTimeout(timer);
  }, [query, sortBy]);

  useEffect(() => {
    if (!user) return;
    playlistsApi
      .list({ owner: user.id, page_size: 100 })
      .then((response) => setPlaylists(response.results))
      .catch(() => {});
  }, [user?.id]);

  const addToPlaylist = async (playlistId: string, song: Song) => {
    if (!playlistId) return;
    try {
      const playlist = playlists.find((item) => item.id === playlistId);
      const alreadyAdded = Boolean(playlist?.songIds.includes(song.id));
      if (alreadyAdded) {
        await playlistsApi.removeSong(playlistId, song.id);
        toast(`Removed from "${playlist?.name}"`, "info");
      } else {
        await playlistsApi.addSong(playlistId, song.id);
        toast(`Added to "${playlist?.name}"`, "success");
      }
      const refreshed = await playlistsApi.list({ owner: user?.id, page_size: 100 });
      setPlaylists(refreshed.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update playlist.");
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

  const singles = useMemo(() => songs.filter((song) => !song.albumId), [songs]);
  const albumSongs = useMemo(() => songs.filter((song) => song.albumId), [songs]);
  const allSinglesSection = singles.length ? singles : albumSongs;

  return (
    <main className="w-full px-4 md:px-8 lg:px-10 py-6 md:py-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Disc3 className="w-8 h-8 text-melora-purple" />
            <span>Music Catalog</span>
          </h1>
          <p className="text-xs md:text-sm text-melora-textSecondary mt-1">
            Explore studio albums, singles, and atmospheric recordings.
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="bg-melora-cardSurface border border-white/10 rounded-full px-4 py-2.5 text-xs text-white focus:outline-none focus:border-melora-purple/60 cursor-pointer"
          >
            <option value="releaseDate">Newest Releases</option>
            <option value="listeners">Most Listeners</option>
          </select>
        </div>
      </header>

      {/* Search Filter */}
      <div className="max-w-md">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Filter by song, album, or artist..."
          size="sm"
        />
      </div>

      {requestedPlaylist && (
        <div className="p-4 rounded-card border border-melora-pink/30 bg-melora-pink/10 text-xs text-pink-200">
          Select "Add to Playlist" on any song to link it to your playlist.
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-card bg-melora-error/15 border border-melora-error/30 text-xs text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-xs text-melora-textMuted flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-melora-purple animate-pulse" />
          <span>Loading catalog...</span>
        </div>
      ) : (
        <>
          {/* Albums Grid */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Albums & Collections
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/albums/${album.id}`}
                  className="glass-card rounded-card-lg p-3.5 group select-none block"
                >
                  <div className="aspect-square rounded-card bg-gradient-purple-glow overflow-hidden mb-3 border border-white/10 relative">
                    {album.coverUrl ? (
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Disc3 className="w-12 h-12 text-white/40" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-primary text-white flex items-center justify-center shadow-glow">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <p className="font-bold text-sm text-white truncate group-hover:text-melora-purple transition-colors">
                    {album.title}
                  </p>
                  <p className="text-xs text-melora-textSecondary truncate mt-0.5">
                    {album.artistName}
                  </p>
                  <p className="text-[11px] font-mono text-melora-textMuted mt-1">
                    {new Date(album.releaseDate).getFullYear()} • {album.songCount} tracks
                  </p>
                </Link>
              ))}

              {!albums.length && (
                <p className="col-span-full text-xs text-melora-textMuted py-4">
                  No albums matched your query.
                </p>
              )}
            </div>
          </section>

          {/* Singles & Tracks Table */}
          <section className="space-y-4 pt-4">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Tracks & Singles
            </h2>

            <div className="glass-panel rounded-card-lg p-2.5 space-y-1">
              {allSinglesSection.map((song, idx) => {
                const selected = requestedPlaylist || "";
                const inSelected = Boolean(
                  playlists.find((p) => p.id === selected)?.songIds.includes(song.id)
                );

                return (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-3 rounded-card hover:bg-white/6 transition-colors group select-none"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <button
                        onClick={() => playSong(song)}
                        className="w-11 h-11 rounded-lg bg-melora-cardElevated border border-white/10 overflow-hidden flex items-center justify-center shrink-0 relative group/play"
                      >
                        {song.coverUrl ? (
                          <img
                            src={song.coverUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Play className="w-4 h-4 fill-white opacity-70 group-hover/play:opacity-100" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => playSong(song)}
                          className="font-semibold text-sm text-white truncate block text-left group-hover:text-melora-purple transition-colors"
                        >
                          {song.title}
                        </button>
                        <div className="text-xs text-melora-textSecondary truncate mt-0.5">
                          <Link
                            href={`/artists/${song.artistId}`}
                            className="hover:text-white"
                          >
                            {song.artistName}
                          </Link>
                          {song.albumId && (
                            <>
                              {" • "}
                              <Link
                                href={`/albums/${song.albumId}`}
                                className="hover:text-white"
                              >
                                {song.albumTitle}
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="hidden lg:block text-xs font-mono text-melora-textMuted px-4">
                      {song.listeners !== null
                        ? `${song.listeners.toLocaleString()} listeners`
                        : ""}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <IconButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(song)}
                        tooltip="Download Offline (Silver/Gold)"
                      >
                        <Download className="w-4 h-4" />
                      </IconButton>

                      {playlists.length > 0 && (
                        <select
                          defaultValue={requestedPlaylist || ""}
                          onChange={(e) => {
                            const id = e.target.value;
                            if (id) addToPlaylist(id, song);
                            e.currentTarget.value = requestedPlaylist || "";
                          }}
                          className="max-w-[150px] bg-melora-cardSurface border border-white/10 rounded-full px-2.5 py-1 text-[11px] text-melora-textSecondary focus:outline-none focus:border-melora-purple cursor-pointer"
                        >
                          <option value="">+ Add to playlist…</option>
                          {playlists.map((pl) => (
                            <option key={pl.id} value={pl.id}>
                              {pl.songIds.includes(song.id) ? "✓ " : ""}
                              {pl.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}

              {!allSinglesSection.length && (
                <p className="p-6 text-xs text-melora-textMuted text-center">
                  No songs found in catalog.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}