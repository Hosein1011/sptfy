"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Edit3, ListMusic, Lock, Play, Plus, Trash2, X } from "lucide-react";
import { playlistsApi } from "../../../lib/api";
import { useAuthStore } from "../../../store/authStore";
import { usePlayerStore } from "../../../store/playerStore";
import { Playlist } from "../../../types";

const limitForTier = (tier?: string) => tier === "FREE" ? 6 : tier === "STANDARD" ? 100 : null;

export default function PlaylistsPage() {
  const user = useAuthStore((state) => state.user);
  const playSong = usePlayerStore((state) => state.playSong);
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [editing, setEditing] = useState<Playlist | null>(null);

  const limit = limitForTier(user?.tier);
  const canCreate = limit === null || playlists.length < limit;

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await playlistsApi.list({ owner: user.id, page_size: 100 });
      setPlaylists(response.results);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load playlists.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user?.id]);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      const created = await playlistsApi.create({ name: name.trim(), description: description.trim(), is_public: isPublic });
      setPlaylists((items) => [created, ...items]);
      setName(""); setDescription(""); setIsPublic(true); setShowCreate(false); setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not create playlist."); }
  };

  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    try {
      const updated = await playlistsApi.update(editing.id, { name: editing.name, description: editing.description, is_public: editing.is_public });
      setPlaylists((items) => items.map((item) => item.id === updated.id ? updated : item));
      setEditing(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update playlist."); }
  };

  const removePlaylist = async (playlist: Playlist) => {
    if (!window.confirm(`Delete “${playlist.name}”?`)) return;
    try { await playlistsApi.remove(playlist.id); setPlaylists((items) => items.filter((item) => item.id !== playlist.id)); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not delete playlist."); }
  };

  const removeSong = async (playlistId: string, songId: string) => {
    try {
      await playlistsApi.removeSong(playlistId, songId);
      setPlaylists((items) => items.map((p) => p.id === playlistId ? { ...p, songIds: p.songIds.filter((id) => id !== songId), tracks: (p.tracks || []).filter((song) => song.id !== songId), trackCount: Math.max(0, (p.trackCount || 1) - 1) } : p));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not remove song."); }
  };

  const playPlaylist = (playlist: Playlist) => {
    const tracks = playlist.tracks || [];
    if (!tracks.length) return;
    tracks.slice(1).forEach(addToQueue);
    playSong(tracks[0]);
  };

  const empty = useMemo(() => !loading && playlists.length === 0, [loading, playlists.length]);

  return (
    <main className="flex-1 w-full p-6 md:p-10 pb-32 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div><h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3"><ListMusic className="w-8 h-8 text-melora-pink" />Your Playlists</h1><p className="text-melora-textSecondary mt-2">{limit === null ? "Unlimited playlists" : `${playlists.length} / ${limit} playlists on your plan`}</p></div>
        <button onClick={() => setShowCreate(true)} disabled={!canCreate} className="px-5 py-3 rounded-xl bg-gradient-01 font-semibold flex items-center justify-center gap-2 disabled:opacity-40"><Plus className="w-5 h-5" /> Create Playlist</button>
      </header>

      {error && <p className="mb-5 text-sm text-red-300">{error}</p>}
      {loading ? <div className="py-20 text-center text-melora-textMuted">Loading playlists...</div> : empty ? (
        <section className="rounded-3xl border border-dashed border-white/10 p-14 text-center"><ListMusic className="w-14 h-14 mx-auto text-melora-textMuted mb-4" /><h2 className="text-2xl font-bold">No playlists yet</h2><p className="text-melora-textSecondary mt-2">Create your first playlist, then add songs from Albums & Singles.</p><button onClick={() => setShowCreate(true)} className="mt-6 px-6 py-3 rounded-xl bg-gradient-01 font-semibold">Create First Playlist</button></section>
      ) : (
        <div className="space-y-5">
          {playlists.map((playlist) => (
            <section key={playlist.id} className="rounded-3xl bg-melora-surfaceLayer/30 border border-white/5 p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0"><div className="w-20 h-20 rounded-xl bg-gradient-02 overflow-hidden flex items-center justify-center shrink-0">{playlist.coverUrl ? <img src={playlist.coverUrl} alt="" className="w-full h-full object-cover" /> : <ListMusic className="w-8 h-8 text-white/50" />}</div><div className="min-w-0"><h2 className="text-xl font-bold truncate">{playlist.name}</h2><p className="text-sm text-melora-textMuted">{playlist.trackCount ?? playlist.tracks?.length ?? 0} tracks • {playlist.is_public ? "Public" : "Private"}</p>{playlist.description && <p className="text-sm text-melora-textSecondary mt-1 line-clamp-2">{playlist.description}</p>}</div></div>
                <div className="flex flex-wrap gap-2"><button onClick={() => playPlaylist(playlist)} disabled={!playlist.tracks?.length} className="px-4 py-2 rounded-xl bg-melora-pink/90 font-semibold flex gap-2 items-center disabled:opacity-30"><Play className="w-4 h-4 fill-white" /> Play</button><Link href={`/albums?playlist=${playlist.id}`} className="px-4 py-2 rounded-xl border border-white/10 flex gap-2 items-center"><Plus className="w-4 h-4" /> Add Songs</Link><button onClick={() => setEditing({ ...playlist })} className="p-2 rounded-xl border border-white/10"><Edit3 className="w-4 h-4" /></button><button onClick={() => removePlaylist(playlist)} className="p-2 rounded-xl border border-white/10 hover:text-red-300"><Trash2 className="w-4 h-4" /></button></div>
              </div>

              <div className="mt-5 border-t border-white/5 pt-3">
                {playlist.tracks?.length ? playlist.tracks.map((song, index) => <div key={song.id} className="grid grid-cols-[28px_1fr_auto] gap-3 items-center p-2 rounded-lg hover:bg-white/5"><span className="text-xs text-melora-textMuted text-center">{index + 1}</span><button onClick={() => playSong(song)} className="text-left min-w-0"><p className="font-medium truncate">{song.title}</p><p className="text-xs text-melora-textMuted truncate">{song.artistName}</p></button><button onClick={() => removeSong(playlist.id, song.id)} className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:text-red-300">Remove</button></div>) : <div className="py-4 text-sm text-melora-textMuted flex items-center gap-2"><Lock className="w-4 h-4" />This playlist is empty. Add songs to start listening.</div>}
              </div>
            </section>
          ))}
        </div>
      )}

      {showCreate && <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"><form onSubmit={create} className="w-full max-w-lg rounded-3xl bg-melora-surfaceLayer border border-white/10 p-7 space-y-4"><div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Create Playlist</h2><button type="button" onClick={() => setShowCreate(false)}><X className="w-5 h-5" /></button></div><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Playlist name" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3" /><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={3} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3" /><label className="flex items-center gap-2 text-sm text-melora-textSecondary"><input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} /> Public playlist</label><button className="w-full py-3 rounded-xl bg-gradient-01 font-semibold">Create</button></form></div>}

      {editing && <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"><form onSubmit={saveEdit} className="w-full max-w-lg rounded-3xl bg-melora-surfaceLayer border border-white/10 p-7 space-y-4"><div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Edit Playlist</h2><button type="button" onClick={() => setEditing(null)}><X className="w-5 h-5" /></button></div><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3" /><textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3" /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(editing.is_public)} onChange={(e) => setEditing({ ...editing, is_public: e.target.checked })} /> Public playlist</label><button className="w-full py-3 rounded-xl bg-gradient-01 font-semibold">Save</button></form></div>}
    </main>
  );
}
