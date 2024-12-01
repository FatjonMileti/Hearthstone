import { create } from 'zustand';

interface UserState {
  auth: any | null;
  userDetails: any | null;
}

export const useUserStore = create<UserState>()((set) => ({
  auth: null,
  userDetails: null,
  set: (partial: Partial<UserState>) => set(partial),
}));
