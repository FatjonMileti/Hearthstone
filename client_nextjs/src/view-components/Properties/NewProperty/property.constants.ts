import * as yup from 'yup';
import { ObjectSchema } from 'yup';
import { PropertyFormType } from './property.types';
import { OtherSpecificPropertyFeature } from '../../SetCriteria/criteria.types';

export const PropertyType = {
  // Detached: 'Detached',
  // SemiDetached: 'Semi-Detached',
  // Terraced: 'Terraced',
  Flats: 'Apartment',
  // Bungalows: 'Bungalows',
  // ParkHomes: 'Park homes',
  // FarmsLand: 'Farms/Land',
  House: 'House'
} as const;

export const Floor = {
  Ground: 'Ground',
  First: 'First',
  AboveFirst: 'Above first',
  Penthouse: 'Penthouse'
} as const;
export const Parking = {
  All: 'All',
  Garage: 'Garage',
  OffStreet: 'Off street',
  OnStreet: 'On street'
} as const;

export const House = {
  Detached: 'Detached',
  SemiDetached: 'Semi-Detached',
  FarmsLand: 'Farms/Land'
} as const;

export const BuildPurpose = {
  PurposeBuilt: 'Purpose built',
  Conversion: 'Conversion'
} as const;
export enum Furnished {
  FullyFurnished = 'Fully furnished',
  PartiallyFurnished = 'Partially furnished',
  Unfurnished = 'Unfurnished'
}
export const OutsideSpace = {
  Garden: 'Garden',
  Balcony: 'Balcony',
  Terrace: 'Roof terrace'
} as const;
export const AreaUnit = {
  SquareMeter: 'sq.m',
  SquareFoot: 'sq.ft'
} as const;

export const Condition = {
  All: 'All',
  Furnished: 'Furnished',
  Unfurnished: 'Unfurnished',
  PartiallyFurnished: 'Partially furnished',
  NoPreference: 'No preference'
} as const;

export const propertyFormSchema: ObjectSchema<PropertyFormType> = yup.object().shape({
  title: yup.string().required('Title is required'),
  location: yup.object().shape({
    latitude: yup.number().optional(),
    longitude: yup.number().optional()
  }),
  minBudget: yup
    .number()
    .min(0, 'Must be greater then or equal to 0')
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('Minimum price is required'),
  maxBudget: yup
    .number()
    .min(0, 'Must be greater then or equal to 0')
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('Maximum price is required'),
  bedrooms: yup
    .number()
    .min(0, 'Must be greater then or equal to 0')
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('Number of bedrooms is required'),
  bathrooms: yup
    .number()
    .min(0, 'Must be greater then or equal to 0')
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('Number of bathrooms is required'),
  propertyType: yup.string().oneOf(Object.values(PropertyType)).required(),
  flatDetails: yup
    .object()
    .shape({
      propertyPurpose: yup
        .string()
        .transform((value) => value || undefined)
        .oneOf(Object.values(BuildPurpose)),
      floor: yup
        .string()
        .transform((value) => value || undefined)
        .oneOf(Object.values(Floor)),
      lift: yup.boolean().required(),
      security: yup.boolean().required(),
      gymSpa: yup.boolean().required(),
      outsideSpace: yup.object().shape({
        [OutsideSpace.Terrace]: yup.boolean().optional(),
        [OutsideSpace.Balcony]: yup.boolean().optional(),
        [OutsideSpace.Garden]: yup.boolean().optional()
      })
    })
    .optional(),
  houseDetails: yup.object().shape({
    houseType: yup
      .string()
      .transform((value) => value || undefined)
      .oneOf(Object.values(House))
  }),
  furniture: yup
    .string()
    .transform((value) => value || undefined)
    .oneOf(Object.values(Furnished)),
  specificPropertyFeatures: yup.object().shape({
    [OtherSpecificPropertyFeature.DoubleGlazing]: yup.boolean().required(),
    [OtherSpecificPropertyFeature.AllowsSmoking]: yup.boolean().required(),
    [OtherSpecificPropertyFeature.AllowsPets]: yup.boolean().required(),
    [OtherSpecificPropertyFeature.CloseToPublicTransport]: yup.boolean().required()
  }),
  area: yup
    .number()
    // .transform((value) => (isNaN(value) ? undefined : value))
    .transform((value) => value || undefined)
    .min(1)
    .required('Area is required'),
  areaUnit: yup.string().oneOf(Object.values(AreaUnit)).required(),
  parkingSpot: yup
    .string()
    .transform((value) => value || undefined)
    .required('Parking spot is required'),
  parkingType: yup
    .string()
    .transform((value) => value || undefined)
    .oneOf(Object.values(Parking)),
  epcRating: yup.string().required('EPC Rating is required'),
  condition: yup
    .string()
    .oneOf(Object.values(Condition))
    .transform((value) => value || undefined),
  description: yup.string().required('Description is required'),
  areaOfInterest: yup.string().required('Location is required'),
  propertyImages: yup.array().required()
});
