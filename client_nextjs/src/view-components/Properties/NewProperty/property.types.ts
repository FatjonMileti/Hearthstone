import {
  AreaUnit,
  House,
  BuildPurpose,
  Floor,
  Furnished,
  OutsideSpace,
  Parking,
  PropertyType,
  Condition
} from './property.constants';
import {
  ContractDetailType,
  CreditScoreType,
  DistanceType,
  PropertyFeatureType,
  PropertyPreferenceType,
  TransactionType
} from '../../SetCriteria/criteria.types';
import { OtherSpecificPropertyFeature } from '../../SetCriteria/criteria.types';

export type OutsideSpaceType = ObjectValues<typeof OutsideSpace>;
export type AreaUnitType = ObjectValues<typeof AreaUnit>;
export type ConditionType = ObjectValues<typeof Condition>;

export type PropertyFormType = {
  title: string;
  location: {
    latitude?: number;
    longitude?: number;
  };
  minBudget: number;
  maxBudget: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: PropertyTypeType;
  flatDetails?: {
    propertyPurpose?: BuildPurposeType;
    floor?: FloorType;
    lift: boolean;
    security: boolean;
    gymSpa: boolean;
    outsideSpace: {
      [key in OutsideSpaceType]?: boolean;
    };
  };
  houseDetails: {
    houseType?: HouseType;
  };
  furniture?: Furnished;
  specificPropertyFeatures: {
    [key in OtherSpecificPropertyFeature]: boolean;
  };
  area: number;
  areaUnit: AreaUnitType;
  parkingSpot: string;
  parkingType?: ParkingType;
  epcRating: string;
  condition?: ConditionType;
  description: string;
  areaOfInterest: string;
  propertyImages: any[];
};

declare type ObjectValues<T> = T[keyof T];

export type ParkingType = ObjectValues<typeof Parking>;

export type HouseType = ObjectValues<typeof House>;

export type BuildPurposeType = ObjectValues<typeof BuildPurpose>;

export type FloorType = ObjectValues<typeof Floor>;

export type PropertyTypeType = ObjectValues<typeof PropertyType>;

export interface ApiPropertyDocumentType {
  _id: string;
  name: string;
  area_of_interest: string;
  radius: string;
  description: string;
  title: string;
  percentage?: number | string;
  asset_address: {
    latitude?: number;
    longitude?: number;
  };
  distance_from_underground: DistanceType;
  distance_from_schools: DistanceType;
  distance_from_high_street: DistanceType;
  distance_from_gym: DistanceType;
  status_string: string;
  transaction_type_string: TransactionType;
  property_type: PropertyTypeType;
  outside_space: OutsideSpaceType[];
  flat_details: {
    property_purpose?: BuildPurposeType;
    floor?: FloorType;
    lift: boolean;
    security: boolean;
    gym_spa: boolean;
    outside_space: OutsideSpaceType[];
  };
  house_details: {
    house_type?: HouseType;
  };
  parking_details?: ParkingType;
  asset_attribute: any[];
  room_details: {
    number_of_bathrooms: number;
    number_of_bedrooms: number;
  };
  budget: {
    min_budget: number;
    max_budget: number;
  };
  parking_spot: number;
  epc_rating: string;
  condition?: ConditionType;
  location_details: string;
  floor_size: number;
  floor_size_unit: AreaUnitType;
  property_features: PropertyFeatureType[];
  property_preference: PropertyPreferenceType;
  asset_rent: {
    rental_amount: number;
    rental_frequency: string;
    deposit_amount: number;
    interest_by: Date;
    available_from: Date;
  };
  statistics: any;
  specific_property_features: (OtherSpecificPropertyFeature | Furnished)[];
  property_images: { link: string }[];
  credit_score_requirements: CreditScoreType;
  contract_details: ContractDetailType[];
  settings: any;
  edited_at?: Date;
  edited_by?: string;
  created_at: Date;
  created_by?: string;
}
