import { create } from "zustand";
import { Song } from "../types";
import { useAuthStore } from "./authStore";

type RepeatMode = "OFF" | "ALL" | "ONE";

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  shuffleMode: boolean;
  repeatMode: RepeatMode;
  currentTime: number;
  duration: number;
  volume: number;
  playSong: (song: Song) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;
  togglePlay: () => void;
  setIsPlaying: (value: boolean) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (time: number) => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  nextSong: () => void;
  previousSong: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  queue: [],
  isPlaying: false,
  shuffleMode: false,
  repeatMode: "OFF",
  currentTime: 0,
  duration: 0,
  volume: 80,

  playSong: (song) => {
    const user = useAuthStore.getState().user;

    if (song.isGoldOnly && user?.tier !== "GOLD") {
      console.warn("Access Denied: This is a GOLD only song.");
      return;
    }

    set((state) => {
      const filteredQueue = state.queue.filter((item) => item.id !== song.id);

      return {
        currentSong: song,
        queue: [song, ...filteredQueue],
        isPlaying: true,
        currentTime: 0,
        duration: 0,
      };
    });
  },

  addToQueue: (song) =>
    set((state) => {
      const exists = state.queue.some((item) => item.id === song.id);
      if (exists) {
        return {};
      }

      return {
        queue: [...state.queue, song],
      };
    }),

  removeFromQueue: (songId) =>
    set((state) => ({
      queue: state.queue.filter((song) => song.id !== songId),
    })),

  clearQueue: () =>
    set({
      queue: [],
    }),

  togglePlay: () =>
    set((state) => ({
      isPlaying: !state.isPlaying,
    })),

  setIsPlaying: (value) =>
    set({
      isPlaying: value,
    }),

  toggleShuffle: () =>
    set((state) => ({
      shuffleMode: !state.shuffleMode,
    })),

  cycleRepeat: () =>
    set((state) => ({
      repeatMode:
        state.repeatMode === "OFF"
          ? "ALL"
          : state.repeatMode === "ALL"
            ? "ONE"
            : "OFF",
    })),

  setCurrentTime: (time) =>
    set({
      currentTime: time,
    }),

  setDuration: (time) =>
    set({
      duration: time,
    }),

  seekTo: (time) =>
    set({
      currentTime: time,
    }),

  setVolume: (volume) =>
    set({
      volume: Math.max(0, Math.min(100, volume)),
    }),

  nextSong: () => {
    const { queue, currentSong, repeatMode, shuffleMode } = get();

    if (queue.length === 0) {
      set({
        isPlaying: false,
        currentTime: 0,
      });
      return;
    }

    if (shuffleMode && queue.length > 1) {
      const currentId = currentSong?.id;
      const availableSongs = queue.filter((song) => song.id !== currentId);
      const randomSong =
        availableSongs[Math.floor(Math.random() * availableSongs.length)];

      if (randomSong) {
        set({
          currentSong: randomSong,
          isPlaying: true,
          currentTime: 0,
          duration: 0,
        });
      }
      return;
    }

    const currentIndex = currentSong
      ? queue.findIndex((song) => song.id === currentSong.id)
      : -1;

    const nextIndex = currentIndex < 0 ? 0 : currentIndex + 1;

    if (nextIndex >= queue.length) {
      if (repeatMode === "ALL") {
        set({
          currentSong: queue[0],
          isPlaying: true,
          currentTime: 0,
          duration: 0,
        });
      } else {
        set({
          isPlaying: false,
          currentTime: 0,
        });
      }
      return;
    }

    set({
      currentSong: queue[nextIndex],
      isPlaying: true,
      currentTime: 0,
      duration: 0,
    });
  },

  previousSong: () => {
    const { queue, currentSong } = get();

    if (queue.length === 0) {
      return;
    }

    const currentIndex = currentSong
      ? queue.findIndex((song) => song.id === currentSong.id)
      : -1;

    const previousIndex = currentIndex <= 0 ? 0 : currentIndex - 1;

    set({
      currentSong: queue[previousIndex],
      isPlaying: true,
      currentTime: 0,
      duration: 0,
    });
  },
}));
