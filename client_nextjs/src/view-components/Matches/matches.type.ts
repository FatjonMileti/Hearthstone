import { ApiPropertyDocumentType } from '../Properties/NewProperty/property.types';
import { ApiUserDocumentType } from '../MyAccount/user.interface';

export interface SuggestedPropertyType {
  property: Omit<ApiPropertyDocumentType, 'created_by'> & {
    created_by: ApiUserDocumentType;
    percentage: string;
  };
  matchId?: string;
  chosen: boolean;
  matched: boolean;
}

export interface SuggestedTenantType {
  id: string;
  criteria: any;
  property: ApiPropertyDocumentType | any;
  percentage: number;
  chosen: boolean;
  matched: boolean;
  unread_messages: number;
  matchId?: string;
}

export interface MatchedPropertyType {
  id: string;
  criteria: any;
  property: ApiPropertyDocumentType | any;
  landlord: {
    avatar: string;
    first_name: string;
    last_name: string;
    _id: string;
  };
  chosen: boolean;
  matched: boolean;
  unread_messages: number;
  matchId: string;
  _id: string;
}

export interface MatchedTenantType {
  id: string;
  criteria: any;
  property: ApiPropertyDocumentType | any;
  chosen: boolean;
  matched: boolean;
  unread_messages: number;
  matchId: string;
  percentage: number;
  _id: string;
  tenant: {
    avatar: string;
    first_name: string;
    last_name: string;
    _id: string;
  };
}
