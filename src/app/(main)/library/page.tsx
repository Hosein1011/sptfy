"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Library,
  ListMusic,
  Disc3,
  Heart,
  Download,
  Plus,
  LayoutGrid,
  List,
  Rows3,
  Play,
  ArrowUpDown,
  Music,
  Trash2,
} from "lucide-react";
import { playlistsApi, songsApi, albumsApi } from "../../../lib/api";
import { useAuthStore } from "../../../store/authStore";
import { usePlayerStore } from "../../../store/playerStore";
import { Playlist, Song, Album } from "../../../types";
import Button from "../../../components/common/Button";
import IconButton from "../../../components/ui/IconButton";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import EmptyState from "../../../components/ui/EmptyState";
import { useToast } from "../../../components/ui/ToastProvider";

type LibraryTab = "playlists" | "liked" | "albums" | "downloads";
type ViewMode = "grid" | "list" | "compact";
type SortOption = "recent" | "alpha" | "tracks";

export default function LibraryPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as LibraryTab) || "playlists";

  const [activeTab, setActiveTab] = useState<LibraryTab>(initialTab);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  // Create playlist modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { user } = useAuthStore();
  const { playSong, addToQueue, currentSong, isPlaying } = usePlayerStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    Promise.all([
      playlistsApi.list({ owner: user.id, page_size: 50 }).catch(() => ({ results: [] })),
      songsApi.list({ page_size: 50 }).catch(() => ({ results: [] })),
      albumsApi.list({ page_size: 50 }).catch(() => ({ results: [] })),
    ])
      .then(([plRes, songRes, albRes]) => {
        setPlaylists(plRes.results);
        setLikedSongs(songRes.results.filter((s) => s.isLiked));
        setAlbums(albRes.results);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    setIsCreating(true);

    try {
      const created = await playlistsApi.create({
        name: newPlaylistName.trim(),
        description: newPlaylistDesc.trim(),
        is_public: true,
      });
      setPlaylists((prev) => [created, ...prev]);
      setNewPlaylistName("");
      setNewPlaylistDesc("");
      setIsCreateOpen(false);
      toast("Playlist created successfully!", "success");
    } catch {
      toast("Could not create playlist", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const playPlaylist = (pl: Playlist) => {
    const tracks = pl.tracks || [];
    if (!tracks.length) return;
    tracks.slice(1).forEach(addToQueue);
    playSong(tracks[0]);
    toast(`Playing "${pl.name}"`, "info");
  };

  return (
    <main className="w-full px-4 md:px-8 lg:px-10 py-6 md:py-8 max-w-7xl mx-auto space-y-8">
      {/* Library Top Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Library className="w-8 h-8 text-melora-purple" />
            <span>Your Library</span>
          </h1>
          <p className="text-xs md:text-sm text-melora-textSecondary mt-1">
            Manage your personal playlists, liked melodies, and saved releases.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateOpen(true)}
          className="rounded-full shadow-glow"
        >
          Create Playlist
        </Button>
      </section>

      {/* Tabs & View Controls Bar */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/6 pb-4">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "playlists", label: "Playlists", count: playlists.length, icon: ListMusic },
            { id: "liked", label: "Liked Songs", count: likedSongs.length, icon: Heart },
            { id: "albums", label: "Albums", count: albums.length, icon: Disc3 },
            { id: "downloads", label: "Downloads", count: 0, icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as LibraryTab)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all select-none shrink-0
                  ${
                    active
                      ? "bg-gradient-primary text-white shadow-glow"
                      : "bg-melora-cardSurface/60 text-melora-textSecondary hover:text-white hover:bg-melora-surfaceHover"
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({tab.count})</span>
              </button>
            );
          })}
        </div>

        {/* View Mode & Sort Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-white/6 p-1 rounded-btn flex border border-white/8">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-white/15 text-white" : "text-melora-textMuted hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-white/15 text-white" : "text-melora-textMuted hover:text-white"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("compact")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "compact" ? "bg-white/15 text-white" : "text-melora-textMuted hover:text-white"
              }`}
              title="Compact View"
            >
              <Rows3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area based on Active Tab */}
      {activeTab === "playlists" && (
        <section>
          {playlists.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    className="glass-card rounded-card-lg p-3.5 group select-none flex flex-col justify-between"
                  >
                    <Link href={`/playlists`}>
                      <div className="aspect-square rounded-card bg-gradient-sunset overflow-hidden mb-3 border border-white/10 relative">
                        {pl.coverUrl ? (
                          <img src={pl.coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <ListMusic className="w-12 h-12 text-white/40 m-auto mt-12" />
                        )}

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            playPlaylist(pl);
                          }}
                          className="absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full bg-gradient-primary text-white flex items-center justify-center shadow-glow opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </button>
                      </div>
                      <p className="font-bold text-sm text-white truncate group-hover:text-melora-purple">
                        {pl.name}
                      </p>
                      <p className="text-xs text-melora-textSecondary truncate mt-0.5">
                        {pl.trackCount ?? pl.tracks?.length ?? 0} songs
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel rounded-card-lg p-2 space-y-1">
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    className="flex items-center justify-between p-3 rounded-card hover:bg-white/6 transition-colors group"
                  >
                    <Link href="/playlists" className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-lg bg-gradient-sunset flex items-center justify-center shrink-0">
                        <ListMusic className="w-5 h-5 text-white/60" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-white truncate">{pl.name}</p>
                        <p className="text-xs text-melora-textSecondary truncate">{pl.description || "Personal Playlist"}</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => playPlaylist(pl)}
                      className="p-2 rounded-full hover:bg-white/10 text-melora-purple"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            <EmptyState
              title="No playlists yet"
              description="Create your first playlist to organize melodies that fit your life."
              actionLabel="Create Playlist"
              onAction={() => setIsCreateOpen(true)}
            />
          )}
        </section>
      )}

      {activeTab === "liked" && (
        <section>
          {likedSongs.length > 0 ? (
            <div className="glass-panel rounded-card-lg p-2.5 space-y-1">
              {likedSongs.map((song, idx) => (
                <div
                  key={song.id}
                  onClick={() => playSong(song)}
                  className="flex items-center justify-between p-3 rounded-card hover:bg-white/6 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-xs font-mono text-melora-textMuted">{idx + 1}</span>
                    <div className="w-10 h-10 rounded-lg bg-melora-cardElevated overflow-hidden shrink-0">
                      {song.coverUrl ? <img src={song.coverUrl} alt="" className="w-full h-full object-cover" /> : <Music className="w-4 h-4 text-white/40 m-auto mt-3" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-white truncate">{song.title}</p>
                      <p className="text-xs text-melora-textSecondary truncate">{song.artistName}</p>
                    </div>
                  </div>
                  <Heart className="w-4 h-4 text-melora-pink fill-current" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No liked songs yet"
              description="Tap the heart on any song you feel to save it to your personal favorites."
              actionLabel="Explore Trending Melodies"
              onAction={() => {}}
            />
          )}
        </section>
      )}

      {activeTab === "albums" && (
        <section>
          {albums.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/albums/${album.id}`}
                  className="glass-card rounded-card-lg p-3 group block select-none"
                >
                  <div className="aspect-square rounded-card bg-gradient-purple-glow overflow-hidden mb-2.5 relative">
                    {album.coverUrl ? (
                      <img src={album.coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <Disc3 className="w-10 h-10 text-white/40 m-auto mt-10" />
                    )}
                  </div>
                  <p className="font-bold text-sm text-white truncate group-hover:text-melora-purple">{album.title}</p>
                  <p className="text-xs text-melora-textSecondary truncate">{album.artistName}</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No albums saved"
              description="Save your favorite albums for quick access anytime."
            />
          )}
        </section>
      )}

      {activeTab === "downloads" && (
        <EmptyState
          icon={<Download className="w-6 h-6 text-melora-purple" />}
          title="Downloads & Offline Melodies"
          description="Download high-resolution music for offline listening with your Silver or Gold membership."
        />
      )}

      {/* Create Playlist Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Playlist"
        description="Craft a personalized sound collection for your favorite moments."
      >
        <form onSubmit={handleCreatePlaylist} className="space-y-4">
          <Input
            label="Playlist Title"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="e.g. Midnight Ambient Waves"
            required
            autoFocus
          />

          <Input
            label="Description (Optional)"
            value={newPlaylistDesc}
            onChange={(e) => setNewPlaylistDesc(e.target.value)}
            placeholder="Give your playlist an emotional vibe..."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/6">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isCreating}
              className="rounded-full shadow-glow"
            >
              Create Playlist
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
