import { styled } from '@mui/system';
import { Modal, ModalProps } from '../../../../components/Modal';
import { Typography } from '../../../../components/Typography';
import { CloseButton } from '../../../../components/CloseButton';
import classNames from 'classnames';
import { Label } from '../../../../components/Label';
import { IRoom } from '../../messages.interface';
import { Avatar } from '../../../../components/Avatar';
import { getAvatarFormIndex } from '../../../HomeLoggedIn/avatars';
import { Icon } from '../../../../components/Icon';
import { UseMutationResult } from '@tanstack/react-query';
import { ShowGlobalLoading } from '../../../../components/ShowGlobalLoading';
import moment from 'moment';

interface ReviewOfferModalProps extends ModalProps {
  room: IRoom;
  offer: ApiOfferDocument;
  refuseOffer: UseMutationResult<ApiOfferDocument, unknown, string>;
  acceptOffer: UseMutationResult<ApiOfferDocument, unknown, string>;
  viewProfile: () => any;
}

export interface ApiOfferDocument {
  _id: string;
  match: string;
  offering_price: number;
  warranty: string;
  min_duration: string;
}

export const ReviewOfferModal = styled(
  ({ className, room, offer, refuseOffer, acceptOffer, viewProfile, ...rest }: ReviewOfferModalProps) => {
    const property = room.property;

    const tenant = room.tenant_match?.tenant;

    const avatarKey = tenant?.avatar;
    const avatar = getAvatarFormIndex(avatarKey);

    const fullName = `${tenant?.first_name} ${tenant?.last_name}`;

    return (
      <Modal className={classNames('review-offer-modal', className)} {...rest}>
        {(refuseOffer.isLoading || acceptOffer.isLoading) && <ShowGlobalLoading />}
        <div className='modal-header'>
          <Typography variant='body2' className='title'>
            Review offer
          </Typography>
          <CloseButton inverted={false} background={true} size='large' onClick={rest.onBackdropClick} />
        </div>
        <div className='container'>
          <div className='property-and-offer-wrapper'>
            <div className='tenant-details'>
              <div className='avatar-and-name-wrapper'>
                <Avatar image={avatar} />

                <div className='details'>
                  <Typography variant='body4' className='name'>
                    {fullName}
                  </Typography>
                  <Typography variant='body6' className='matched-date'>
                    {'Matched on '}
                    {room.tenant_match?.created_at &&
                      moment(room.tenant_match.created_at).format('MMMM Do YYYY')}
                  </Typography>
                </div>
              </div>

              <Label variant='secondary' onClick={viewProfile}>
                View profile
              </Label>
            </div>

            <div className='line-and-budget-wrapper'>
              <div className='offer-line-and-text'>
                <Typography variant='body6' className='offer-line-text'>
                  Your valuation
                </Typography>{' '}
                <div className='offer-line' />
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
            </div>

            <div className='line-and-budget-wrapper'>
              <div className='offer-line-and-text'>
                <Typography variant='body6' className='offer-line-text'>
                  Tenant’s offer
                </Typography>{' '}
                <div className='offer-line' />
              </div>

              <div className='offer-budget'>
                <div className='budget-detail'>
                  <Typography variant='body5' className='budget-title'>
                    Offering price:
                  </Typography>
                  <Typography variant='body4' className='budget-value'>
                    {offer.offering_price}
                  </Typography>
                </div>
                <div className='budget-line' />
                <div className='budget-detail'>
                  <Typography variant='body5' className='budget-title'>
                    Warranty (advance):
                  </Typography>
                  <Typography variant='body4' className='budget-value'>
                    {offer.warranty}
                  </Typography>
                </div>
                <div className='budget-line' />
                <div className='budget-detail'>
                  <Typography variant='body5' className='budget-title'>
                    Min. duration:
                  </Typography>
                  <Typography variant='body4' className='budget-value'>
                    {offer.min_duration}
                  </Typography>
                </div>
              </div>
            </div>

            <Typography variant='body6' className='description'>
              By submitting your response you understand that you officially accept or reject this tenant’s
              offer and you agree to Hearthstone’s Terms & Conditions and the Transaction Agreement. If you need
              more information about the tenant or the offer you can always him on chat and negotiate.
            </Typography>
          </div>

          <div className='modal-footer'>
            <div className='action-buttons'>
              <Label size='large' variant='secondary' special onClick={() => refuseOffer.mutate(offer._id)}>
                <Icon icon='close' />
                Refuse offer
              </Label>
              <Label size='large' onClick={() => acceptOffer.mutate(offer._id)}>
                <Icon icon='checked' />
                Accept offer
              </Label>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
)`
  &.review-offer-modal {
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
      padding: 16px 24px 24px 24px;
      display: grid;
      row-gap: 32px;

      .property-and-offer-wrapper {
        display: grid;
        row-gap: 16px;

        .line-and-budget-wrapper {
          display: grid;
          row-gap: 8px;
        }

        .tenant-details {
          display: flex;
          justify-content: space-between;
          column-gap: 16px;
          align-items: center;

          .avatar-and-name-wrapper {
            display: flex;
            column-gap: 16px;
            align-items: center;
          }

          .avatar {
            width: 64px;
            height: 64px;
          }

          .details {
            display: flex;
            flex-direction: column;
            row-gap: 8px;

            .name {
              color: #0d2a38;
              font-weight: 700;
            }

            .matched-date {
              color: #a7a7a7;
            }
          }
        }

        .asking-budget,
        .offer-budget {
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

        .offer-budget {
          background: #f7f1e7;
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
        }

        .description {
          color: #646464;
        }
      }

      .modal-footer {
        display: grid;
        column-gap: 16px;
        align-items: center;
        row-gap: 32px;

        .action-buttons {
          justify-content: center;
          display: flex;
          column-gap: 16px;
        }
      }
    }
  }
`;
