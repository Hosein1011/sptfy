"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BadgeCheck,
  Disc3,
  Heart,
  Play,
  UserCheck,
  UserPlus,
  Users,
  Sparkles,
  Music,
} from "lucide-react";
import { albumsApi, songsApi, usersApi } from "../../../../lib/api";
import { useAuthStore } from "../../../../store/authStore";
import { usePlayerStore } from "../../../../store/playerStore";
import { Album, Song, User } from "../../../../types";
import Button from "../../../../components/common/Button";
import IconButton from "../../../../components/ui/IconButton";
import { useToast } from "../../../../components/ui/ToastProvider";

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function ArtistProfilePage() {
  const params = useParams<{ id: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const playSong = usePlayerStore((state) => state.playSong);
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const { toast } = useToast();

  const [artist, setArtist] = useState<User | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      usersApi.get(params.id),
      songsApi.list({ artist: params.id, sortBy: "listeners", page_size: 100 }),
      albumsApi.list({ artist: params.id, sortBy: "releaseDate", page_size: 100 }),
    ])
      .then(([artistData, songData, albumData]) => {
        if (cancelled) return;
        if (artistData.role !== "ARTIST") {
          throw new Error("This profile is not an artist account.");
        }
        setArtist(artistData);
        setSongs(songData.results);
        setAlbums(albumData.results);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Could not load artist."));
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const following = Boolean(currentUser?.followingIds?.includes(params.id));
  const singles = useMemo(() => songs.filter((song) => !song.albumId), [songs]);

  const toggleFollow = async () => {
    if (!currentUser || !artist || currentUser.id === artist.id) return;
    try {
      if (following) {
        await usersApi.unfollow(artist.id);
        toast(`Unfollowed ${artist.name}`, "info");
      } else {
        await usersApi.follow(artist.id);
        toast(`Following ${artist.name}!`, "heart");
      }
      const currentFollowingIds = Array.isArray(currentUser.followingIds)
        ? currentUser.followingIds
        : [];
      setUser({
        ...currentUser,
        followingIds: following
          ? currentFollowingIds.filter((id) => id !== artist.id)
          : [...currentFollowingIds, artist.id],
      });
      setArtist({
        ...artist,
        followerCount: Math.max(0, (artist.followerCount || 0) + (following ? -1 : 1)),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update follow state.");
    }
  };

  const playAll = () => {
    if (!songs.length) return;
    songs.slice(1).forEach(addToQueue);
    playSong(songs[0]);
    toast(`Playing top tracks by ${artist?.name}`, "info");
  };

  if (error && !artist) {
    return (
      <main className="w-full p-10 text-center text-xs text-red-300">
        {error}
      </main>
    );
  }

  if (!artist) {
    return (
      <main className="w-full p-16 text-center text-xs text-melora-textMuted">
        Loading artist universe...
      </main>
    );
  }

  return (
    <main className="w-full px-4 md:px-8 lg:px-10 py-6 md:py-8 max-w-7xl mx-auto space-y-10">
      {/* Cinematic Hero Section */}
      <section className="relative rounded-hero glass-panel p-6 md:p-10 border border-white/10 overflow-hidden shadow-soft-lg flex flex-col md:flex-row items-center md:items-end gap-8">
        {/* Ambient Glow Aura */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-melora-purple/20 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* Circular Artist Portrait */}
        <div className="w-44 h-44 md:w-56 md:h-56 rounded-full bg-gradient-aurora overflow-hidden shadow-glow border border-white/20 flex items-center justify-center text-6xl font-bold shrink-0">
          {artist.profileImage ? (
            <img
              src={artist.profileImage}
              alt={artist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            artist.name.charAt(0).toUpperCase()
          )}
        </div>

        {/* Artist Information & Actions */}
        <div className="flex-1 text-center md:text-left min-w-0">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
            {artist.isVerified && (
              <BadgeCheck className="w-5 h-5 text-melora-purple" />
            )}
            <span className="text-xs font-bold uppercase tracking-widest text-melora-lavender">
              {artist.isVerified
                ? "Verified Artist"
                : artist.artistStatus === "PENDING"
                  ? "Pending Artist"
                  : "Melora Artist"}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight truncate">
            {artist.name}
          </h1>

          <p className="mt-2 text-xs md:text-sm text-melora-textSecondary max-w-2xl line-clamp-2">
            {artist.bio || "Crafting sonic emotion and harmonic melodies on Melora."}
          </p>

          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-5 text-xs text-melora-textSecondary font-mono">
            <span>
              <b className="text-white">{(artist.followerCount ?? 0).toLocaleString()}</b>{" "}
              followers
            </span>
            {artist.artistListeners !== null && artist.artistListeners !== undefined && (
              <span>
                <b className="text-white">
                  {artist.artistListeners.toLocaleString()}
                </b>{" "}
                monthly listeners
              </span>
            )}
            {artist.artistStreams !== null && artist.artistStreams !== undefined && (
              <span>
                <b className="text-white">
                  {artist.artistStreams.toLocaleString()}
                </b>{" "}
                total streams
              </span>
            )}
          </div>

          {/* Primary Controls */}
          <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Play className="w-4 h-4 fill-current" />}
              onClick={playAll}
              disabled={!songs.length}
              className="rounded-full shadow-glow"
            >
              Play Top Tracks
            </Button>

            {currentUser?.id !== artist.id && (
              <Button
                variant={following ? "secondary" : "outline"}
                size="md"
                leftIcon={
                  following ? (
                    <UserCheck className="w-4 h-4 text-melora-pink" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )
                }
                onClick={toggleFollow}
                className="rounded-full"
              >
                {following ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Two Column Layout: Popular Songs + About */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Popular Songs */}
        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Popular Releases
          </h2>

          <div className="glass-panel rounded-card-lg p-2.5 space-y-1 border border-white/6">
            {songs.slice(0, 8).map((song, index) => (
              <div
                key={song.id}
                onClick={() => playSong(song)}
                className="flex items-center justify-between p-3 rounded-card hover:bg-white/6 transition-colors group cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-6 text-center text-xs font-mono text-melora-textMuted">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-white truncate group-hover:text-melora-purple transition-colors">
                      {song.title}
                    </p>
                    <p className="text-xs text-melora-textSecondary truncate">
                      {song.albumTitle || "Single"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-melora-textMuted">
                  {song.listeners !== null && (
                    <span className="hidden sm:block">
                      {song.listeners.toLocaleString()} listeners
                    </span>
                  )}
                  <span>{formatDuration(song.duration)}</span>
                </div>
              </div>
            ))}

            {!songs.length && (
              <p className="p-6 text-xs text-melora-textMuted text-center">
                No songs released by this artist yet.
              </p>
            )}
          </div>
        </section>

        {/* About Card */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            About
          </h2>

          <div className="glass-card rounded-card-lg p-6 space-y-4">
            <p className="text-xs text-melora-textSecondary leading-relaxed">
              {artist.bio || "This artist has not added a detailed biography yet."}
            </p>
            <p className="text-xs font-mono text-melora-lavender">
              @{artist.username || "artist"}
            </p>
          </div>
        </section>
      </div>

      {/* Discography Section */}
      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Discography
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {albums.map((album) => (
            <Link
              href={`/albums/${album.id}`}
              key={album.id}
              className="glass-card rounded-card-lg p-3 group select-none block"
            >
              <div className="aspect-square rounded-card bg-gradient-sunset overflow-hidden mb-2.5 relative">
                {album.coverUrl ? (
                  <img
                    src={album.coverUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <Disc3 className="w-10 h-10 text-white/40 m-auto mt-10" />
                )}
              </div>
              <p className="font-bold text-xs md:text-sm text-white truncate group-hover:text-melora-purple">
                {album.title}
              </p>
              <p className="text-[11px] text-melora-textSecondary truncate">
                {new Date(album.releaseDate).getFullYear()} • Album
              </p>
            </Link>
          ))}

          {singles.map((song) => (
            <div
              key={song.id}
              onClick={() => playSong(song)}
              className="glass-card rounded-card-lg p-3 group select-none cursor-pointer"
            >
              <div className="aspect-square rounded-card bg-gradient-primary overflow-hidden mb-2.5 relative">
                {song.coverUrl ? (
                  <img
                    src={song.coverUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <Play className="w-8 h-8 text-white/40 m-auto mt-10" />
                )}
              </div>
              <p className="font-bold text-xs md:text-sm text-white truncate group-hover:text-melora-pink">
                {song.title}
              </p>
              <p className="text-[11px] text-melora-textSecondary truncate">
                {new Date(song.releaseDate).getFullYear()} • Single
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
