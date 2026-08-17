"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Music,
  Disc3,
  User,
  ListMusic,
  Sparkles,
  TrendingUp,
  Play,
  Heart,
  Clock,
} from "lucide-react";
import SearchBar from "../../../components/ui/SearchBar";
import { songsApi, albumsApi, usersApi, playlistsApi } from "../../../lib/api";
import { usePlayerStore } from "../../../store/playerStore";
import { Song, Album, User as UserType, Playlist } from "../../../types";
import MeloraWaveform from "../../../components/brand/MeloraWaveform";
import Chip from "../../../components/ui/Chip";
import { useAtmosphere, MoodType } from "../../../components/brand/AtmosphereBackground";
import { useToast } from "../../../components/ui/ToastProvider";

const GENRES_CONFIG = [
  { id: "synthwave", name: "Synthwave", gradient: "from-[#7B5CFF] to-[#FF4D7D]", mood: "Night" as MoodType },
  { id: "electronic", name: "Electronic", gradient: "from-[#6E7CFF] to-[#B18CFF]", mood: "Focus" as MoodType },
  { id: "ambient", name: "Chill & Ambient", gradient: "from-[#5C42D9] to-[#9C7BFF]", mood: "Chill" as MoodType },
  { id: "pop", name: "Modern Pop", gradient: "from-[#FF4D7D] to-[#FFB45C]", mood: "Energetic" as MoodType },
  { id: "rnb", name: "R&B / Soul", gradient: "from-[#FF4D7D] to-[#FF8EAA]", mood: "Romantic" as MoodType },
  { id: "hiphop", name: "Hip-Hop", gradient: "from-[#FFB45C] to-[#FF4D7D]", mood: "Workout" as MoodType },
  { id: "indie", name: "Indie & Alternative", gradient: "from-[#4ADE9A] to-[#6E8CFF]", mood: "Happy" as MoodType },
  { id: "rock", name: "Rock & Cinematic", gradient: "from-[#FF5C72] to-[#FFB45C]", mood: "Deep" as MoodType },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<"all" | "songs" | "albums" | "artists">("all");
  const [loading, setLoading] = useState(false);

  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<UserType[]>([]);

  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const { setActiveMood } = useAtmosphere();
  const { toast } = useToast();

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (!query.trim()) {
      setSongs([]);
      setAlbums([]);
      setArtists([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [songRes, albumRes] = await Promise.all([
          songsApi.list({ search: query, page_size: 20 }),
          albumsApi.list({ search: query, page_size: 10 }),
        ]);
        setSongs(songRes.results);
        setAlbums(albumRes.results);
      } catch {
        // quiet error fallback
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const trendingTags = ["Midnight City", "The Weeknd", "Daft Punk", "Synthwave", "Cyberpunk", "Chillhop"];

  return (
    <main className="w-full px-4 md:px-8 lg:px-10 py-6 md:py-8 max-w-7xl mx-auto space-y-8">
      {/* Search Header */}
      <section className="space-y-4 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Explore Melora
        </h1>
        <p className="text-xs md:text-sm text-melora-textSecondary">
          Search songs, artists, albums, or explore curated soundscapes and moods.
        </p>

        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search for songs, artists, or genres... (Press /)"
          size="lg"
          autoFocus
        />

        {/* Quick Trending Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-2 no-scrollbar">
          <span className="text-xs font-semibold text-melora-textMuted flex items-center gap-1 shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-melora-pink" /> Trending:
          </span>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="text-xs px-3 py-1 rounded-full bg-white/6 hover:bg-white/12 text-melora-textSecondary hover:text-white border border-white/6 transition-colors shrink-0"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Live Search Results View */}
      {query.trim() ? (
        <section className="space-y-6">
          {/* Result Filter Tabs */}
          <div className="flex gap-2 border-b border-white/6 pb-3">
            {(["all", "songs", "albums"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                  activeTab === tab
                    ? "bg-gradient-primary text-white shadow-glow"
                    : "text-melora-textSecondary hover:text-white bg-white/5"
                }`}
              >
                {tab === "all" ? "Top Results" : tab}
              </button>
            ))}
          </div>

          {loading && (
            <div className="text-xs text-melora-textMuted flex items-center gap-2 py-4">
              <Sparkles className="w-4 h-4 text-melora-purple animate-pulse" />
              <span>Scanning the sound universe...</span>
            </div>
          )}

          {/* Songs Results List */}
          {(activeTab === "all" || activeTab === "songs") && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-melora-purple" /> Songs
              </h3>

              {songs.length > 0 ? (
                <div className="glass-panel rounded-card-lg p-2 space-y-1 border border-white/6">
                  {songs.map((song, idx) => {
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <div
                        key={song.id}
                        onClick={() => playSong(song)}
                        className={`flex items-center justify-between p-3 rounded-card transition-colors cursor-pointer group select-none ${
                          isCurrent
                            ? "bg-melora-purple/15 border border-melora-purple/30 shadow-glow"
                            : "hover:bg-white/6"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-lg bg-melora-cardElevated overflow-hidden shrink-0 border border-white/10 relative">
                            {song.coverUrl ? (
                              <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Play className="w-4 h-4 text-white/50 m-auto mt-3.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`font-semibold text-sm truncate ${
                                isCurrent ? "text-melora-pink font-bold" : "text-white"
                              }`}
                            >
                              {song.title}
                            </p>
                            <p className="text-xs text-melora-textSecondary truncate">
                              {song.artistName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono text-melora-textMuted">
                          <span>
                            {Math.floor(song.duration / 60)}:
                            {String(song.duration % 60).padStart(2, "0")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                !loading && (
                  <p className="text-xs text-melora-textMuted">No songs found matching "{query}".</p>
                )
              )}
            </div>
          )}

          {/* Albums Results List */}
          {(activeTab === "all" || activeTab === "albums") && (
            <div className="space-y-3 pt-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Disc3 className="w-4 h-4 text-melora-pink" /> Albums & Releases
              </h3>

              {albums.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {albums.map((album) => (
                    <Link
                      key={album.id}
                      href={`/albums/${album.id}`}
                      className="glass-card rounded-card-lg p-3 group select-none block"
                    >
                      <div className="aspect-square rounded-card bg-gradient-sunset overflow-hidden mb-2.5 border border-white/8 relative">
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
                      <p className="text-[11px] text-melora-textSecondary truncate mt-0.5">
                        {album.artistName}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                !loading && (
                  <p className="text-xs text-melora-textMuted">No albums found matching "{query}".</p>
                )
              )}
            </div>
          )}
        </section>
      ) : (
        /* Default Browse Experience: Genre & Atmosphere Gradient Tiles */
        <section className="space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Browse Genres & Soundscapes
            </h2>
            <p className="text-xs text-melora-textSecondary mt-0.5">
              Atmospheric playlists designed for distinct emotions
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {GENRES_CONFIG.map((genre) => (
              <div
                key={genre.id}
                onClick={() => {
                  setActiveMood(genre.mood);
                  setQuery(genre.name);
                }}
                className={`
                  relative h-32 md:h-36 rounded-card-lg p-5
                  bg-gradient-to-br ${genre.gradient}
                  shadow-soft-md cursor-pointer select-none
                  overflow-hidden group
                  transition-all duration-base hover:scale-[1.03] hover:shadow-glow
                  border border-white/15
                `}
              >
                <div className="relative z-10">
                  <h3 className="font-extrabold text-white text-lg md:text-xl tracking-tight leading-tight">
                    {genre.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider block mt-1">
                    {genre.mood} Mood
                  </span>
                </div>

                <div className="absolute right-[-10px] bottom-[-10px] w-20 h-20 rounded-full bg-white/10 blur-md pointer-events-none" />
                <Music className="absolute right-3 bottom-3 w-12 h-12 text-white/20 transform rotate-12 group-hover:scale-110 transition-transform" />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
