"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BadgeCheck, Disc3, Heart, Play, UserCheck, UserPlus } from "lucide-react";
import { albumsApi, songsApi, usersApi } from "../../../../lib/api";
import { useAuthStore } from "../../../../store/authStore";
import { usePlayerStore } from "../../../../store/playerStore";
import { Album, Song, User } from "../../../../types";

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function ArtistProfilePage() {
  const params = useParams<{ id: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const playSong = usePlayerStore((state) => state.playSong);
  const addToQueue = usePlayerStore((state) => state.addToQueue);
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
    ]).then(([artistData, songData, albumData]) => {
      if (cancelled) return;
      if (artistData.role !== "ARTIST") throw new Error("This profile is not an artist account.");
      setArtist(artistData);
      setSongs(songData.results);
      setAlbums(albumData.results);
    }).catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Could not load artist."));
    return () => { cancelled = true; };
  }, [params.id]);

  const following = Boolean(currentUser?.followingIds?.includes(params.id));
  const singles = useMemo(() => songs.filter((song) => !song.albumId), [songs]);

  const toggleFollow = async () => {
    if (!currentUser || !artist || currentUser.id === artist.id) return;
    try {
      if (following) await usersApi.unfollow(artist.id); else await usersApi.follow(artist.id);
      const currentFollowingIds = Array.isArray(currentUser.followingIds) ? currentUser.followingIds : [];
      setUser({
        ...currentUser,
        followingIds: following
          ? currentFollowingIds.filter((id) => id !== artist.id)
          : [...currentFollowingIds, artist.id],
      });
      setArtist({ ...artist, followerCount: Math.max(0, (artist.followerCount || 0) + (following ? -1 : 1)) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update follow state.");
    }
  };

  const playAll = () => {
    if (!songs.length) return;
    songs.slice(1).forEach(addToQueue);
    playSong(songs[0]);
  };

  if (error && !artist) return <main className="flex-1 p-10 text-red-300">{error}</main>;
  if (!artist) return <main className="flex-1 p-10 text-melora-textSecondary">Loading artist...</main>;

  return (
    <main className="flex-1 w-full pb-32 relative">
      <div className="absolute top-0 left-0 w-full h-[520px] bg-melora-pink/10 blur-[130px] pointer-events-none -z-10" />

      <section className="p-6 md:p-10 pt-14 md:pt-20 flex flex-col md:flex-row items-center md:items-end gap-8 max-w-7xl mx-auto">
        <div className="w-48 h-48 md:w-60 md:h-60 rounded-full bg-gradient-04 overflow-hidden shadow-glow flex items-center justify-center text-7xl font-bold shrink-0">
          {artist.profileImage ? <img src={artist.profileImage} alt={artist.name} className="w-full h-full object-cover" /> : artist.name.charAt(0)}
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            {artist.isVerified && <BadgeCheck className="w-6 h-6 text-melora-purple" />}
            <p className="text-xs uppercase tracking-widest text-melora-textSecondary font-bold">{artist.isVerified ? "Verified Artist" : artist.artistStatus === "PENDING" ? "Pending Artist" : "Artist"}</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">{artist.name}</h1>
          <p className="mt-4 text-melora-textSecondary max-w-2xl">{artist.bio || "No biography has been added yet."}</p>
          <div className="mt-5 flex flex-wrap justify-center md:justify-start gap-6 text-sm text-melora-textSecondary">
            <span><b className="text-white">{artist.followerCount ?? 0}</b> followers</span>
            {artist.artistListeners !== null && artist.artistListeners !== undefined && <span><b className="text-white">{artist.artistListeners.toLocaleString()}</b> unique listeners</span>}
            {artist.artistStreams !== null && artist.artistStreams !== undefined && <span><b className="text-white">{artist.artistStreams.toLocaleString()}</b> streams</span>}
          </div>
          {artist.artistListeners === null && currentUser?.tier !== "GOLD" && currentUser?.id !== artist.id && <p className="mt-3 text-xs text-melora-textMuted">Listener and stream statistics are available to Gold subscribers.</p>}
          <div className="flex justify-center md:justify-start gap-3 mt-7">
            <button onClick={playAll} disabled={!songs.length} className="w-14 h-14 rounded-full bg-gradient-01 flex items-center justify-center disabled:opacity-40"><Play className="w-6 h-6 fill-white ml-1" /></button>
            {currentUser?.id !== artist.id && <button onClick={toggleFollow} className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 font-semibold flex items-center gap-2">{following ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}{following ? "Following" : "Follow"}</button>}
          </div>
        </div>
      </section>

      {error && <div className="max-w-7xl mx-auto px-6 md:px-10 mt-4 text-sm text-red-300">{error}</div>}

      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-12 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
        <section>
          <h2 className="text-2xl font-bold mb-5">Popular</h2>
          <div className="rounded-2xl border border-white/5 bg-melora-surfaceLayer/20 p-2">
            {songs.slice(0, 8).map((song, index) => (
              <div key={song.id} onClick={() => playSong(song)} className="grid grid-cols-[28px_1fr_auto] items-center gap-3 p-3 rounded-xl hover:bg-white/5 group cursor-pointer">
                <span className="text-melora-textMuted text-sm text-center">{index + 1}</span>
                <div className="min-w-0"><p className="font-semibold truncate">{song.title}</p><p className="text-xs text-melora-textMuted truncate">{song.albumTitle || "Single"}</p></div>
                <div className="flex items-center gap-4 text-sm text-melora-textMuted">{song.listeners !== null && <span className="hidden sm:block">{song.listeners.toLocaleString()} listeners</span>}<span>{formatDuration(song.duration)}</span><button onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 hover:text-melora-pink"><Heart className="w-4 h-4" /></button></div>
              </div>
            ))}
            {!songs.length && <p className="p-6 text-melora-textMuted">No published songs yet.</p>}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-5">About</h2>
          <div className="rounded-2xl bg-melora-surfaceLayer/30 border border-white/5 p-6"><p className="text-melora-textSecondary leading-relaxed">{artist.bio || "This artist has not added a biography yet."}</p><p className="mt-5 text-sm text-melora-textMuted">@{artist.username || "artist"}</p></div>
        </section>
      </div>

      <section className="max-w-7xl mx-auto px-6 md:px-10 mt-12">
        <h2 className="text-2xl font-bold mb-5">Discography</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {albums.map((album) => <Link href={`/albums/${album.id}`} key={album.id} className="group"><div className="aspect-square rounded-card bg-gradient-03 overflow-hidden mb-3 group-hover:-translate-y-1 transition-transform">{album.coverUrl ? <img src={album.coverUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Disc3 className="w-12 h-12 text-white/40" /></div>}</div><p className="font-bold truncate">{album.title}</p><p className="text-sm text-melora-textMuted">{new Date(album.releaseDate).getFullYear()} • Album</p></Link>)}
          {singles.map((song) => <button key={song.id} onClick={() => playSong(song)} className="text-left group"><div className="aspect-square rounded-card bg-gradient-01 overflow-hidden mb-3 group-hover:-translate-y-1 transition-transform">{song.coverUrl ? <img src={song.coverUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Play className="w-10 h-10 text-white/40" /></div>}</div><p className="font-bold truncate">{song.title}</p><p className="text-sm text-melora-textMuted">{new Date(song.releaseDate).getFullYear()} • Single</p></button>)}
        </div>
      </section>
    </main>
  );
}
