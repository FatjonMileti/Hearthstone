import { Role } from '../../enums.ts';

export enum DocumentType {
  'Employer reference' = 'Employer reference',
  'Landlord reference' = 'Landlord reference',
  'Proof of ID' = 'Proof of ID'
}

export interface IUser_Documents {
  type: DocumentType;
  key: string;
  approved: boolean;
  mimetype: string;
  originalName: string;
  link?: string;
}

export const DOCUMENT_TYPES: IUser_Documents[] = [
  {
    type: DocumentType['Proof of ID'],
    key: '',
    link: '',
    approved: false,
    mimetype: '',
    originalName: ''
  },
  {
    type: DocumentType['Employer reference'],
    key: '',
    link: '',
    approved: false,
    mimetype: '',
    originalName: ''
  },
  {
    type: DocumentType['Landlord reference'],
    key: '',
    link: '',
    approved: false,
    mimetype: '',
    originalName: ''
  }
];

export interface UserNotifications {
  email_updates: boolean;
  sms_updates: boolean;
  desktop_notification: boolean;
  offers_updates: boolean;
  news_updates: boolean;
}

export interface ApiUserDocumentType {
  _id: string;
  user_id: number;
  hash: string;
  role: Role;
  email: string;
  first_name: string;
  last_name: string;
  is_disabled: boolean;
  google: {
    username: string;
    google_user_id: string;
    is_google_verified: boolean;
  };
  facebook: {
    username: string;
    facebook_user_id: string;
    is_facebook_verified: boolean;
  };
  twitter: {
    username: string;
    twitter_user_id: string;
    is_twitter_verified: boolean;
  };
  phone: string;
  description: string;
  avatar: string;
  notification: UserNotifications;
  documents: any[];
  confirmation_token?: string;
  last_login: Date;
}
