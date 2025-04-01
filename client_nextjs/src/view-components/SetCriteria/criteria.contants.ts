// @ts-nocheck
import * as yup from 'yup';
import { ObjectSchema } from 'yup';
import { CriteriaFormType, OtherSpecificPropertyFeature } from './criteria.types';
import {
  AreaUnit,
  BuildPurpose,
  Condition,
  Floor,
  Furnished,
  OutsideSpace,
  Parking,
  PropertyType
} from '../Properties/NewProperty/property.constants';

export const PropertyFeature = {
  ParksNearby: 'Parks nearby',
  PublicTransportNearby: 'Public transport nearby',
  ShoppingCentersNearby: 'Shopping centers nearby'
} as const;

export const LookingFor = {
  LookingForAPlace: 'I’m looking for a place',
  OwnAPlace: 'I own a place'
} as const;

export const HomeStyle = {
  All: 'All',
  Modern: 'Modern',
  Period: 'Period'
} as const;

export const BudgetFor = {
  Month: 'Month',
  Week: 'Week'
} as const;

export const DistanceUnit = {
  Km: 'km',
  Mi: 'mi'
} as const;

export const SpecificPropertyFeature = {
  ...Furnished,
  ...OtherSpecificPropertyFeature
} as const;

export const PropertyPreference = {
  NewHome: 'New home',
  RetirementHome: 'Retirement home',
  SharedOwnership: 'Shared ownership',
  Auction: 'Auction'
} as const;

export const House = {
  Detached: 'Detached',
  SemiDetached: 'Semi-Detached',
  // FarmsLand: 'Farms/Land'
} as const;

export const Transaction = {
  Rent: 'Rent',
  Sale: 'Sale'
} as const;

export const ContractDetail = {
  Guarantor: 'Guarantor',
  ReviewedProperty: 'Reviewed Property',
  EnergyCertificate: 'Energy Certificate'
} as const;

export const CreditScore = {
  Excellent: 'Excellent',
  Good: 'Good',
  Fair: 'Fair'
} as const;

export const WhenDoYouWantToMove = {
  Today: 'Today',
  ThisWeek: 'This week',
  AsSoonAsPossible: 'As soon as possible',
  ThisMonth: 'This month',
  // ImNotInARush: 'I’m not in a rush',
  ImNotInARush: 'Over a month'
} as const;

