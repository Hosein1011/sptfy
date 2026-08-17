"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Edit3,
  ListMusic,
  Lock,
  Play,
  Plus,
  Trash2,
  X,
  Music,
  Sparkles,
} from "lucide-react";
import { playlistsApi } from "../../../lib/api";
import { useAuthStore } from "../../../store/authStore";
import { usePlayerStore } from "../../../store/playerStore";
import { Playlist, Song } from "../../../types";
import Button from "../../../components/common/Button";
import IconButton from "../../../components/ui/IconButton";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import EmptyState from "../../../components/ui/EmptyState";
import { useToast } from "../../../components/ui/ToastProvider";

const limitForTier = (tier?: string) =>
  tier === "FREE" ? 6 : tier === "STANDARD" ? 100 : null;

export default function PlaylistsPage() {
  const user = useAuthStore((state) => state.user);
  const playSong = usePlayerStore((state) => state.playSong);
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const { toast } = useToast();

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      const created = await playlistsApi.create({
        name: name.trim(),
        description: description.trim(),
        is_public: isPublic,
      });
      setPlaylists((items) => [created, ...items]);
      setName("");
      setDescription("");
      setIsPublic(true);
      setShowCreate(false);
      setError("");
      toast("Playlist created!", "success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create playlist.");
      toast("Could not create playlist", "error");
    }
  };

  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    try {
      const updated = await playlistsApi.update(editing.id, {
        name: editing.name,
        description: editing.description,
        is_public: editing.is_public,
      });
      setPlaylists((items) =>
        items.map((item) => (item.id === updated.id ? updated : item))
      );
      setEditing(null);
      toast("Playlist updated", "success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update playlist.");
    }
  };

  const removePlaylist = async (playlist: Playlist) => {
    if (!window.confirm(`Delete “${playlist.name}”?`)) return;
    try {
      await playlistsApi.remove(playlist.id);
      setPlaylists((items) => items.filter((item) => item.id !== playlist.id));
      toast("Playlist deleted", "info");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete playlist.");
    }
  };

  const removeSong = async (playlistId: string, songId: string) => {
    try {
      await playlistsApi.removeSong(playlistId, songId);
      setPlaylists((items) =>
        items.map((p) =>
          p.id === playlistId
            ? {
                ...p,
                songIds: p.songIds.filter((id) => id !== songId),
                tracks: (p.tracks || []).filter((song) => song.id !== songId),
                trackCount: Math.max(0, (p.trackCount || 1) - 1),
              }
            : p
        )
      );
      toast("Song removed from playlist", "info");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove song.");
    }
  };

  const playPlaylist = (playlist: Playlist) => {
    const tracks = playlist.tracks || [];
    if (!tracks.length) return;
    tracks.slice(1).forEach(addToQueue);
    playSong(tracks[0]);
    toast(`Playing "${playlist.name}"`, "info");
  };

  const empty = useMemo(
    () => !loading && playlists.length === 0,
    [loading, playlists.length]
  );

  return (
    <main className="w-full px-4 md:px-8 lg:px-10 py-6 md:py-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ListMusic className="w-8 h-8 text-melora-pink" />
            <span>Your Playlists</span>
          </h1>
          <p className="text-xs md:text-sm text-melora-textSecondary mt-1">
            {limit === null
              ? "Unlimited playlists on your Gold account"
              : `${playlists.length} of ${limit} playlists created`}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowCreate(true)}
          disabled={!canCreate}
          className="rounded-full shadow-glow"
        >
          Create Playlist
        </Button>
      </header>

      {error && (
        <div className="p-3.5 rounded-card bg-melora-error/15 border border-melora-error/30 text-xs text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-xs text-melora-textMuted flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-melora-purple animate-pulse" />
          <span>Loading playlists...</span>
        </div>
      ) : empty ? (
        <EmptyState
          title="No playlists yet"
          description="Create your first playlist and start curating your soundtrack."
          actionLabel="Create First Playlist"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="space-y-6">
          {playlists.map((playlist) => (
            <section
              key={playlist.id}
              className="rounded-panel glass-panel border border-white/8 p-5 md:p-7 shadow-soft-md"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-20 h-20 rounded-card bg-gradient-sunset overflow-hidden flex items-center justify-center shrink-0 border border-white/10 shadow-soft-sm">
                    {playlist.coverUrl ? (
                      <img
                        src={playlist.coverUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ListMusic className="w-8 h-8 text-white/60" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-white truncate">
                      {playlist.name}
                    </h2>
                    <p className="text-xs text-melora-textSecondary mt-0.5">
                      {playlist.trackCount ?? playlist.tracks?.length ?? 0} tracks •{" "}
                      {playlist.is_public ? "Public" : "Private"}
                    </p>
                    {playlist.description && (
                      <p className="text-xs text-melora-textMuted mt-1 line-clamp-2">
                        {playlist.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                    onClick={() => playPlaylist(playlist)}
                    disabled={!playlist.tracks?.length}
                    className="rounded-full shadow-glow"
                  >
                    Play
                  </Button>

                  <Link href={`/albums?playlist=${playlist.id}`}>
                    <Button variant="secondary" size="sm" className="rounded-full">
                      Add Songs
                    </Button>
                  </Link>

                  <IconButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditing({ ...playlist })}
                    tooltip="Edit Playlist"
                  >
                    <Edit3 className="w-4 h-4" />
                  </IconButton>

                  <IconButton
                    variant="secondary"
                    size="sm"
                    onClick={() => removePlaylist(playlist)}
                    tooltip="Delete Playlist"
                    className="hover:text-melora-error hover:border-melora-error/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </div>
              </div>

              {/* Playlist Tracks List */}
              <div className="mt-6 border-t border-white/6 pt-4 space-y-1">
                {playlist.tracks?.length ? (
                  playlist.tracks.map((song, index) => (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-2.5 rounded-card hover:bg-white/6 transition-colors group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <span className="text-xs font-mono text-melora-textMuted w-5 text-center">
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
                            {song.artistName}
                          </p>
                        </button>
                      </div>

                      <button
                        onClick={() => removeSong(playlist.id, song.id)}
                        className="text-xs px-3 py-1 rounded-full text-melora-textMuted hover:text-melora-error hover:bg-melora-error/10 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-xs text-melora-textMuted flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>This playlist is empty. Add songs from your catalog.</span>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Playlist"
        description="Craft a soundtrack for your vibe."
      >
        <form onSubmit={create} className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Playlist name"
            required
            autoFocus
          />

          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />

          <label className="flex items-center gap-2.5 text-xs text-melora-textSecondary cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="accent-purple-500 rounded"
            />
            <span>Make playlist public</span>
          </label>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="rounded-full shadow-glow">
              Create
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit Playlist"
      >
        {editing && (
          <form onSubmit={saveEdit} className="space-y-4">
            <Input
              label="Name"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              required
            />

            <Input
              label="Description"
              value={editing.description || ""}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
            />

            <label className="flex items-center gap-2.5 text-xs text-melora-textSecondary cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(editing.is_public)}
                onChange={(e) =>
                  setEditing({ ...editing, is_public: e.target.checked })
                }
                className="accent-purple-500 rounded"
              />
              <span>Public playlist</span>
            </label>

            <div className="flex justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="rounded-full shadow-glow">
                Save
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </main>
  );
}
