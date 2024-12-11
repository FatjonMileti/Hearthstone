import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ProfileBase {
  id?: string;
  avatar?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  description?: string;
  trust_score?: number;
  has_completed_initial_setup?: boolean;
  [key: string]: any;
}

interface ProfileStoreType extends ProfileBase {
  fetchProfile: (access_token: string) => Promise<void>;
  setAvatar: (avatar: string) => void;
  reset: () => void;
}

const initialState: ProfileBase = {
  id: undefined,
  avatar: undefined,
  first_name: undefined,
  last_name: undefined,
  email: undefined,
  role: undefined,
  trust_score: undefined,
  has_completed_initial_setup: false,
};

export const useProfileStore = create<ProfileStoreType>()(
  persist(
    (set) => ({
      ...initialState,
      fetchProfile: async (token) => {
        try {
          const { axiosWithToken } = await import('../lib/axios');
          const res = await axiosWithToken(token).get('/api/account/me');
          set({ ...res.data, ...res.data.userDetails, role: res.data.userDetails?.role });
        } catch (err) {
          console.error('Profile fetch error:', err);
          throw err;
        }
      },
      setAvatar: (avatar) => set({ avatar }),
      reset: () => set(initialState),
    }),
    {
      name: 'profile',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
