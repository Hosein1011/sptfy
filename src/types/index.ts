
export type Role = 'USER' | 'ARTIST' | 'SUPPORTER' | 'ADMIN';
export type SubscriptionTier = 'FREE' | 'STANDARD' | 'GOLD';

export interface User {
  id: string;
  email: string;
  password?: string; login
  name: string;
  role: Role;
  tier: SubscriptionTier;
  followingIds: string[];
  isVerified?: boolean; 
}

export interface Song {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId?: string;
  duration: number;
  listeners: number;
  releaseDate: string;
  isGoldOnly: boolean;
  lyrics?: string;
}

export interface Playlist {
  id: string;
  name: string;
  ownerId: string;
  songIds: string[];
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
  isRead: boolean;
  createdAt: string;
}