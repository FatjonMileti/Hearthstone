import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CriteriaStore {
  criteria: Partial<any>;
  setCriteria: (valueOrUpdater: Partial<any> | ((prev: Partial<any>) => Partial<any>)) => void;
  reset: () => void;
  fetchCriteria: (token: string) => Promise<void>;
}

export const useCriteriaStore = create<CriteriaStore>()(
  persist(
    (set) => ({
      criteria: {},
      setCriteria: (valueOrUpdater) => set((state) => ({
        criteria: typeof valueOrUpdater === 'function' ? valueOrUpdater(state.criteria) : valueOrUpdater,
      })),
      reset: () => set({ criteria: {} }),
      fetchCriteria: async (token) => {
        try {
          const { axiosWithToken } = await import('../lib/axios');
          const res = await axiosWithToken(token).get('/api/criteria');
          set({ criteria: res.data || {} });
        } catch (err: any) {
          if (err?.response?.status === 404) {
            set({ criteria: {} });
          } else {
            console.log('criteria error:', err);
          }
        }
      },
    }),
    {
      name: 'criteria',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
