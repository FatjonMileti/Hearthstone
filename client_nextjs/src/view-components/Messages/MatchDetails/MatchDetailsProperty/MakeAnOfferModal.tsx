import { styled } from '@mui/system';
import { Modal, ModalProps } from '../../../../components/Modal';
import { Typography } from '../../../../components';
import { CloseButton } from '../../../../components';
import classNames from 'classnames';
import { Label } from '../../../../components';
import { IRoom } from '../../messages.interface';
import { Avatar } from '../../../../components';
import { getAvatarFormIndex } from '../../../HomeLoggedIn/avatars';
import { Icon } from '../../../../components';
import { AreaUnit } from '../../../Properties/NewProperty/property.constants';
import { TextField } from '../../../../components';
import { Select } from '../../../../components/Select/Select';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { UseBaseMutationResult } from '@tanstack/react-query';
import { ApiOfferDocument } from './MatchDetailsproperty.ReviewOfferModal';
import { ShowGlobalLoading } from '../../../../components';

export type OfferFormType = {
  offeringPrice: number;
  warranty: string;
  minDuration: string;
};

enum Warranty {
  '1 month' = '1 month',
  '2 months' = '2 months',
  '3 months' = '3 months'
}

enum Duration {
  '1 year' = '1 year',
  '2 years' = '2 years',
  '3 years' = '3 years'
}

const offerFormSchema: Yup.ObjectSchema<OfferFormType> = Yup.object().shape({
  offeringPrice: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('Offering price is required')
    .positive('Offering price must be a positive number'),
  warranty: Yup.string().required(),
  minDuration: Yup.string().required()
});

interface MakeAnOfferModalProps extends ModalProps {
  room: IRoom;
  makeOffer: UseBaseMutationResult<ApiOfferDocument, unknown, OfferFormType>;
}

