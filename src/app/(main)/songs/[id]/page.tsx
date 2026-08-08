"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Heart, Play } from "lucide-react";
import { songsApi } from "../../../../lib/api";
import { usePlayerStore } from "../../../../store/playerStore";
import { Song } from "../../../../types";

export default function SongDetailPage() {
  const params = useParams<{ id: string }>();
  const playSong = usePlayerStore((state) => state.playSong);
  const [song, setSong] = useState<Song | null>(null);
  const [liked, setLiked] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { songsApi.get(params.id).then((data) => { setSong(data); setLiked(Boolean(data.isLiked)); }).catch((e) => setError(e instanceof Error ? e.message : "Song not found.")); }, [params.id]);
  const toggleLike = async () => { if (!song) return; try { if (liked) await songsApi.unlike(song.id); else await songsApi.like(song.id); setLiked(!liked); } catch (e) { setError(e instanceof Error ? e.message : "Could not update like."); } };
  if (error && !song) return <main className="flex-1 p-10 text-red-300">{error}</main>;
  if (!song) return <main className="flex-1 p-10 text-melora-textMuted">Loading song...</main>;
  return <main className="flex-1 p-6 md:p-10 pb-32 max-w-6xl mx-auto"><section className="rounded-3xl border border-white/5 bg-melora-surfaceLayer/30 p-7 md:p-10 flex flex-col md:flex-row gap-8 items-center"><div className="w-56 h-56 rounded-card bg-gradient-01 overflow-hidden flex items-center justify-center">{song.coverUrl ? <img src={song.coverUrl} alt="" className="w-full h-full object-cover" /> : <Play className="w-14 h-14 text-white/40" />}</div><div className="flex-1 text-center md:text-left"><p className="text-xs uppercase tracking-widest text-melora-textMuted">Song</p><h1 className="text-4xl md:text-6xl font-bold mt-2">{song.title}</h1><p className="mt-3 text-melora-textSecondary"><Link href={`/artists/${song.artistId}`} className="text-white font-semibold hover:underline">{song.artistName}</Link>{song.albumId && <> • <Link href={`/albums/${song.albumId}`} className="hover:text-white">{song.albumTitle}</Link></>}</p><p className="mt-2 text-sm text-melora-textMuted">Released {song.releaseDate}{song.genre ? ` • ${song.genre}` : ""}</p>{song.listeners !== null && <p className="mt-4 text-sm"><b>{song.listeners.toLocaleString()}</b> listeners {song.streams !== null && song.streams !== undefined ? `• ${song.streams.toLocaleString()} streams` : ""}</p>}<div className="mt-6 flex justify-center md:justify-start gap-3"><button onClick={() => playSong(song)} className="px-6 py-3 rounded-xl bg-gradient-01 font-semibold flex gap-2 items-center"><Play className="w-5 h-5 fill-white" /> Play</button><button onClick={toggleLike} className={`w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center ${liked ? "text-melora-pink" : ""}`}><Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} /></button></div></div></section>{error && <p className="mt-5 text-sm text-red-300">{error}</p>}{song.lyrics && <section className="mt-8 rounded-2xl border border-white/5 bg-melora-surfaceLayer/20 p-6"><h2 className="text-2xl font-bold mb-5">Lyrics</h2><p className="whitespace-pre-line text-melora-textSecondary leading-8">{song.lyrics}</p></section>}</main>;
}
