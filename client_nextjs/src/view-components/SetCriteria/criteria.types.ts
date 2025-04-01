import {
  BudgetFor,
  ContractDetail,
  CreditScore,
  DistanceUnit,
  HomeStyle,
  House,
  LookingFor,
  PropertyFeature,
  PropertyPreference,
  SpecificPropertyFeature,
  Transaction,
  WhenDoYouWantToMove
} from './criteria.contants';
import {
  AreaUnitType,
  BuildPurposeType,
  FloorType,
  OutsideSpaceType,
  ParkingType,
  PropertyTypeType
} from '../Properties/NewProperty/property.types';
import { Condition } from '../Properties/NewProperty/property.constants';

declare type ObjectValues<T> = T[keyof T];

export type Range = {
  min: number;
  max: number;
};

export enum OtherSpecificPropertyFeature {
  DoubleGlazing = 'Double glazing',
  AllowsSmoking = 'Allows smoking',
  AllowsPets = 'Allows pets',
  CloseToPublicTransport = 'Close to public transport'
}

export type CriteriaFormType = {
  areaOfInterest: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  radius?: string;
  propertyType: {
    [key in PropertyTypeType]: boolean;
  };
  flatDetails?: {
    propertyPurpose?: BuildPurposeType;
    preferredFloor?: FloorType;
    condition?: ConditionType;
    outsideSpace: {
      [key in OutsideSpaceType]: boolean;
    };

    preferredSize: {
      size: Range;
      unit: AreaUnitType;
    };
    nrOfBedrooms: Range;
    nrOfBathrooms: Range;

    lift: boolean;
    security: boolean;
    parkingSpace: boolean;
    gymSpa: boolean;
  };
  houseDetails?: {
    houseType?: {
      [key in HouseType]: boolean;
    };
    homeStyle?: HomeStyleType;
    preferredSize?: {
      size: Range;
      unit: AreaUnitType;
    };
    garden: {
      size: Range;
      unit: AreaUnitType;
    };
    parking?: ParkingType;
    storeys: Range;
    nrOfBedrooms: Range;
    nrOfBathrooms: Range;
    condition?: ConditionType;
  };
  propertyClass: {
    'New home': boolean;
    'Retirement home': boolean;
    'Shared ownership': boolean;
    Auction: boolean;
  };
  propertyFeatures: {
    'Parks nearby': boolean;
    'Public transport nearby': boolean;
    'Shopping centers nearby': boolean;
  };
  whenDoYouWantToMove?: WhenDoYouWantToMoveType;
  transactionType: TransactionType;
  idealBudget: number[];
  budgetFor: BudgetForType;
  depositAmount?: number;
  contractDetails: {
    [key in ContractDetailType]: boolean;
  };
  creditScore: CreditScoreType;
  area: number[];
  areaUnit: AreaUnitType;
  nrOfBedrooms: number[];
  nrOfBathrooms: number[];
  specificPropertyFeatures: {
    [key in SpecificPropertyFeatureType]: boolean;
  };
  parkingType: {
    [key in ParkingType]?: boolean;
  };
  distanceFromUnderground: DistanceType;
  distanceFromSchools: DistanceType;
  distanceFromHighStreet: DistanceType;
  distanceFromGym: DistanceType;
};

export type DistanceUnitType = ObjectValues<typeof DistanceUnit>;

export type DistanceType = {
  value?: {
    min?: number,
    max?: number
  };
  unit: DistanceUnitType;
};

export type SpecificPropertyFeatureType = ObjectValues<typeof SpecificPropertyFeature>;

export type PropertyPreferenceType = ObjectValues<typeof PropertyPreference>;
export type TransactionType = ObjectValues<typeof Transaction>;

export type ContractDetailType = ObjectValues<typeof ContractDetail>;

export type CreditScoreType = ObjectValues<typeof CreditScore>;

type WhenDoYouWantToMoveType = ObjectValues<typeof WhenDoYouWantToMove>;

export type BudgetForType = ObjectValues<typeof BudgetFor>;

export type HomeStyleType = ObjectValues<typeof HomeStyle>;

export type ConditionType = ObjectValues<typeof Condition>;

export type HouseType = ObjectValues<typeof House>;

export type LookingForType = ObjectValues<typeof LookingFor>;

export type PropertyFeatureType = ObjectValues<typeof PropertyFeature>;

export type ApiCriteriaDocumentType = {
  area_of_interest: string;
  asset_address?: {
    latitude?: number;
    longitude?: number;
  };
  radius?: string;
  budget_for: BudgetForType;

  property_type: PropertyTypeType[];

  house_details: {
    house_type: HouseType[];
    home_style?: HomeStyleType;
    preferred_size?: {
      size: Range;
      unit: AreaUnitType;
    };
    condition?: ConditionType;
    parking?: ParkingType;
    garden: {
      size: Range;
      unit: AreaUnitType;
    };
    storeys: Range;
    number_of_bathrooms: Range;
    number_of_bedrooms: Range;
  };

  flat_details: {
    property_purpose?: BuildPurposeType;
    preferred_floor?: FloorType;
    condition?: ConditionType;
    outside_space: OutsideSpaceType[];
    preferred_size: {
      size: Range;
      unit: AreaUnitType;
    };
    number_of_bathrooms: Range;
    number_of_bedrooms: Range;
    lift: boolean;
    security: boolean;
    parking_space: boolean;
    gym_spa: boolean;
  };

  property_preferences: string[];
  property_features: PropertyFeatureType[];
  floor_size: string;
  room_details: {
    number_of_bathrooms: string;
    number_of_bedrooms: string;
  };
  specific_property_features: string[];
  parking_details: ParkingType[];

  distance_from_underground: {
    value: Range;
    unit: DistanceUnitType;
  };
  distance_from_schools: {
    value: Range;
    unit: DistanceUnitType;
  };
  distance_from_high_street: {
    value: Range;
    unit: DistanceUnitType;
  };
  distance_from_gym: {
    value: Range;
    unit: DistanceUnitType;
  };

  outside_space: OutsideSpaceType[];
  budget: Range;
  deposit_amount?: number;
  contract_details: string[];
  credit_score_requirements: CreditScoreType;
  transaction_type_string: TransactionType;
  floor_size_unit: AreaUnitType;
  currency_code: string;
  looking_for: LookingForType;
  moving_time?: WhenDoYouWantToMoveType;
};

