import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserStoreType = {
  rememberMe: boolean;
  auth: { access_token: string } | null;
  userDetails: { user_id: string } | null;
  ability: any;
  set: (partial: Partial<UserStoreType>) => void;
};

export const useUserStore = create<UserStoreType>()(
  persist(
    (set) => ({
      rememberMe: false,
      auth: null,
      userDetails: null,
      ability: null,
      set: (partial) => set((state) => ({ ...state, ...partial })),
    }),
    { name: 'userStore' }
  )
);
