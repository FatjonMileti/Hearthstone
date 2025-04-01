import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';

import { Modal } from '../../../components/Modal';
import { Typography } from '../../../components/Typography';
import { Button } from '../../../components/Button';
import { Icon } from '../../../components/Icon';
import { CloseButton } from '../../../components/CloseButton';

import { PropertyForm } from './PropertyForm';
import { usePropertyForm } from './usePropertyForm';
import axios from '../../../utils/axios';
import { ApiPropertyDocumentType } from './property.types';
import { Furnished, OutsideSpace, PropertyType } from './property.constants';
import { OtherSpecificPropertyFeature } from '../../SetCriteria/criteria.types';
import { useUserStore } from '../../../globalState/user';
import { ShowGlobalLoading } from '../../../components/ShowGlobalLoading';
import { RoundAction } from '../../../components/RoundAction';

export interface EditPropertyModalProps extends HTMLAttributes<HTMLDivElement> {
  showStore: [boolean, (show: boolean) => void];
  propertyId?: string;
  afterDelete: () => void;
  onBack: () => void;
  afterStartMatching: () => any;
  afterSaveAsDraft: () => any;
}

export const EditPropertyModal = styled(
  ({
    className,
    showStore,
    propertyId,
    afterDelete,
    onBack,
    afterStartMatching,
    afterSaveAsDraft
  }: EditPropertyModalProps) => {
    const [loadingProperty, setLoadingProperty] = React.useState(false);
    const [deletePropertyConfirmationModal, setDeletePropertyConfirmationModal] = React.useState(false);

    const [modalVisibility, setModalVisibility] = showStore;

    const form = usePropertyForm();

    const { auth } = useUserStore();

    React.useEffect(() => {
      if (propertyId) {
        setLoadingProperty(true);
        loadProperty().finally(() => {
          setLoadingProperty(false);
        });
      }
    }, [propertyId]);

    const loadProperty = async () => {
      try {
        const { data } = await axios(auth.access_token).get<ApiPropertyDocumentType>(
          `/api/asset/${propertyId}`
        );

        form.setValue('areaOfInterest', data.area_of_interest);

        form.setValue('location', {
          latitude: data?.asset_address?.latitude,
          longitude: data?.asset_address?.longitude
        });

        form.setValue('title', data.title);

        form.setValue('propertyType', data.property_type);

        if (data.property_type === PropertyType.House && data.house_details?.house_type) {
          form.setValue('houseDetails.houseType', data.house_details.house_type);
        }

        if (data.property_type === PropertyType.Flats) {
          if (data?.flat_details?.property_purpose) {
            form.setValue('flatDetails.propertyPurpose', data?.flat_details?.property_purpose);
          }

          form.setValue('flatDetails.lift', data?.flat_details?.lift);
          form.setValue('flatDetails.security', data?.flat_details?.security);

          form.setValue('flatDetails.gymSpa', data?.flat_details?.gym_spa);

          if (data?.flat_details?.floor) {
            form.setValue('flatDetails.floor', data.flat_details.floor);
          }

          if (data.flat_details?.outside_space?.includes(OutsideSpace.Garden)) {
            form.setValue('flatDetails.outsideSpace.Garden', true);
          }

          if (data.flat_details?.outside_space?.includes(OutsideSpace.Terrace)) {
            form.setValue('flatDetails.outsideSpace.Roof terrace', true);
          }

          if (data.flat_details.outside_space.includes(OutsideSpace.Balcony)) {
            form.setValue('flatDetails.outsideSpace.Balcony', true);
          }
        }

        if (data.floor_size) {
          form.setValue('area', data.floor_size);
        }

        if (data?.floor_size_unit) {
          form.setValue('areaUnit', data.floor_size_unit);
        }

        if (data?.room_details?.number_of_bathrooms) {
          form.setValue('bathrooms', data.room_details.number_of_bathrooms);
        }

        if (data?.room_details?.number_of_bedrooms) {
          form.setValue('bedrooms', data.room_details.number_of_bedrooms);
        }

        if (data?.specific_property_features?.includes(Furnished.Unfurnished)) {
          form.setValue('furniture', Furnished.Unfurnished);
        } else if (data?.specific_property_features?.includes(Furnished.PartiallyFurnished)) {
          form.setValue('furniture', Furnished.PartiallyFurnished);
        } else if (data?.specific_property_features?.includes(Furnished.FullyFurnished)) {
          form.setValue('furniture', Furnished.FullyFurnished);
        }

        form.setValue('propertyImages', data.property_images);

        if (data?.budget?.min_budget) {
          form.setValue('minBudget', data.budget.min_budget);
        }

        if (data?.budget?.max_budget) {
          form.setValue('maxBudget', data.budget.max_budget);
        }

        if (!isNaN(data?.parking_spot)) {
          form.setValue('parkingSpot', data?.parking_spot?.toString());
        }
        if (data?.parking_details) {
          form.setValue('parkingType', data.parking_details);
        }

        form.setValue(
          'specificPropertyFeatures',
          Object.values(OtherSpecificPropertyFeature).reduce((acc: any, ospf) => {
            acc[ospf] = data.specific_property_features.includes(ospf);
            return acc;
          }, {})
        );

        form.setValue('epcRating', data.epc_rating);
        form.setValue('condition', data.condition);
        form.setValue('description', data.description);
      } catch (err) {
        throw err;
      }
    };

    const saveAsDraft = async (payload: Partial<ApiPropertyDocumentType>) => {
      try {
        return await axios(auth.access_token).patch(`/api/asset/${propertyId}`, payload);
      } catch (err) {
        throw err;
      }
    };

    const startMatching = async (payload: Partial<ApiPropertyDocumentType>) => {
      try {
        return await axios(auth.access_token).patch(`/api/asset/${propertyId}`, payload);
      } catch (err) {
        throw err;
      }
    };

    const deleteProperty = async () => {
      try {
        await axios(auth.access_token).delete(`/api/asset/${propertyId}`);
      } catch (err) {
        throw err;
      }
    };

    const onDeleteClick = () => {
      setDeletePropertyConfirmationModal(true);
    };
    const onCancelDelete = () => {
      setDeletePropertyConfirmationModal(false);
    };

    const onDeleteConfirm = async () => {
      try {
        setModalVisibility(false);
        await deleteProperty();
      } finally {
        afterDelete();
      }
    };

    return (
      <Modal
        className={`edit-property-modal ${className}`}
        open={modalVisibility}
        onBackdropClick={() => setModalVisibility(false)}
        onClose={() => setModalVisibility(false)}>
        {loadingProperty && <ShowGlobalLoading />}

        <div className='header'>
          <Typography variant='body2'>Edit property</Typography>
          <div className='right-side'>
            {propertyId && (
              <Button
                variant='secondary'
                className='delete-button'
                startIcon={<Icon icon='trash' size={20} />}
                onClick={onDeleteClick}>
                Delete property
              </Button>
            )}
            <RoundAction icon='close' onClick={() => setModalVisibility(false)} />
          </div>
        </div>
        <PropertyForm
          saveAsDraft={saveAsDraft}
          startMatching={startMatching}
          form={form}
          onBack={onBack}
          afterSaveAsDraft={afterSaveAsDraft}
          afterStartMatching={afterStartMatching}
        />
        <DeletePropertyConfirmationModal
          disableScrollLock
          open={deletePropertyConfirmationModal}
          onBackdropClick={onCancelDelete}>
          <div className='modal-header'>
            <CloseButton onClick={onCancelDelete} />
          </div>
          <Typography variant='body2' className='title'>
            Are you sure you want to delete the property?
          </Typography>
          <Typography variant='body4' className='description'>
            The action can be reverted anymore. Do you want to delete this property?
          </Typography>
          <div className='actions'>
            <Button size='large' variant='secondary' onClick={onCancelDelete}>
              Cancel
            </Button>
            <Button size='large' onClick={onDeleteConfirm}>
              Delete
            </Button>
          </div>
        </DeletePropertyConfirmationModal>
      </Modal>
    );
  }
)`
  &.edit-property-modal {
    overflow-y: auto;
    max-height: 100vh;
    height: auto;
    width: 100vw;

    border-radius: 0px;

    .modal-container {
      padding: 0;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 36px;
      border-bottom: 2px solid #f3f4f5;
      box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.05);

      .right-side {
        display: flex;
        column-gap: 16px;
        align-items: center;

        .delete-button {
          color: #e5155a;
          border-color: #e5155a;
        }
      }
    }
  }
`;

const DeletePropertyConfirmationModal = styled(Modal)`
  & {
    .modal-container {
      padding: 0;
    }
    padding: 24px;
    max-width: 440px;
    .modal-header {
      display: flex;
      justify-content: flex-end;
    }
    .title {
      margin-top: 24px;
      text-align: center;
    }

    .description {
      margin-top: 16px;
      text-align: center;
    }
    .actions {
      margin-top: 48px;
      display: flex;
      column-gap: 16px;
      .button {
        flex-grow: 1;
      }
    }
  }
`;
