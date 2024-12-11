import { create } from 'zustand';

interface NotificationsStore {
  unreadMessages: number;
  fetchNotifications: (token: string) => Promise<void>;
}

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  unreadMessages: 0,
  fetchNotifications: async (token) => {
    try {
      const { axiosWithToken } = await import('../lib/axios');
      const res = await axiosWithToken(token).get('/api/notification/unread');
      set({ unreadMessages: res.data.unread || 0 });
    } catch (err) {
      console.error('Notification fetch error:', err);
    }
  },
}));
