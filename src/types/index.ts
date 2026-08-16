export type Role = "USER" | "ARTIST" | "SUPPORTER" | "ADMIN";
export type SubscriptionTier = "FREE" | "STANDARD" | "SILVER" | "GOLD";
export type Gender = "FEMALE" | "MALE" | "OTHER" | "UNSPECIFIED";

export interface UserPreferences {
  notifications_enabled: boolean;
  system_sound_enabled: boolean;
  language: string;
  high_quality: boolean;
  spatial_audio: boolean;
  offline_mode: boolean;
  private_session: boolean;
  data_saver: boolean;
  updated_at?: string;
}

export interface User {
  id: string;
  username?: string;
  email: string | null;
  password?: string;
  name: string;
  role: Role;
  tier: SubscriptionTier;
  birth_date?: string | null;
  gender?: Gender;
  profileImage?: string | null;
  bio?: string;
  followingIds?: string[];
  followerCount?: number;
  followingCount?: number;
  dailyStreams?: number | null;
  artistListeners?: number | null;
  artistStreams?: number | null;
  isVerified?: boolean;
  artistStatus?: "N/A" | "PENDING" | "APPROVED" | "REJECTED";
  artist_rejection_reason?: string;
  preferences?: UserPreferences;
}

export interface Song {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId?: string | null;
  albumTitle?: string | null;
  duration: number;
  src: string;
  listeners: number | null;
  streams?: number | null;
  releaseDate: string;
  isGoldOnly: boolean;
  lyrics?: string;
  genre?: string;
  coverUrl?: string | null;
  isLiked?: boolean;
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  releaseDate: string;
  genre?: string;
  coverUrl?: string | null;
  songCount: number;
  totalDuration: number;
  tracks: Song[];
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerName?: string;
  songIds: string[];
  tracks?: Song[];
  trackCount?: number;
  coverUrl?: string | null;
  is_public?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditObj {
  artistId: string;
  month: string;
  totalStreams: number;
  revenue: number;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface HomeResponse {
  user: User;
  recentPlaylists: Playlist[];
  latestAlbums: Album[];
  popularSongs: Song[];
  earlyAccess: Song[];
}