export const criteriaFormSchema: ObjectSchema<CriteriaFormType> = yup.object().shape({
  areaOfInterest: yup.string().required(),
  location: yup.object().shape({
    latitude: yup.number().required(),
    longitude: yup.number().required(),
  }),
  radius: yup.string().optional(),
  propertyType: yup.object().shape({
    [PropertyType.House]: yup.boolean().required(),
    [PropertyType.Flats]: yup.boolean().required(),
  }),
  houseType: yup.object().shape({
    [House.Detached]: yup.boolean().required(),
    [House.SemiDetached]: yup.boolean().required(),
    // [House.FarmsLand]: yup.boolean().required(),
  }),
  flatDetails: yup
    .object()
    .shape({
      propertyPurpose: yup
        .string()
        .transform((value) => value || undefined)
        .oneOf(Object.values(BuildPurpose)),
      preferredFloor: yup
        .string()
        .transform((value) => value || undefined)
        .oneOf(Object.values(Floor)),
      condition: yup.string().oneOf(Object.values(Condition)),

      preferredSize: yup.object().shape({
        size: yup.object().shape({
          min: yup.number().required(),
          max: yup.number().required(),
        }),
        unit: yup.string().oneOf(Object.values(AreaUnit)).required(),
      }),
      nrOfBedrooms: yup.object().shape({
        min: yup.number().required(),
        max: yup.number().required(),
      }),
      nrOfBathrooms: yup.object().shape({
        min: yup.number().required(),
        max: yup.number().required(),
      }),

      outsideSpace: yup.object().shape({
        [OutsideSpace.Balcony]: yup.boolean().required(),
        [OutsideSpace.Terrace]: yup.boolean().required(),
        [OutsideSpace.Garden]: yup.boolean().required(),
      }),
      lift: yup.boolean().required(),
      security: yup.boolean().required(),
      parkingSpace: yup.boolean().required(),
      gymSpa: yup.boolean().required(),
    })
    .optional(),
  houseDetails: yup.object().shape({
    houseType: yup.object().shape({
      [House.Detached]: yup.boolean().required(),
      [House.SemiDetached]: yup.boolean().required(),
      // [House.FarmsLand]: yup.boolean().required(),
    }),
    homeStyle: yup
      .string()
      .transform((value) => value || undefined)
      .oneOf(Object.values(HomeStyle)),
    preferredSize: yup.object().shape({
      size: yup.object().shape({
        min: yup.number().required(),
        max: yup.number().required(),
      }),
      unit: yup.string().oneOf(Object.values(AreaUnit)).required(),
    }),
    garden: yup.object().shape({
      size: yup.object().shape({
        min: yup.number().required(),
        max: yup.number().required(),
      }),
      unit: yup.string().oneOf(Object.values(AreaUnit)).required(),
    }),
    storeys: yup.object().shape({
      min: yup.number().required(),
      max: yup.number().required(),
    }),
    condition: yup.string().oneOf(Object.values(Condition)),
    nrOfBedrooms: yup.object().shape({
      min: yup.number().required(),
      max: yup.number().required(),
    }),
    nrOfBathrooms: yup.object().shape({
      min: yup.number().required(),
      max: yup.number().required(),
    }),
  }),
  propertyClass: yup.object().shape({
    'New home': yup.boolean().required(),
    'Retirement home': yup.boolean().required(),
    'Shared ownership': yup.boolean().required(),
    Auction: yup.boolean().required(),
  }),
  propertyFeatures: yup.object().shape({
    'Parks nearby': yup.boolean().required(),
    'Public transport nearby': yup.boolean().required(),
    'Shopping centers nearby': yup.boolean().required(),
  }),
  whenDoYouWantToMove: yup.string().oneOf(Object.values(WhenDoYouWantToMove)).optional(),
  transactionType: yup.string().oneOf(Object.values(Transaction)).required(),
  idealBudget: yup.array().required(),
  budgetFor: yup.string().oneOf(Object.values(BudgetFor)).required(),
  depositAmount: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .optional(),
  contractDetails: yup.object().shape({
    Guarantor: yup.boolean().required(),
    'Reviewed Property': yup.boolean().required(),
    'Energy Certificate': yup.boolean().required(),
  }),
  creditScore: yup.string().oneOf(Object.values(CreditScore)).required(),
  area: yup.array().required(),
  areaUnit: yup.string().oneOf(Object.values(AreaUnit)).required(),
  nrOfBedrooms: yup.array().required(),
  nrOfBathrooms: yup.array().required('Number of bathroom is required'),

  specificPropertyFeatures: yup.object().shape({
    [SpecificPropertyFeature.FullyFurnished]: yup.boolean().required(),
    [SpecificPropertyFeature.PartiallyFurnished]: yup.boolean().required(),
    [SpecificPropertyFeature.Unfurnished]: yup.boolean().required(),
    [SpecificPropertyFeature.DoubleGlazing]: yup.boolean().required(),
    [SpecificPropertyFeature.AllowsSmoking]: yup.boolean().required(),
    [SpecificPropertyFeature.AllowsPets]: yup.boolean().required(),
    [SpecificPropertyFeature.CloseToPublicTransport]: yup.boolean().required(),
  }),

  parkingType: yup.object().shape({
    [Parking.Garage]: yup.boolean().optional(),
    [Parking.OffStreet]: yup.boolean().optional(),
    [Parking.OnStreet]: yup.boolean().optional(),
  }),

  distanceFromUnderground: yup.object().shape({
    value: yup.number().positive(),
    unit: yup.string().oneOf(Object.values(DistanceUnit)).required(),
    min: yup.number().required(),
    max: yup.number().required(),
  }),
  distanceFromSchools: yup.object().shape({
    value: yup.number().positive(),
    unit: yup.string().oneOf(Object.values(DistanceUnit)).required(),
    min: yup.number().required(),
    max: yup.number().required(),
  }),
  distanceFromHighStreet: yup.object().shape({
    value: yup.number().positive(),
    unit: yup.string().oneOf(Object.values(DistanceUnit)).required(),
    min: yup.number().required(),
    max: yup.number().required(),
  }),
  distanceFromGym: yup.object().shape({
    value: yup.number().positive(),
    unit: yup.string().oneOf(Object.values(DistanceUnit)).required(),
    min: yup.number().required(),
    max: yup.number().required(),
  }),
});
