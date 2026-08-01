import { User, Playlist, AuditObj, Song, Notification } from "../types";

const DB_KEYS = {
  USERS: "sptfy_users",
  SONGS: "sptfy_songs",
  PLAYLISTS: "sptfy_playlists",
  NOTIFICATIONS: "sptfy_notifications",
  CURRENT_USER: "currentUser",
};

const getDB = <T>(key: string): T[] => {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const setDB = <T>(key: string, data: T[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

const normalize = (value: string) => value.trim().toLowerCase();

const DEFAULT_USERS: User[] = [
  {
    id: "admin-1",
    name: "Sptfy Admin",
    email: "admin@sptfy.app",
    password: "Admin@12345",
    role: "ADMIN",
    tier: "GOLD",
    followingIds: [],
    isVerified: true,
  },
  {
    id: "artist-1",
    name: "Luna Echo",
    email: "artist@sptfy.app",
    password: "Artist@12345",
    role: "ARTIST",
    tier: "GOLD",
    followingIds: [],
    isVerified: true,
  },
];

const ensureDefaultUsers = (): User[] => {
  const users = getDB<User>(DB_KEYS.USERS);
  let changed = false;

  for (const defaultUser of DEFAULT_USERS) {
    const exists = users.some(
      (u) =>
        u.id === defaultUser.id ||
        normalize(u.name) === normalize(defaultUser.name) ||
        normalize(u.email) === normalize(defaultUser.email)
    );

    if (!exists) {
      users.push(defaultUser);
      changed = true;
    }
  }

  if (changed) {
    setDB(DB_KEYS.USERS, users);
  }

  return users;
};

export const storage = {
  ensureDefaultUsers,

  saveUser: (user: User): void => {
    const users = ensureDefaultUsers();
    const existingIndex = users.findIndex((u) => u.id === user.id);

    if (existingIndex > -1) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }

    setDB(DB_KEYS.USERS, users);
  },

  toggleFollow: (userId: string, targetId: string): void => {
    const users = ensureDefaultUsers();
    const user = users.find((u) => u.id === userId);

    if (!user) return;

    const isFollowing = user.followingIds.includes(targetId);

    if (isFollowing) {
      user.followingIds = user.followingIds.filter((id) => id !== targetId);
    } else {
      user.followingIds.push(targetId);
    }

    storage.saveUser(user);
  },

  login: (identifier: string, pass: string): boolean => {
    const users = ensureDefaultUsers();
    const key = normalize(identifier);

    const matchedUser = users.find(
      (u) =>
        (normalize(u.name) === key || normalize(u.email) === key) &&
        (u.password || "") === pass
    );

    if (!matchedUser) return false;

    storage.setCurrentUser(matchedUser);
    return true;
  },

  getUserByIdentifier: (identifier: string): User | null => {
    const users = ensureDefaultUsers();
    const key = normalize(identifier);

    return (
      users.find(
        (u) => normalize(u.name) === key || normalize(u.email) === key
      ) || null
    );
  },

  getUserByName: (name: string): User | null => {
    const users = ensureDefaultUsers();
    const key = normalize(name);

    return users.find((u) => normalize(u.name) === key) || null;
  },

  getUsers: (): User[] => {
    return ensureDefaultUsers();
  },

  createPlaylist: (
    id: string,
    name: string,
    songs: string[],
    userId: string
  ): Playlist => {
    const users = ensureDefaultUsers();
    const user = users.find((u) => u.id === userId);

    const playlists = getDB<Playlist>(DB_KEYS.PLAYLISTS);
    const userPlaylists = playlists.filter((p) => p.ownerId === userId);

    if (user?.tier === "FREE" && userPlaylists.length >= 3) {
      throw new Error("Free tier limited to 3 playlists.");
    }

    const newPlaylist: Playlist = {
      id,
      name,
      ownerId: userId,
      songIds: songs,
    };

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
      revenue: mockStreams * REVENUE_PER_STREAM,
    };
  },

  searchSongs: (
    query: string,
    searchBy: "title" | "artist" = "title"
  ): Song[] => {
    const songs = getDB<Song>(DB_KEYS.SONGS);
    const normalizedQuery = query.toLowerCase();

    return songs.filter((song) =>
      searchBy === "title"
        ? song.title.toLowerCase().includes(normalizedQuery)
        : song.artistName.toLowerCase().includes(normalizedQuery)
    );
  },

  sortSongs: (songs: Song[], sortBy: "listeners" | "releaseDate"): Song[] => {
    return [...songs].sort((a, b) => {
      if (sortBy === "listeners") return b.listeners - a.listeners;
      return (
        new Date(b.releaseDate).getTime() -
        new Date(a.releaseDate).getTime()
      );
    });
  },

  getNotifications: (userId: string): Notification[] => {
    const notifications = getDB<Notification>(DB_KEYS.NOTIFICATIONS);

    return notifications
      .filter((n) => n.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  },

  markAllNotificationsAsRead: (userId: string): void => {
    const notifications = getDB<Notification>(DB_KEYS.NOTIFICATIONS);

    const updated = notifications.map((n) =>
      n.userId === userId ? { ...n, isRead: true } : n
    );

    setDB(DB_KEYS.NOTIFICATIONS, updated);
  },

  deleteNotification: (notificationId: string): void => {
    const notifications = getDB<Notification>(DB_KEYS.NOTIFICATIONS);
    const filtered = notifications.filter((n) => n.id !== notificationId);
    setDB(DB_KEYS.NOTIFICATIONS, filtered);
  },

  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null;

    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER) || "null");
    } catch {
      return null;
    }
  },

  setCurrentUser: (user: User): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
    }
  },

  logout: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DB_KEYS.CURRENT_USER);
    }
  },
};
