"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Disc3, Play, Shuffle } from "lucide-react";
import { albumsApi, playlistsApi } from "../../../../lib/api";
import { useAuthStore } from "../../../../store/authStore";
import { usePlayerStore } from "../../../../store/playerStore";
import { Album, Playlist, Song } from "../../../../types";

const fmt = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export default function AlbumDetailPage() {
  const params = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const playSong = usePlayerStore((state) => state.playSong);
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const [album, setAlbum] = useState<Album | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [error, setError] = useState("");

  useEffect(() => { albumsApi.get(params.id).then(setAlbum).catch((e) => setError(e instanceof Error ? e.message : "Album not found.")); }, [params.id]);
  useEffect(() => { if (user) playlistsApi.list({ owner: user.id, page_size: 100 }).then((r) => setPlaylists(r.results)).catch(() => {}); }, [user?.id]);

  const playAll = (shuffle = false) => {
    if (!album?.tracks.length) return;
    const tracks = shuffle ? [...album.tracks].sort(() => Math.random() - 0.5) : album.tracks;
    tracks.slice(1).forEach(addToQueue);
    playSong(tracks[0]);
  };
  const addToPlaylist = async (playlistId: string, song: Song) => {
    if (!playlistId) return;
    try { await playlistsApi.addSong(playlistId, song.id); const r = await playlistsApi.list({ owner: user?.id, page_size: 100 }); setPlaylists(r.results); } catch (e) { setError(e instanceof Error ? e.message : "Could not add song."); }
  };

  if (error && !album) return <main className="flex-1 p-10 text-red-300">{error}</main>;
  if (!album) return <main className="flex-1 p-10 text-melora-textMuted">Loading album...</main>;

  return <main className="flex-1 pb-32">
    <section className="max-w-7xl mx-auto p-6 md:p-10 pt-14 flex flex-col md:flex-row items-center md:items-end gap-8">
      <div className="w-52 h-52 md:w-64 md:h-64 rounded-card bg-gradient-03 overflow-hidden shadow-glow shrink-0">{album.coverUrl ? <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Disc3 className="w-16 h-16 text-white/40" /></div>}</div>
      <div className="flex-1 text-center md:text-left"><p className="text-xs uppercase tracking-widest text-melora-textMuted">Album</p><h1 className="text-4xl md:text-6xl font-bold mt-2">{album.title}</h1><p className="mt-3 text-melora-textSecondary"><Link href={`/artists/${album.artistId}`} className="text-white font-semibold hover:underline">{album.artistName}</Link> • {new Date(album.releaseDate).getFullYear()} • {album.songCount} songs • {Math.floor(album.totalDuration / 60)} min</p><div className="mt-6 flex justify-center md:justify-start gap-3"><button onClick={() => playAll(false)} className="px-6 py-3 rounded-xl bg-gradient-01 font-semibold flex gap-2 items-center"><Play className="w-5 h-5 fill-white" /> Play</button><button onClick={() => playAll(true)} className="px-5 py-3 rounded-xl border border-white/10 flex gap-2 items-center"><Shuffle className="w-5 h-5" /> Shuffle</button></div></div>
    </section>
    {error && <p className="max-w-7xl mx-auto px-6 md:px-10 text-sm text-red-300">{error}</p>}
    <section className="max-w-7xl mx-auto px-6 md:px-10 mt-8 rounded-2xl">
      <div className="divide-y divide-white/5 border border-white/5 rounded-2xl overflow-hidden bg-melora-surfaceLayer/20">{album.tracks.map((song, index) => <div key={song.id} className="p-4 grid grid-cols-[28px_1fr_auto] gap-3 items-center hover:bg-white/5"><span className="text-sm text-melora-textMuted">{index + 1}</span><button onClick={() => playSong(song)} className="text-left min-w-0"><p className="font-semibold truncate">{song.title}</p><p className="text-xs text-melora-textMuted">{song.genre || album.genre || "Music"}</p></button><div className="flex items-center gap-4"><span className="text-sm text-melora-textMuted">{fmt(song.duration)}</span>{playlists.length > 0 && <select defaultValue="" onChange={(e) => { addToPlaylist(e.target.value, song); e.currentTarget.value = ""; }} className="bg-melora-bgPrimary border border-white/10 rounded-lg px-2 py-2 text-xs"><option value="">Add to playlist…</option>{playlists.map((p) => <option key={p.id} value={p.id} disabled={p.songIds.includes(song.id)}>{p.songIds.includes(song.id) ? "✓ " : ""}{p.name}</option>)}</select>}</div></div>)}</div>
    </section>
  </main>;
}
