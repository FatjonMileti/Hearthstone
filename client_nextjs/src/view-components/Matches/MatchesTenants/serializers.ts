export const mapTenant = ({
  criteria,
  chosen,
  matched,
  percentage,
  matchId,
  property,
  unread_messages,
  tenant
}: any) => ({
  id: criteria._id,
  criteria: mapCriteria(criteria),
  property,
  chosen,
  matched,
  percentage,
  matchId,
  unread_messages,
  _id: matchId,
  tenant
});

export const mapCriteria = (criteria: any) => {
  return {
    avatar: criteria.created_by.avatar,
    firstName: criteria.created_by.first_name,
    lastName: criteria.created_by.last_name,
    propertyType: (criteria?.property_type || []).join(', '),
    propertyPreferences: (criteria?.property_preferences || []).join(', '),
    areaOfInterest: criteria?.area_of_interest || '',
    radius: criteria?.radius ? `${criteria?.radius} mi` : '',
    moveIn: criteria?.moving_time || '',
    budget: criteria?.budget,
    nrOfBedrooms: criteria?.room_details?.number_of_bedrooms || '',
    nrOfBathrooms: criteria?.room_details?.number_of_bathrooms || '',
    specificPropertyFeatures: criteria?.specific_property_features || [],
    depositAmount: criteria?.deposit_amount || '',
    tenantId: criteria.created_by._id
  };
};
