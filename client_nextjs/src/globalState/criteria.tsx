import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import axios from '../utils/axios';
import { ApiCriteriaDocumentType } from '../view-components/SetCriteria/criteria.types';
import { SetStateAction } from 'react';

type CriteriaType = Partial<ApiCriteriaDocumentType>;

type Callback = (prevState: CriteriaType) => CriteriaType;

export interface CriteriaStoreType {
  fetchCriteria: (access_token: string) => Promise<void>;
  reset: () => void;
  criteria: CriteriaType;
  setCriteria: (criteria: SetStateAction<CriteriaType> | Callback) => void;
}

export const useCriteriaStore = create<CriteriaStoreType>()(
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
        },
        reset: () =>
          setState(() => ({
            criteria: {}
          })),

        fetchCriteria: async (access_token: string) => {
          try {
            const { data } = await axios(access_token).get<ApiCriteriaDocumentType>('/api/criteria');

            setState(() => ({
              criteria: {
                ...data
              }
            }));
          } catch (err: any) {
            if (err.response.status === 404) {
              setState(() => ({
                criteria: {}
              }));
            } else {
              console.log('criteria error: ', err.response.status);
            }
          }
        }
      }),

      { name: 'criteria' }
    ),
    {
      store: 'criteria'
    }
  )
);
