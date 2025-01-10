import { create } from 'zustand';
import request from '../utils/axios';
import { devtools } from 'zustand/middleware';

export type NotificationsStoreType = {
  unreadMessages: number;
  fetchNotifications: (access_token: string) => Promise<void>;
};

const notificationsInitialState = {
  unreadMessages: 0
};

export const useNotificationsStore = create<NotificationsStoreType>()(
  devtools(
    (set) => {
      return {
        ...notificationsInitialState,
        fetchNotifications: async (access_token: string) => {
          try {
            const response = await request(access_token).get('/api/notification/unread');
            set({
              unreadMessages: response?.data?.unread
            });
          } catch (err) {
            throw err;
          }
        }
      };
    },
    {
      store: 'notifications'
    }
  )
);
