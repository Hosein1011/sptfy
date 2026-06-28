import { storage } from '../src/lib/storage';
import { User, Playlist } from '../src/types';

describe('Playlist Storage Logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should restrict FREE users from creating more than 3 playlists', () => {
    const mockUser: User = {
      id: 'u1',
      email: 'test@test.com',
      name: 'Test User',
      role: 'USER',
      tier: 'FREE',
      followingIds: []
    };
    storage.saveUser(mockUser);

    storage.createPlaylist('p1', 'List 1', [], 'u1');
    storage.createPlaylist('p2', 'List 2', [], 'u1');
    storage.createPlaylist('p3', 'List 3', [], 'u1');

    expect(() => {
      storage.createPlaylist('p4', 'List 4', [], 'u1');
    }).toThrow("Free tier limited to 3 playlists.");
  });
});