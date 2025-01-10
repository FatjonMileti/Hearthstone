import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { ApiCriteriaDocumentType } from '../pages/SetCriteria/criteria.types';
import { SetStateAction } from 'react';

type CriteriaType = Partial<ApiCriteriaDocumentType>;

type Callback = (prevState: CriteriaType) => CriteriaType;

export interface CriteriaStoreType {
  criteria: CriteriaType;
  setCriteria: (criteria: SetStateAction<CriteriaType> | Callback) => void;
}

export const useCriteriaWithoutAccountStore = create<CriteriaStoreType>()(
  devtools(
    persist(
      (setState) => ({
        criteria: {},
        setCriteria: (arg: CriteriaType | ((prevState: CriteriaType) => CriteriaType)) => {
          setState((prevState) => ({
            criteria:
              typeof arg === 'function'
                ? (arg as (prevState: CriteriaType) => CriteriaType)(prevState.criteria)
                : arg
          }));
        }
      }),

      { name: 'criteria-without-account' }
    ),
    {
      store: 'criteria-without-account'
    }
  )
);
