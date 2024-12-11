import { create } from 'zustand';

interface GlobalSetCriteriaStore {
  visibility: boolean;
  afterSetCriteria?: () => any;
  openSetCriteria: (options?: { afterSetCriteria?: () => any }) => void;
  closeSetCriteria: () => void;
}

export const useGlobalSetCriteria = create<GlobalSetCriteriaStore>((set) => ({
  visibility: false,
  afterSetCriteria: undefined,
  openSetCriteria: (options) => set({ visibility: true, afterSetCriteria: options?.afterSetCriteria }),
  closeSetCriteria: () => set({ visibility: false, afterSetCriteria: undefined }),
}));
