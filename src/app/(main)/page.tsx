"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Disc3,
  ListMusic,
  Play,
  Pause,
  Crown,
  Heart,
  Sparkles,
  Flame,
  Radio,
  Clock,
  UserCheck,
  TrendingUp,
  Music,
} from "lucide-react";
import { homeApi, songsApi } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { usePlayerStore } from "../../store/playerStore";
import { Album, HomeResponse, Playlist, Song } from "../../types";
import { useAtmosphere, MOOD_CONFIG, MoodType } from "../../components/brand/AtmosphereBackground";
import MeloraWaveform from "../../components/brand/MeloraWaveform";
import Chip from "../../components/ui/Chip";
import Button from "../../components/common/Button";
import IconButton from "../../components/ui/IconButton";
import { CardSkeleton, SongRowSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../components/ui/ToastProvider";

const DEMO_SONGS: Song[] = [
  {
    id: "demo-1",
    title: "Midnight City",
    artistId: "m83",
    artistName: "M83",
    albumId: null,
    albumTitle: "Hurry Up, We're Dreaming",
    duration: 243,
    src: "/audio/midnightcity.mp3",
    listeners: 148200,
    streams: 842000,
    releaseDate: "2011-08-15",
    isGoldOnly: false,
    lyrics: "Waiting in a car\nWaiting for a ride in the dark\nThe night city grows\nLook at the horizon glow",
  },
  {
    id: "demo-2",
    title: "Starboy",
    artistId: "weeknd",
    artistName: "The Weeknd",
    albumId: null,
    albumTitle: "Starboy",
    duration: 230,
    src: "/audio/starboy.mp3",
    listeners: 320500,
    streams: 1940000,
    releaseDate: "2016-11-25",
    isGoldOnly: false,
    lyrics: "I'm tryna put you in the worst mood\nP1 cleaner than your church shoes",
  },
  {
    id: "demo-3",
    title: "Nightcall",
    artistId: "kavinsky",
    artistName: "Kavinsky",
    albumId: null,
    albumTitle: "OutRun",
    duration: 259,
    src: "/audio/nightcall.mp3",
    listeners: 98400,
    streams: 612000,
    releaseDate: "2010-03-15",
    isGoldOnly: false,
    lyrics: "I'm giving you a night call to tell you how I feel\nI want to drive you through the night",
  },
];

function SongRow({ song, index }: { song: Song; index: number }) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
  const { toast } = useToast();
  const [liked, setLiked] = useState(Boolean(song.isLiked));
  const isCurrent = currentSong?.id === song.id;

  const toggleLike = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      if (liked) {
        await songsApi.unlike(song.id);
        toast("Removed from Liked Songs", "info");
      } else {
        await songsApi.like(song.id);
        toast("Added to Liked Songs", "heart");
      }
      setLiked(!liked);
    } catch {
      setLiked(!liked);
    }
  };

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  return (
    <div
      onClick={handleRowClick}
      className={`
        flex items-center justify-between gap-4 p-3 rounded-card transition-all duration-micro cursor-pointer group select-none
        ${
          isCurrent
            ? "bg-melora-purple/15 border border-melora-purple/30 shadow-glow"
            : "hover:bg-melora-surfaceHover/80 border border-transparent"
        }
      `}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Index or Live Playing Wave */}
        <div className="w-6 flex items-center justify-center shrink-0">
          {isCurrent && isPlaying ? (
            <MeloraWaveform isPlaying barCount={4} height={14} variant="minimal" />
          ) : (
            <span className="text-xs font-mono text-melora-textMuted group-hover:hidden">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          <Play
            className={`w-3.5 h-3.5 text-white ${
              isCurrent && isPlaying ? "hidden" : "hidden group-hover:block"
            }`}
          />
        </div>

        {/* Cover Art */}
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-melora-cardElevated border border-white/8 shrink-0 relative group-hover:shadow-soft-sm">
          {song.coverUrl ? (
            <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
              <Music className="w-5 h-5 text-white/50" />
            </div>
          )}
        </div>

        {/* Title & Artist */}
        <div className="min-w-0 flex-1">
          <p
            className={`font-semibold text-sm truncate transition-colors ${
              isCurrent ? "text-melora-pink font-bold" : "text-white group-hover:text-melora-purple"
            }`}
          >
            {song.title}
          </p>
          <Link
            href={`/artists/${song.artistId}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-melora-textSecondary hover:text-white truncate block mt-0.5"
          >
            {song.artistName}
          </Link>
        </div>
      </div>

      {/* Meta & Actions */}
      <div className="flex items-center gap-4 text-xs font-mono text-melora-textMuted shrink-0">
        {song.listeners !== null && song.listeners !== undefined && (
          <span className="hidden sm:block text-melora-textMuted">
            {song.listeners.toLocaleString()} listeners
          </span>
        )}

        <span>
          {Math.floor(song.duration / 60)}:
          {String(song.duration % 60).padStart(2, "0")}
        </span>

        <button
          onClick={toggleLike}
          className={`p-1.5 rounded-full transition-colors ${
            liked ? "text-melora-pink" : "hover:text-melora-pink text-melora-textMuted"
          }`}
          aria-label="Like song"
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
        </button>
      </div>
    </div>
  );
}

function FeaturePlaylistCard({ playlist }: { playlist: Playlist }) {
  const { currentSong, isPlaying, playSong, togglePlay, addToQueue } = usePlayerStore();
  const isCurrent = playlist.tracks?.some((t) => t.id === currentSong?.id);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const tracks = playlist.tracks || [];
    if (!tracks.length) return;
    if (isCurrent) {
      togglePlay();
    } else {
      tracks.slice(1).forEach(addToQueue);
      playSong(tracks[0]);
    }
  };

  return (
    <div className="min-w-[260px] md:min-w-[300px] glass-card rounded-card-lg p-4 group select-none">
      <div className="aspect-[16/10] rounded-card bg-gradient-sunset overflow-hidden relative mb-3.5 border border-white/10">
        {playlist.coverUrl ? (
          <img
            src={playlist.coverUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-sunset">
            <ListMusic className="w-12 h-12 text-white/50" />
          </div>
        )}

        <button
          onClick={handlePlay}
          className="absolute right-3 bottom-3 w-11 h-11 rounded-full bg-gradient-primary text-white flex items-center justify-center shadow-glow opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-base"
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-white text-sm md:text-base truncate group-hover:text-melora-purple transition-colors">
            {playlist.name}
          </p>
          <p className="text-xs text-melora-textSecondary truncate mt-0.5">
            {playlist.description || `${playlist.trackCount ?? playlist.tracks?.length ?? 0} tracks`}
          </p>
        </div>
      </div>
    </div>
  );
}

function AlbumCard({ album }: { album: Album }) {
  return (
    <Link
      href={`/albums/${album.id}`}
      className="min-w-[180px] md:min-w-[210px] glass-card rounded-card-lg p-3.5 group select-none block"
    >
      <div className="aspect-square rounded-card bg-gradient-purple-glow overflow-hidden mb-3 border border-white/8 relative">
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt={album.title}
            className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Disc3 className="w-12 h-12 text-white/40" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-gradient-primary text-white flex items-center justify-center shadow-glow transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      <p className="font-bold text-sm text-white truncate group-hover:text-melora-purple transition-colors">
        {album.title}
      </p>
      <p className="text-xs text-melora-textSecondary truncate mt-0.5">
        {album.artistName}
      </p>
    </Link>
  );
}

export default function MainPage() {
  const { user, isAuthenticated, isHydrated, setUser } = useAuthStore();
  const { activeMood, setActiveMood } = useAtmosphere();
  const [data, setData] = useState<HomeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const moodsList = Object.keys(MOOD_CONFIG) as MoodType[];

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    homeApi
      .get()
      .then((response) => {
        if (cancelled) return;
        setData(response);
        setUser(response.user);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Backend data is unavailable. Demo tracks are shown instead.");
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isHydrated, setUser]);

  const popularSongs = useMemo(
    () => (data?.popularSongs?.length ? data.popularSongs : DEMO_SONGS),
    [data]
  );

  // Dynamic Time of day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const displayName = data?.user.name || user?.name || "Listener";

  // Unauthenticated Welcome State
  if (isHydrated && !isAuthenticated) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full glass-modal rounded-card-lg p-8 md:p-14 text-center border border-white/10 shadow-glow-purple relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary mx-auto mb-6 flex items-center justify-center shadow-glow">
            <MeloraWaveform isPlaying barCount={16} height={28} />
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Feel Every Melody.
          </h1>

          <p className="text-sm md:text-base text-melora-textSecondary max-w-md mx-auto mb-8 leading-relaxed">
            Welcome to Melora — an emotional, cinematic music universe built around
            sound, light, and movement.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/login">
              <Button variant="primary" size="lg" className="rounded-full shadow-glow">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary" size="lg" className="rounded-full">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full px-4 md:px-8 lg:px-10 py-6 md:py-8 max-w-7xl mx-auto space-y-10">
      {/* Hero Welcome Header */}
      <section className="relative rounded-hero glass-panel p-6 md:p-10 border border-white/10 overflow-hidden shadow-soft-lg">
        {/* Atmosphere Gradient Overlay */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-primary opacity-20 blur-[100px] pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-melora-pink flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Soundtrack</span>
            </p>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              {greeting}, {displayName}
            </h1>
            <p className="text-xs md:text-sm text-melora-textSecondary mt-1">
              Ready for something new? Feel every melody in high fidelity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/library">
              <Button variant="secondary" size="sm" className="rounded-full">
                Your Library
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="primary" size="sm" className="rounded-full shadow-glow">
                Explore Sounds
              </Button>
            </Link>
          </div>
        </div>

        {/* Mood Carousel / Pill Selector */}
        <div className="mt-8 pt-6 border-t border-white/6">
          <p className="text-xs font-semibold uppercase tracking-wider text-melora-textMuted mb-3 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-melora-orange" />
            <span>Select Mood Atmosphere</span>
          </p>

          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
            {moodsList.map((mood) => {
              const isSelected = activeMood === mood;
              return (
                <Chip
                  key={mood}
                  label={MOOD_CONFIG[mood].label}
                  isActive={isSelected}
                  variant="gradient"
                  onClick={() => setActiveMood(mood)}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Loading Skeleton Indicator */}
      {loading && (
        <div className="space-y-4">
          <SongRowSkeleton />
          <SongRowSkeleton />
          <SongRowSkeleton />
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-btn bg-melora-warning/15 border border-melora-warning/30 text-xs text-amber-200">
          {error}
        </div>
      )}

      {/* Continue Listening / Featured Playlists */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Continue Listening
            </h2>
            <p className="text-xs text-melora-textSecondary mt-0.5">
              Pick up where you left off
            </p>
          </div>
          <Link
            href="/playlists"
            className="text-xs font-semibold text-melora-lavender hover:text-white transition-colors"
          >
            See all playlists →
          </Link>
        </div>

        {data?.recentPlaylists?.length ? (
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-3 custom-scrollbar">
            {data.recentPlaylists.map((playlist) => (
              <FeaturePlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-card">
              <p className="font-bold text-sm text-white">Daily Melora Mix</p>
              <p className="text-xs text-melora-textSecondary mt-1">
                Custom synthwave & chill tracks tailored to your evening
              </p>
            </div>
            <div className="glass-card p-4 rounded-card">
              <p className="font-bold text-sm text-white">Cosmic Nightfall</p>
              <p className="text-xs text-melora-textSecondary mt-1">
                Atmospheric electronic sounds & deep resonant melodies
              </p>
            </div>
            <div className="glass-card p-4 rounded-card">
              <p className="font-bold text-sm text-white">Midnight Drive</p>
              <p className="text-xs text-melora-textSecondary mt-1">
                Cinematic rhythms and neon soundscapes
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Gold Member Early Access Section */}
      {(data?.user.tier === "GOLD" || user?.tier === "GOLD") && (
        <section className="rounded-card-lg border border-yellow-500/30 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent p-6 md:p-8 shadow-glow">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-yellow-400/30 flex items-center justify-center text-yellow-300">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Gold VIP Early Access</h3>
                <p className="text-xs text-melora-textSecondary">
                  Exclusive unreleased melodies curated for Gold members
                </p>
              </div>
            </div>
          </div>

          {data?.earlyAccess?.length ? (
            <div className="space-y-1.5">
              {data.earlyAccess.map((song, index) => (
                <SongRow key={song.id} song={song} index={index} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-melora-textMuted">
              No early-access drops right now. Check back soon!
            </p>
          )}
        </section>
      )}

      {/* Two Column Layout: Trending Melodies + New Releases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trending Songs (2 columns) */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-melora-pink" />
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Trending Melodies
              </h2>
            </div>
            <Link
              href="/albums"
              className="text-xs font-semibold text-melora-lavender hover:text-white"
            >
              Catalog →
            </Link>
          </div>

          <div className="glass-panel rounded-card-lg p-2.5 space-y-1 border border-white/6">
            {popularSongs.map((song, index) => (
              <SongRow key={song.id} song={song} index={index} />
            ))}
          </div>
        </section>

        {/* Latest Releases Sidebar Column */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Disc3 className="w-5 h-5 text-melora-purple" />
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                New Albums
              </h2>
            </div>
            <Link
              href="/albums"
              className="text-xs font-semibold text-melora-lavender hover:text-white"
            >
              All →
            </Link>
          </div>

          <div className="space-y-3">
            {data?.latestAlbums?.slice(0, 3).map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}

            {!data?.latestAlbums?.length && (
              <div className="glass-card p-6 rounded-card text-center">
                <Disc3 className="w-10 h-10 text-melora-textMuted mx-auto mb-2 opacity-50" />
                <p className="text-xs text-melora-textMuted">
                  Browse albums in our full music catalog.
                </p>
                <Link href="/albums" className="inline-block mt-3">
                  <Button variant="secondary" size="sm">
                    Open Catalog
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
