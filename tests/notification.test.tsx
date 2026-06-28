import { storage } from '../src/lib/storage';
import { Notification } from '../src/types';

describe('Notification Storage Logic', () => {
  const mockNotifications: Notification[] = [
    { id: 'n1', userId: 'u1', message: 'Welcome!', isRead: false, createdAt: '2026-01-01' },
    { id: 'n2', userId: 'u1', message: 'New Ticket!', isRead: false, createdAt: '2026-01-02' }
  ];

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('sptfy_notifications', JSON.stringify(mockNotifications));
  });

  it('should mark all notifications as read for a specific user', () => {
    storage.markAllNotificationsAsRead('u1');
    
    const notifs = storage.getNotifications('u1');
    expect(notifs.every(n => n.isRead === true)).toBe(true);
  });

  it('should delete a notification correctly', () => {
    storage.deleteNotification('n1');
    
    const notifs = storage.getNotifications('u1');
    expect(notifs.length).toBe(1);
    expect(notifs[0].id).toBe('n2');
  });
});