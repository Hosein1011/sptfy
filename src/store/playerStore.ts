// src/store/playerStore.ts
import { create } from 'zustand';
import { Song } from '../types';
import { useAuthStore } from './authStore'; // برای دسترسی به استیت کاربر

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  shuffleMode: boolean;
  repeatMode: 'OFF' | 'ALL' | 'ONE';
  playSong: (song: Song) => void;
  addToQueue: (song: Song) => void;
  togglePlay: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentSong: null,
  queue: [],
  isPlaying: false,
  shuffleMode: false,
  repeatMode: 'OFF',

  playSong: (song) => {
    const user = useAuthStore.getState().user;
    
    if (song.isGoldOnly && (!user || user.tier !== 'GOLD')) {
      console.warn("Access Denied: This content requires a GOLD subscription.");
      return;
    }

    set({ currentSong: song, isPlaying: true });
  },
  
  addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  toggleShuffle: () => set((state) => ({ shuffleMode: !state.shuffleMode })),
  
  cycleRepeat: () => set((state) => {
    const modes: ('OFF' | 'ALL' | 'ONE')[] = ['OFF', 'ALL', 'ONE'];
    const currentIndex = modes.indexOf(state.repeatMode);
    return { repeatMode: modes[(currentIndex + 1) % modes.length] };
  })
}));