export const MakeAnOfferModal = styled(({ className, room, makeOffer, ...rest }: MakeAnOfferModalProps) => {
  const property = room.property;
  const landlord = room.property_match?.landlord;

  const avatarKey = landlord?.avatar;
  const avatar = getAvatarFormIndex(avatarKey);

  const offerForm = useForm<OfferFormType>({
    defaultValues: {
      offeringPrice: undefined,
      warranty: Warranty['1 month'],
      minDuration: Duration['1 year']
    },
    resolver: yupResolver(offerFormSchema),
    mode: 'all'
  });

  return (
    <Modal className={classNames('make-an-offer-modal', className)} {...rest}>
      {makeOffer.isLoading && <ShowGlobalLoading />}
      <div className='modal-header'>
        <Typography variant='body2' className='title'>
          Make an offer
        </Typography>
        <CloseButton inverted={false} background={true} size='large' onClick={rest.onBackdropClick} />
      </div>
      <div className='container'>
        <div className='property-and-offer-wrapper'>
          <div className='property-details-and-tenant-details'>
            <div className='property-image' />
            <div className='property-and-landlord-wrapper'>
              <div className='property-details'>
                <Typography className='property-title' variant='body4'>
                  {property.title}
                </Typography>
                <div className='details-list'>
                  <div className='detail'>
                    <Icon icon='location' />
                    <Typography variant='body6'>{room.property.area_of_interest}</Typography>
                  </div>

                  <Typography variant='body4' className='dot'>
                    •
                  </Typography>

                  <div className='detail'>
                    <Icon icon='double-bed' />
                    <Typography variant='body6'>{room.property.room_details?.number_of_bedrooms}</Typography>
                  </div>

                  <Typography variant='body4' className='dot'>
                    •
                  </Typography>
                  <div className='detail'>
                    <Icon icon='bathtub' />
                    <Typography variant='body6'>{room.property.room_details?.number_of_bathrooms}</Typography>
                  </div>
                  <Typography variant='body4' className='dot'>
                    •
                  </Typography>

                  <div className='detail'>
                    <Icon icon='ruler' />
                    <Typography variant='body6'>
                      {property.floor_size && (
                        <>
                          {property.floor_size_unit === AreaUnit.SquareFoot
                            ? property.floor_size
                            : (property.floor_size * 10.764).toFixed(0)}{' '}
                          {AreaUnit.SquareFoot}/
                          {property.floor_size_unit === AreaUnit.SquareMeter
                            ? property.floor_size
                            : (property.floor_size / 10.764).toFixed(0)}{' '}
                          {AreaUnit.SquareMeter}
                        </>
                      )}
                    </Typography>
                  </div>
                </div>
              </div>
              <div className='landlord-details'>
                <Avatar image={avatar} />
                <Typography
                  className='full-name'
                  variant='body4'>{`${landlord?.first_name} ${landlord?.last_name}`}</Typography>
              </div>
            </div>
          </div>
          <div className='asking-budget'>
            <div className='budget-detail'>
              <Typography variant='body5' className='budget-title'>
                Asking price:
              </Typography>
              <Typography variant='body4' className='budget-value'>
                {`£${property?.budget?.min_budget?.toLocaleString()} - £${property?.budget?.max_budget.toLocaleString()}`}
              </Typography>
            </div>
            <div className='budget-line' />
            <div className='budget-detail'>
              <Typography variant='body5' className='budget-title'>
                Warranty (advance):
              </Typography>
              <Typography variant='body4' className='budget-value'>
                2 months
              </Typography>
            </div>
            <div className='budget-line' />
            <div className='budget-detail'>
              <Typography variant='body5' className='budget-title'>
                Min. duration:
              </Typography>
              <Typography variant='body4' className='budget-value'>
                2 years
              </Typography>
            </div>
          </div>
          <div className='offer-line-and-text'>
            <Typography variant='body6' className='offer-line-text'>
              Your offer
            </Typography>{' '}
            <div className='offer-line' />
          </div>

          <div className='offer-form'>
            <TextField
              label='Offering price:'
              type='number'
              {...offerForm.register('offeringPrice')}
              error={!!offerForm.formState.errors?.offeringPrice}
              helperText={offerForm.formState.errors?.offeringPrice?.message}
            />
            <Select label='Warranty (advance):' {...offerForm.register('warranty')}>
              {Object.values(Warranty).map((w, wIndex) => (
                <option key={wIndex} value={w}>
                  {w}
                </option>
              ))}
            </Select>
            <Select label='Min. duration:' {...offerForm.register('minDuration')}>
              {Object.values(Duration).map((d, dIndex) => (
                <option key={dIndex} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className='modal-footer'>
          <Typography variant='body6' className='description'>
            By submitting your offer you understand that the landlord can accept or reject your offer.
            Therefore we recommend you consider an appropriate negotiation margin when submitting your offer.
          </Typography>
          <Label
            size='large'
            onClick={offerForm.handleSubmit((data) => makeOffer.mutate(data))}
            disabled={!offerForm.formState.isValid}>
            Send offer
          </Label>
        </div>
      </div>
    </Modal>
  );
})`
  &.make-an-offer-modal {
    width: 640px;
    .modal-container {
      padding: 0 !important;
      border-radius: 16px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 16px 24px;
      border-radius: 16px 16px 0 0;

      .title {
        font-family: At Gambit, serif;
      }
    }

    .container {
      border-radius: 0 0 16px 16px;
      padding: 24px;
      display: grid;
      row-gap: 32px;
      .property-and-offer-wrapper {
        display: grid;
        row-gap: 16px;

        .property-details-and-tenant-details {
          display: grid;
          grid-template-columns: min-content auto;
          align-items: center;

          .property-image {
            height: 116px;
            width: 128px;

            border-radius: 8px;
            box-shadow: 0 0.81416px 9.76993px 0 rgba(0, 0, 0, 0.04);

            background: linear-gradient(180deg, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.8) 100%),
              url('${(props) => props.room.property.property_images?.[0]?.link}'),
              lightgray 50% / cover no-repeat;

            background-size: cover;
            background-position: center;
          }

          .property-and-landlord-wrapper {
            padding: 12px 24px;
            display: grid;
            row-gap: 8px;
            align-content: center;

            .property-details {
              display: grid;

              .property-title {
                font-size: 18px;
                font-family: Roobert, serif;
                font-weight: 700;
                height: 28px;
              }

              .details-list {
                color: #646464;
                font-weight: 700;
                display: flex;
                column-gap: 8px;
                align-items: center;
                flex-wrap: wrap;

                .detail {
                  display: flex;
                  column-gap: 4px;
                  align-items: center;
                  .icon {
                    width: 16px !important;
                    height: 16px !important;
                  }
                }

                .dot {
                  color: #a7a7a7;
                }
              }
            }

            .landlord-details {
              display: flex;
              column-gap: 8px;
              align-items: center;
              .avatar {
                height: 32px;
                width: 32px;
              }

              .full-name {
                font-size: 18px;
                font-family: Roobert, serif;
                font-weight: 700;
              }
            }
          }
        }

        .asking-budget {
          padding: 16px;
          display: grid;
          column-gap: 32px;
          grid-template-columns: 1fr min-content 1fr min-content 1fr;

          border-radius: 8px;
          background: #f3f4f5;

          .budget-detail {
            display: grid;
            row-gap: 4px;

            .budget-title {
              color: #6a6d6d;
              font-weight: 700;
            }

            .budget-value {
              font-size: 20px;
              font-weight: 700;
              color: #0d2a38;
            }
          }

          .budget-line {
            width: 1px;
            background: #e7e7e7;
          }
        }

        .offer-line-and-text {
          display: grid;
          grid-template-columns: max-content auto;
          align-items: center;
          column-gap: 8px;
          .offer-line-text {
            color: #a7a7a7;
          }
          .offer-line {
            height: 1px;
            background: #e7e7e7;
          }
        }

        .offer-form {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          column-gap: 16px;

          .text-field,
          .select {
            label {
              color: #6a6d6d;
              font-family: Roobert, serif;
              font-size: 14px;
              font-style: normal;
              font-weight: 700;
              line-height: 20px;
            }

            input,
            select {
              color: #0d2a38;
              font-family: Roobert, serif;
              font-size: 20px;
              font-style: normal;
              font-weight: 700;
              line-height: 24px;
            }
          }
        }
      }

      .modal-footer {
        display: grid;
        column-gap: 16px;
        grid-template-columns: auto min-content;
        align-items: center;

        .description {
          color: #646464;
        }
      }
    }
  }
`;
