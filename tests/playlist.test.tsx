import { storage } from '../src/lib/storage';
import { User } from '../src/types';

describe('Playlist Storage Logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should restrict FREE users from creating more than 6 playlists', () => {
    const mockUser: User = {
      id: 'u1',
      email: 'test@test.com',
      name: 'Test User',
      role: 'USER',
      tier: 'FREE',
      followingIds: []
    };
    storage.saveUser(mockUser);

    for (let index = 1; index <= 6; index += 1) {
      storage.createPlaylist(`p${index}`, `List ${index}`, [], 'u1');
    }

    expect(() => {
      storage.createPlaylist('p7', 'List 7', [], 'u1');
    }).toThrow('Free tier limited to 6 playlists.');
  });
});
