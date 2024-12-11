import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CriteriaWithoutAccountStore {
  criteria: Partial<any>;
  setCriteria: (valueOrUpdater: Partial<any> | ((prev: Partial<any>) => Partial<any>)) => void;
}

export const useCriteriaWithoutAccountStore = create<CriteriaWithoutAccountStore>()(
  persist(
    (set) => ({
      criteria: {},
      setCriteria: (valueOrUpdater) => set((state) => ({
        criteria: typeof valueOrUpdater === 'function' ? valueOrUpdater(state.criteria) : valueOrUpdater,
      })),
    }),
    {
      name: 'criteria-without-account',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
