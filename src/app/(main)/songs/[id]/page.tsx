"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Heart, Play, Music, Sparkles, Mic2 } from "lucide-react";
import { songsApi } from "../../../../lib/api";
import { usePlayerStore } from "../../../../store/playerStore";
import { Song } from "../../../../types";
import MeloraWaveform from "../../../../components/brand/MeloraWaveform";
import Button from "../../../../components/common/Button";
import IconButton from "../../../../components/ui/IconButton";
import { useToast } from "../../../../components/ui/ToastProvider";

export default function SongDetailPage() {
  const params = useParams<{ id: string }>();
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const { toast } = useToast();

  const [song, setSong] = useState<Song | null>(null);
  const [liked, setLiked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    songsApi
      .get(params.id)
      .then((data) => {
        setSong(data);
        setLiked(Boolean(data.isLiked));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Song not found."));
  }, [params.id]);

  const toggleLike = async () => {
    if (!song) return;
    try {
      if (liked) {
        await songsApi.unlike(song.id);
        toast("Removed from Liked Songs", "info");
      } else {
        await songsApi.like(song.id);
        toast("Added to Liked Songs", "heart");
      }
      setLiked(!liked);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update like.");
    }
  };

  const isCurrent = currentSong?.id === song?.id;

  if (error && !song) {
    return (
      <main className="w-full p-10 text-center text-xs text-red-300">
        {error}
      </main>
    );
  }

  if (!song) {
    return (
      <main className="w-full p-16 text-center text-xs text-melora-textMuted">
        Loading track experience...
      </main>
    );
  }

  return (
    <main className="w-full px-4 md:px-8 lg:px-10 py-6 md:py-8 max-w-5xl mx-auto space-y-10">
      {/* Song Hero Card */}
      <section className="relative rounded-hero glass-panel p-6 md:p-10 border border-white/10 overflow-hidden shadow-soft-lg flex flex-col md:flex-row items-center md:items-end gap-8">
        {/* Ambient Blurred Artwork Lighting */}
        {song.coverUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 blur-[90px] scale-125 pointer-events-none -z-10"
            style={{ backgroundImage: `url(${song.coverUrl})` }}
          />
        )}

        <div className="w-48 h-48 md:w-60 md:h-60 rounded-card-lg bg-gradient-primary overflow-hidden shadow-glow border border-white/15 shrink-0 relative group">
          {song.coverUrl ? (
            <img
              src={song.coverUrl}
              alt={song.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-16 h-16 text-white/50" />
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-melora-pink flex items-center justify-center md:justify-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Track</span>
          </p>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mt-1 truncate">
            {song.title}
          </h1>

          <p className="mt-2 text-xs md:text-sm text-melora-textSecondary">
            <Link
              href={`/artists/${song.artistId}`}
              className="text-white font-semibold hover:underline"
            >
              {song.artistName}
            </Link>
            {song.albumId && (
              <>
                {" • "}
                <Link
                  href={`/albums/${song.albumId}`}
                  className="hover:text-white"
                >
                  {song.albumTitle}
                </Link>
              </>
            )}
          </p>

          <p className="mt-2 text-xs font-mono text-melora-textMuted">
            Released {song.releaseDate}
            {song.genre ? ` • ${song.genre}` : ""} •{" "}
            {Math.floor(song.duration / 60)}:
            {String(song.duration % 60).padStart(2, "0")}
          </p>

          {song.listeners !== null && (
            <p className="mt-3 text-xs text-melora-textSecondary font-mono">
              <b className="text-white">{song.listeners.toLocaleString()}</b> listeners
              {song.streams !== null && song.streams !== undefined
                ? ` • ${song.streams.toLocaleString()} streams`
                : ""}
            </p>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-center md:justify-start items-center gap-3">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Play className="w-4 h-4 fill-current" />}
              onClick={() => playSong(song)}
              className="rounded-full shadow-glow"
            >
              Play Track
            </Button>

            <IconButton
              variant="secondary"
              size="md"
              isActive={liked}
              onClick={toggleLike}
              aria-label="Like song"
            >
              <Heart
                className={`w-5 h-5 ${liked ? "fill-melora-pink text-melora-pink" : "text-melora-textMuted"}`}
              />
            </IconButton>
          </div>
        </div>
      </section>

      {/* Waveform Visualizer Preview */}
      <section className="glass-card rounded-card-lg p-6 text-center space-y-3 border border-white/6">
        <p className="text-xs font-semibold uppercase tracking-wider text-melora-textMuted">
          Acoustic Wave Signature
        </p>
        <MeloraWaveform
          isPlaying={isCurrent && isPlaying}
          barCount={36}
          height={42}
          color="gradient"
        />
      </section>

      {/* Lyrics Section */}
      {song.lyrics && (
        <section className="glass-panel rounded-card-lg p-6 md:p-8 space-y-4 border border-white/6">
          <div className="flex items-center gap-2">
            <Mic2 className="w-5 h-5 text-melora-purple" />
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Lyrics
            </h2>
          </div>
          <p className="whitespace-pre-line text-sm md:text-base text-melora-textSecondary leading-loose font-medium">
            {song.lyrics}
          </p>
        </section>
      )}
    </main>
  );
}
