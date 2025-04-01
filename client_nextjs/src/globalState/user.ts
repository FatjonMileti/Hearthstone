import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserStoreType = {
  rememberMe: boolean;
  auth:
    | {
        access_token: string;
      }
    | any;
  userDetails: { user_id: string } | any;
  ability: any;
  set: (
    partial:
      | UserStoreType
      | Partial<UserStoreType>
      | ((state: UserStoreType) => UserStoreType | Partial<UserStoreType>),
    replace?: boolean | undefined
  ) => void;
};

const userInitialState = {
  rememberMe: false,
  auth: null,
  userDetails: null,
  ability: null
};

export const useUserStore = create<UserStoreType>()(
  persist(
    (set) => ({
      ...userInitialState,
      set
    }),
    { name: 'userStore' }
  )
);
