
import { User, Playlist, AuditObj, Song } from '../types';

const DB_KEYS = {
  USERS: 'sptfy_users',
  SONGS: 'sptfy_songs',
  PLAYLISTS: 'sptfy_playlists',
};

const getDB = <T>(key: string): T[] => JSON.parse(typeof window !== 'undefined' ? localStorage.getItem(key) || '[]' : '[]');
const setDB = <T>(key: string, data: T[]) => typeof window !== 'undefined' && localStorage.setItem(key, JSON.stringify(data));

export const storage = {
  saveUser: (user: User): void => {
    const users = getDB<User>(DB_KEYS.USERS);
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex > -1) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    setDB(DB_KEYS.USERS, users);
  },

  toggleFollow: (userId: string, targetId: string): void => {
    const users = getDB<User>(DB_KEYS.USERS);
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const isFollowing = user.followingIds.includes(targetId);
    if (isFollowing) {
      user.followingIds = user.followingIds.filter(id => id !== targetId);
    } else {
      user.followingIds.push(targetId);
    }
    storage.saveUser(user);
  },

  login: (email: string, pass: string): boolean => {
    const users = getDB<User>(DB_KEYS.USERS);
    return users.some(u => u.email === email && u.password === pass);
  },

  createPlaylist: (id: string, name: string, songs: string[], userId: string): Playlist => {
    const users = getDB<User>(DB_KEYS.USERS);
    const user = users.find(u => u.id === userId);
    
    const playlists = getDB<Playlist>(DB_KEYS.PLAYLISTS);
    const userPlaylists = playlists.filter(p => p.ownerId === userId);
    
    if (user?.tier === 'FREE' && userPlaylists.length >= 3) {
      throw new Error("Free tier limited to 3 playlists.");
    }

    const newPlaylist: Playlist = { id, name, ownerId: userId, songIds: songs };
    playlists.push(newPlaylist);
    setDB(DB_KEYS.PLAYLISTS, playlists);
    
    return newPlaylist;
  },

  getFinancialAudit: (month: string, artistId: string): AuditObj => {
    const REVENUE_PER_STREAM = 0.005; 
    const mockStreams = Math.floor(Math.random() * 100000); 
    
    return {
      artistId,
      month,
      totalStreams: mockStreams,
      revenue: mockStreams * REVENUE_PER_STREAM
    };
  },

  searchSongs: (query: string, searchBy: 'title' | 'artist' = 'title'): Song[] => {
    const songs = getDB<Song>(DB_KEYS.SONGS);
    return songs.filter(song => 
      searchBy === 'title' 
        ? song.title.toLowerCase().includes(query.toLowerCase())
        : song.artistName.toLowerCase().includes(query.toLowerCase())
    );
  },

  sortSongs: (songs: Song[], sortBy: 'listeners' | 'releaseDate'): Song[] => {
    return [...songs].sort((a, b) => {
      if (sortBy === 'listeners') return b.listeners - a.listeners;
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    });
  },

    getNotifications: (userId: string): Notification[] => {
    const notifications = getDB<Notification>('sptfy_notifications');
    return notifications.filter(n => n.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  markAllNotificationsAsRead: (userId: string): void => {
    const notifications = getDB<Notification>('sptfy_notifications');
    const updated = notifications.map(n => 
      n.userId === userId ? { ...n, isRead: true } : n
    );
    setDB('sptfy_notifications', updated);
  },

  deleteNotification: (notificationId: string): void => {
    const notifications = getDB<Notification>('sptfy_notifications');
    const filtered = notifications.filter(n => n.id !== notificationId);
    setDB('sptfy_notifications', filtered);
  }
};


