import { ApiPropertyDocumentType } from '../Properties/NewProperty/property.types';
import { ApiUserDocumentType } from '../MyAccount/user.interface';
import { ApiCriteriaDocumentType } from '../SetCriteria/criteria.types';

interface IChatUser {
  first_name: string;
  last_name: string;
  username: string;
  _id: string;
  avatar?: string;
}

interface ILastMessage {
  message: string;
  created_at?: string;
}

export interface IMessageBody {
  room_id: string;
  message: string;
  sender: string;
}

export interface IMessageItem extends IMessageBody {
  participant: string;
  author: any;
  time: string;
  sender: any;
  isCurrentUser?: boolean;
}

export interface IRoom {
  author: IChatUser;
  participant: IChatUser;
  last_message?: ILastMessage | null;
  property: Partial<ApiPropertyDocumentType>;
  _id: string;
  unseen_messages?: number;
  property_match?: PropertyMatch;
  tenant_match?: TenantMatch;
}

export interface PropertyMatch {
  _id: string;
  created_at: string;
  landlord: Partial<ApiUserDocumentType>;
  unmatched: boolean;
}

export interface TenantMatch {
  _id: string;
  created_at: string;
  criteria: ApiCriteriaDocumentType;
  tenant: Partial<ApiUserDocumentType>;
  unmatched: boolean;
}
