"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Disc3, ListMusic, Play, Settings, User, Crown, Heart, Loader2 } from "lucide-react";
import { homeApi, songsApi } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { usePlayerStore } from "../../store/playerStore";
import { Album, HomeResponse, Playlist, Song } from "../../types";

const DEMO_SONGS: Song[] = [
  { id: "demo-1", title: "Midnight City", artistId: "m83", artistName: "M83", albumId: null, albumTitle: "Hurry Up, We're Dreaming", duration: 243, src: "/audio/midnightcity.mp3", listeners: 0, streams: 0, releaseDate: "2011-08-15", isGoldOnly: false, lyrics: "Waiting in a car\nWaiting for a ride in the dark\nThe night city grows\nLook at the horizon glow" },
  { id: "demo-2", title: "Starboy", artistId: "weeknd", artistName: "The Weeknd", albumId: null, albumTitle: "Starboy", duration: 230, src: "/audio/starboy.mp3", listeners: 0, streams: 0, releaseDate: "2016-11-25", isGoldOnly: false, lyrics: "I'm tryna put you in the worst mood\nP1 cleaner than your church shoes" },
  { id: "demo-3", title: "Nightcall", artistId: "kavinsky", artistName: "Kavinsky", albumId: null, albumTitle: "OutRun", duration: 259, src: "/audio/nightcall.mp3", listeners: 0, streams: 0, releaseDate: "2010-03-15", isGoldOnly: false, lyrics: "I'm giving you a night call to tell you how I feel\nI want to drive you through the night" },
];

function SongRow({ song, index }: { song: Song; index: number }) {
  const playSong = usePlayerStore((state) => state.playSong);
  const [liked, setLiked] = useState(Boolean(song.isLiked));

  const toggleLike = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      if (liked) await songsApi.unlike(song.id);
      else await songsApi.like(song.id);
      setLiked(!liked);
    } catch {
      setLiked(!liked);
    }
  };

  return (
    <div onClick={() => playSong(song)} className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
      <div className="flex items-center gap-4 min-w-0">
        <span className="w-5 text-center text-melora-textMuted text-sm">{index + 1}</span>
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-01 flex items-center justify-center shrink-0">
          {song.coverUrl ? <img src={song.coverUrl} alt="" className="w-full h-full object-cover" /> : <Play className="w-4 h-4 text-white opacity-50 group-hover:opacity-100" />}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">{song.title}</p>
          <Link href={`/artists/${song.artistId}`} onClick={(e) => e.stopPropagation()} className="text-sm text-melora-textSecondary hover:text-white truncate block">{song.artistName}</Link>
        </div>
      </div>
      <div className="flex items-center gap-5 text-sm text-melora-textMuted">
        {song.listeners !== null && <span className="hidden md:block">{song.listeners.toLocaleString()} listeners</span>}
        <span>{Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, "0")}</span>
        <button onClick={toggleLike} className={liked ? "text-melora-pink" : "hover:text-melora-pink"}><Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} /></button>
      </div>
    </div>
  );
}

function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const playSong = usePlayerStore((state) => state.playSong);
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const play = () => {
    const tracks = playlist.tracks || [];
    if (!tracks.length) return;
    tracks.slice(1).forEach(addToQueue);
    playSong(tracks[0]);
  };
  return (
    <div className="min-w-[240px] rounded-card border border-white/5 bg-melora-surfaceLayer/40 p-4">
      <div className="aspect-video rounded-xl bg-gradient-02 overflow-hidden flex items-center justify-center mb-4">
        {playlist.coverUrl ? <img src={playlist.coverUrl} alt="" className="w-full h-full object-cover" /> : <ListMusic className="w-10 h-10 text-white/50" />}
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="font-bold text-white truncate">{playlist.name}</p><p className="text-sm text-melora-textMuted">{playlist.trackCount ?? playlist.tracks?.length ?? 0} tracks</p></div>
        <button onClick={play} className="w-10 h-10 rounded-full bg-melora-pink flex items-center justify-center shrink-0"><Play className="w-4 h-4 fill-white" /></button>
      </div>
    </div>
  );
}

function AlbumCard({ album }: { album: Album }) {
  return (
    <Link href={`/albums/${album.id}`} className="min-w-[190px] group">
      <div className="aspect-square rounded-card bg-gradient-03 overflow-hidden shadow-soft mb-3 group-hover:-translate-y-1 transition-transform">
        {album.coverUrl ? <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Disc3 className="w-12 h-12 text-white/40" /></div>}
      </div>
      <p className="font-bold text-white truncate">{album.title}</p>
      <p className="text-sm text-melora-textSecondary truncate">{album.artistName}</p>
    </Link>
  );
}

