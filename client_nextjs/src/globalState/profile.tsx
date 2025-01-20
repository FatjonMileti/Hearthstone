import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import axios from '../utils/axios';
import { IUser_Documents, UserNotifications } from '../view-components/MyAccount/user.interface';

interface ProfileBase {
  id: string;
  avatar?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  age: number;
  address: string;
  martial_status: string;
  have_pets: string;
  description: string;
  agreed_application_policy: boolean;
  signed_transaction_agreement: boolean;
  has_transaction_agreement: boolean;
  transaction_agreement_link: string | undefined;
  documents: IUser_Documents[];
  trust_score: number;
  has_completed_initial_setup: boolean | undefined;
  notification: UserNotifications;
}

export interface ProfileStore extends ProfileBase {
  fetchProfile: (access_token: string) => Promise<void>;
  setAvatar: (avatar: ProfileBase['avatar']) => void;
  reset: () => void;
}

const profileInitialState: ProfileBase = {
  id: '',
  avatar: undefined,
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: '',
  agreed_application_policy: false,
  signed_transaction_agreement: false,
  has_transaction_agreement: false,
  transaction_agreement_link: undefined,
  description: '',
  documents: [],
  trust_score: 0,
  age: 0,
  address: '',
  martial_status: '',
  have_pets: '',
  has_completed_initial_setup: undefined,

  notification: {
    email_updates: false,
    sms_updates: false,
    desktop_notification: false,
    offers_updates: false,
    news_updates: false
  }
};

export const useProfileStore = create<ProfileStore>()(
  devtools(
    persist(
      (set) => {
        const reset = () => {
          set(() => ({ ...profileInitialState }));
        };

        const setAvatar = (avatar: ProfileBase['avatar']) => {
          set((state) => ({ ...state, avatar }));
        };

        const fetchProfile = async (access_token: string) => {
          try {
            const { data } = await axios(access_token).get('/api/account/me');

            set((profile) => ({
              ...profile,

              id: data._id,
              avatar: data.avatar,
              first_name: data.first_name,
              last_name: data.last_name,
              email: data.email,
              phone: data.phone,
              role: data.role,
              description: data.description,
              agreed_application_policy: data.agreed_application_policy,
              signed_transaction_agreement: data.signed_transaction_agreement,
              has_transaction_agreement: data.has_transaction_agreement,
              transaction_agreement_link: data.transaction_agreement_link,
              documents: data.documents || [],
              trust_score: data.trust_score,
              age: data.age,
              address: data.address,
              martial_status: data.martial_status,
              have_pets: data.have_pets ? 'Yes' : 'No',
              has_completed_initial_setup: data?.has_completed_initial_setup,
              notification: data.notification
            }));
          } catch (err: any) {
            if (err.response.code === 404) {
              set(() => ({ ...profileInitialState }));
            }
            throw err;
          }
        };

        return {
          ...profileInitialState,
          setAvatar,
          reset,
          fetchProfile
        };
      },
      { name: 'profile' }
    ),
    {
      store: 'profile'
    }
  )
);
