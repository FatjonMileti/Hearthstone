import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthData {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  rules?: any;
  [key: string]: any;
}

interface UserStoreType {
  rememberMe: boolean;
  auth: AuthData | null;
  userDetails: any | null;
  ability: any | null;
  set: (partial: Partial<UserStoreType> | ((prev: UserStoreType) => Partial<UserStoreType>), replace?: boolean) => void;
}

export const useUserStore = create<UserStoreType>()(
  persist(
    (set) => ({
      rememberMe: false,
      auth: null,
      userDetails: null,
      ability: null,
      set,
    }),
    {
      name: 'userStore',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        rememberMe: state.rememberMe,
        auth: state.auth,
        userDetails: state.userDetails,
        ability: state.ability,
      }),
    }
  )
);
