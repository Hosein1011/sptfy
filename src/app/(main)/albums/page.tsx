"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Disc3, ListPlus, Play, Search } from "lucide-react";
import { albumsApi, playlistsApi, songsApi } from "../../../lib/api";
import { useAuthStore } from "../../../store/authStore";
import { usePlayerStore } from "../../../store/playerStore";
import { Album, Playlist, Song } from "../../../types";

type SortBy = "releaseDate" | "listeners";

export default function AlbumsPage() {
  const [requestedPlaylist, setRequestedPlaylist] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const playSong = usePlayerStore((state) => state.playSong);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("releaseDate");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setRequestedPlaylist(new URLSearchParams(window.location.search).get("playlist"));
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
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(loadMusic, 250);
    return () => clearTimeout(timer);
  }, [query, sortBy]);

  useEffect(() => {
    if (!user) return;
    playlistsApi.list({ owner: user.id, page_size: 100 }).then((response) => setPlaylists(response.results)).catch(() => {});
  }, [user?.id]);

  const addToPlaylist = async (playlistId: string, song: Song) => {
    if (!playlistId) return;
    try {
      const playlist = playlists.find((item) => item.id === playlistId);
      const alreadyAdded = Boolean(playlist?.songIds.includes(song.id));
      if (alreadyAdded) {
        await playlistsApi.removeSong(playlistId, song.id);
      } else {
        await playlistsApi.addSong(playlistId, song.id);
      }
      const refreshed = await playlistsApi.list({ owner: user?.id, page_size: 100 });
      setPlaylists(refreshed.results);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update playlist."); }
  };

  const singles = useMemo(() => songs.filter((song) => !song.albumId), [songs]);
  const albumSongs = useMemo(() => songs.filter((song) => song.albumId), [songs]);
  const allSinglesSection = singles.length ? singles : albumSongs;

  return (
    <main className="flex-1 w-full p-6 md:p-10 pb-32 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3"><Disc3 className="w-8 h-8 text-melora-purple" />Albums & Singles</h1>
        <p className="text-melora-textSecondary mt-2">Search by song, album, or artist. Sort the catalog by listeners or release date.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 mb-8">
        <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-melora-textMuted" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search song, album, or artist..." className="w-full bg-melora-surfaceLayer/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-melora-purple" /></div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="bg-melora-bgPrimary border border-white/10 rounded-xl px-4 py-3"><option value="releaseDate">Newest releases</option><option value="listeners">Most listeners</option></select>
      </div>

      {requestedPlaylist && <div className="mb-6 rounded-xl border border-melora-pink/20 bg-melora-pink/5 px-4 py-3 text-sm">Choose “Add/Remove” on a song to update the selected playlist.</div>}
      {error && <p className="mb-5 text-sm text-red-300">{error}</p>}
      {loading ? <div className="py-16 text-center text-melora-textMuted">Loading catalog...</div> : <>
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-5">Albums</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {albums.map((album) => <article key={album.id} className="group min-w-0"><Link href={`/albums/${album.id}`} className="block"><div className="aspect-square rounded-card bg-gradient-03 overflow-hidden mb-3 group-hover:-translate-y-1 transition-transform">{album.coverUrl ? <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Disc3 className="w-12 h-12 text-white/40" /></div>}</div><p className="font-bold truncate hover:underline">{album.title}</p></Link><Link href={`/artists/${album.artistId}`} className="text-sm text-melora-textSecondary truncate block hover:text-white hover:underline">{album.artistName}</Link><p className="text-xs text-melora-textMuted">{new Date(album.releaseDate).getFullYear()} • {album.songCount} songs</p></article>)}
            {!albums.length && <p className="col-span-full text-melora-textMuted">No albums matched your search.</p>}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-5">Singles & Tracks</h2>
          <div className="rounded-2xl border border-white/5 bg-melora-surfaceLayer/20 divide-y divide-white/5">
            {allSinglesSection.map((song) => {
              const selected = requestedPlaylist || "";
              const inSelected = Boolean(playlists.find((p) => p.id === selected)?.songIds.includes(song.id));
              return <div key={song.id} className="p-4 flex items-center gap-4 group">
                <button onClick={() => playSong(song)} className="w-12 h-12 rounded-lg bg-gradient-01 overflow-hidden flex items-center justify-center shrink-0">{song.coverUrl ? <img src={song.coverUrl} alt="" className="w-full h-full object-cover" /> : <Play className="w-4 h-4 fill-white" />}</button>
                <div className="flex-1 min-w-0"><button onClick={() => playSong(song)} className="font-semibold truncate block text-left w-full">{song.title}</button><div className="text-sm text-melora-textMuted truncate"><Link href={`/artists/${song.artistId}`} className="hover:text-white">{song.artistName}</Link>{song.albumId && <> • <Link href={`/albums/${song.albumId}`} className="hover:text-white">{song.albumTitle}</Link></>}</div></div>
                <div className="hidden lg:block text-sm text-melora-textMuted">{song.listeners !== null ? `${song.listeners.toLocaleString()} listeners` : ""}</div>
                {playlists.length > 0 && <div className="flex items-center gap-2"><ListPlus className="w-4 h-4 text-melora-textMuted hidden sm:block" /><select defaultValue={requestedPlaylist || ""} onChange={(e) => { const id = e.target.value; if (id) addToPlaylist(id, song); e.currentTarget.value = requestedPlaylist || ""; }} className="max-w-[170px] bg-melora-bgPrimary border border-white/10 rounded-lg px-2 py-2 text-xs"><option value="">Add/remove playlist…</option>{playlists.map((playlist) => <option key={playlist.id} value={playlist.id}>{playlist.songIds.includes(song.id) ? "✓ " : ""}{playlist.name}</option>)}</select>{requestedPlaylist && <button onClick={() => addToPlaylist(requestedPlaylist, song)} className="text-xs px-3 py-2 rounded-lg border border-white/10">{inSelected ? "Remove" : "Add"}</button>}</div>}
              </div>;
            })}
            {!allSinglesSection.length && <p className="p-8 text-melora-textMuted">No songs matched your search.</p>}
          </div>
        </section>
      </>}
    </main>
  );
}