export default function MainPage() {
  const { user, isAuthenticated, isHydrated, setUser } = useAuthStore();
  const [data, setData] = useState<HomeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    homeApi.get().then((response) => {
      if (cancelled) return;
      setData(response);
      setUser(response.user);
    }).catch(() => {
      if (!cancelled) setError("Backend data is unavailable. Demo tracks are shown instead.");
    }).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [isAuthenticated, isHydrated, setUser]);

  const popularSongs = useMemo(() => data?.popularSongs?.length ? data.popularSongs : DEMO_SONGS, [data]);

  if (isHydrated && !isAuthenticated) {
    return (
      <main className="flex-1 p-8 pb-32 flex items-center justify-center">
        <div className="max-w-xl text-center rounded-3xl bg-melora-surfaceLayer/50 border border-white/5 p-10">
          <h1 className="text-4xl font-bold mb-3">Feel Every Melody.</h1>
          <p className="text-melora-textSecondary mb-7">Log in to see your recent playlists, latest releases and personalized music.</p>
          <div className="flex gap-3 justify-center"><Link href="/login" className="px-6 py-3 rounded-xl bg-gradient-01 font-semibold">Log In</Link><Link href="/register" className="px-6 py-3 rounded-xl border border-white/10">Create Account</Link></div>
        </div>
      </main>
    );
  }

  const displayName = data?.user.name || user?.name || "Listener";
  const profileImage = data?.user.profileImage || user?.profileImage;

  return (
    <main className="flex-1 w-full pb-32">
      <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 p-6 md:p-10">
        <aside className="hidden lg:block sticky top-28 self-start rounded-2xl border border-white/5 bg-melora-surfaceLayer/30 p-4 space-y-2">
          <p className="text-xs uppercase tracking-widest text-melora-textMuted px-3 py-2">Library</p>
          <Link href="/playlists" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5"><ListMusic className="w-5 h-5" /> Playlists</Link>
          <Link href="/albums" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5"><Disc3 className="w-5 h-5" /> Albums & Singles</Link>
          <Link href="/profile" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5"><User className="w-5 h-5" /> Profile</Link>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5"><Settings className="w-5 h-5" /> Settings</Link>
        </aside>

        <div className="min-w-0">
          <header className="mb-10 flex items-center justify-between gap-5">
            <div><h1 className="text-3xl md:text-4xl font-bold text-white">Welcome, {displayName}</h1><p className="text-melora-textSecondary mt-2">Your music, picked up where you left it.</p></div>
            <Link href="/profile" className="w-14 h-14 rounded-full bg-gradient-01 overflow-hidden flex items-center justify-center text-xl font-bold">{profileImage ? <img src={profileImage} alt="" className="w-full h-full object-cover" /> : displayName.charAt(0).toUpperCase()}</Link>
          </header>

          {loading && <div className="mb-6 flex items-center gap-2 text-melora-textMuted"><Loader2 className="w-4 h-4 animate-spin" /> Loading your home feed...</div>}
          {error && <p className="mb-6 text-sm text-amber-300">{error}</p>}

          <section className="mb-12">
            <div className="flex justify-between items-center mb-5"><h2 className="text-2xl font-bold">Recently Played Playlists</h2><Link href="/playlists" className="text-sm text-melora-purple">View all</Link></div>
            {data?.recentPlaylists?.length ? <div className="flex gap-5 overflow-x-auto pb-3">{data.recentPlaylists.map((playlist) => <PlaylistCard key={playlist.id} playlist={playlist} />)}</div> : <div className="rounded-2xl border border-dashed border-white/10 p-8 text-melora-textMuted">No recent playlists yet. Create one and add songs from Albums & Singles.</div>}
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-5">Latest Albums</h2>
            {data?.latestAlbums?.length ? <div className="flex gap-5 overflow-x-auto pb-3">{data.latestAlbums.map((album) => <AlbumCard key={album.id} album={album} />)}</div> : <div className="text-melora-textMuted">No albums available yet.</div>}
          </section>

          {(data?.user.tier === "GOLD" || user?.tier === "GOLD") && (
            <section className="mb-12 rounded-3xl border border-melora-orange/20 bg-melora-orange/5 p-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Crown className="w-6 h-6 text-melora-orange" /> Gold Early Access</h2>
              <p className="text-melora-textSecondary mb-4">Upcoming releases available to Gold listeners.</p>
              {data?.earlyAccess?.length ? <div className="space-y-1">{data.earlyAccess.map((song, index) => <SongRow key={song.id} song={song} index={index} />)}</div> : <p className="text-sm text-melora-textMuted">There are no early-access releases right now.</p>}
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold mb-5">Popular Songs</h2>
            <div className="rounded-2xl border border-white/5 bg-melora-surfaceLayer/20 p-2">{popularSongs.map((song, index) => <SongRow key={song.id} song={song} index={index} />)}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
