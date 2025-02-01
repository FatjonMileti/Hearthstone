import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import { IRoom } from '../../messages.interface.ts';
import classNames from 'classnames';
import { Avatar, Icon, Label, ShowGlobalLoading, Typography } from '../../../../components/index.ts';
import moment from 'moment/moment';
import { getAvatarFormIndex } from '../../../HomeLoggedIn/avatars.tsx';
import { useUserStore } from '../../../../globalState/user.tsx';
import { ViewProfile } from '../../../Matches/MatchesTenants/ViewProfile.tsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ApiOfferDocument } from '../MatchDetailsProperty/MatchDetailsproperty.ReviewOfferModal.tsx';
import axios from '../../../../utils/axios.ts';
import { ReviewOfferModal } from './MatchDetailsTenant.ReviewOfferModal.tsx';

import { Documents } from '../../Documents/Documents.tsx';
import { MatchedTenantType } from '../../../Matches/matches.type.ts';
import { mapTenant } from '../../../Matches/MatchesTenants/serializers.ts';

interface MatchDetailsTenantProps extends HTMLAttributes<HTMLDivElement> {
  room: IRoom;
  fetchChatRooms: () => any;
}

export const MatchDetailsTenant = styled(({ className, room, fetchChatRooms }: MatchDetailsTenantProps) => {
  const [tenantToView, setTenantToView] = React.useState<MatchedTenantType | null>(null);

  const [reviewOfferModalVisibility, setReviewOfferModalVisibility] = React.useState(false);

  const userStore = useUserStore();

  const avatarKey =
    userStore.userDetails?.user_id === room?.author?._id ? room?.participant?.avatar : room?.author?.avatar;

  const avatar = getAvatarFormIndex(avatarKey);

  const fullName = `${room.tenant_match?.tenant?.first_name} ${room.tenant_match?.tenant?.last_name}`;

  const offerQuery = useQuery<ApiOfferDocument>({
    queryKey: ['offer', room.tenant_match?._id],
    queryFn: async () => {
      try {
        const { data } = await axios(userStore.auth.access_token).get(
          `/api/offer/matches/${room.property_match?._id}/offer`
        );
        return data;
      } catch (err: any) {
        if (err?.response?.status === 404) {
          return null;
        }

        throw err;
      }
    },
    refetchOnWindowFocus: false,
    retry: false,
    refetchIntervalInBackground: false
  });

  const refuseOffer = useMutation<ApiOfferDocument, unknown, string>({
    mutationFn: async (offerId: string) => {
      const { data } = await axios(userStore.auth.access_token).delete<ApiOfferDocument>(
        `/api/offer/${offerId}`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      setReviewOfferModalVisibility(false);
      offerQuery.refetch();
    }
  });

  const acceptOffer = useMutation<ApiOfferDocument, unknown, string>({
    mutationFn: async (offerId: string) => {
      const { data } = await axios(userStore.auth.access_token).patch<ApiOfferDocument>(
        `/api/offer/${offerId}/accepted`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      setReviewOfferModalVisibility(false);
      offerQuery.refetch();
    }
  });

  const unmatchTenant = useMutation({
    mutationFn: (matchId: string) => {
      return axios(userStore.auth.access_token).patch(`/api/match/${matchId}/unmatched`);
    },
    onSuccess: () => {
      if (tenantToView) {
        setTenantToView(null);
      }
      fetchChatRooms();
    }
  });

  const matchTenantQuery = useQuery({
    queryKey: ['tenantMatch', room.tenant_match?._id],
    queryFn: async () => {
      const { data } = await axios(userStore.auth.access_token).get<MatchedTenantType>(
        `/api/match/${room.tenant_match?._id}`
      );
      return mapTenant(data);
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    retry: false,
    onError: (err) => {
      console.log(err);
    }
  });

  const viewProfile = () => {
    if (matchTenantQuery.data) {
      setTenantToView(matchTenantQuery.data);
    }
  };

  return (
    <>
      <div
        className={classNames('match-details-tenant', className, {
          'offer-refused': offerQuery?.data?.refused,
          'offer-accepted': offerQuery?.data?.accepted?.status,
          unmatched: room.tenant_match?.unmatched
        })}>
        {(unmatchTenant.isLoading || matchTenantQuery.isFetching) && <ShowGlobalLoading />}
        <div className={`tenant-details ${className}`}>
          <Avatar image={avatar} />

          <div className='details'>
            <Typography variant='body4' className='name'>
              {fullName}
            </Typography>
            <Typography variant='body6' className='matched-date'>
              {'Matched on '}
              {room.tenant_match?.created_at && moment(room.tenant_match.created_at).format('MMMM Do YYYY')}
            </Typography>
          </div>
        </div>

        {!room.tenant_match?.unmatched && !room.property_match?.unmatched && (
          <>
            <Label variant='secondary' className='view-profile-button' onClick={viewProfile}>
              View profile
            </Label>
            {tenantToView && (
              <ViewProfile
                tenantMatch={tenantToView}
                closeViewProfile={() => setTenantToView(null)}
                dislikeTenant={() => {
                  if (tenantToView?.matchId) {
                    unmatchTenant.mutate(tenantToView?.matchId);
                  }
                }}
                disableLikeTenant
              />
            )}

            <div className='explanation'>
              <Typography variant='body6' className='explanation-title'>
                Offers
              </Typography>
              <Typography variant='body6' className='explanation-description'>
                Any offers that this tenant sends you will appear here. You can{' '}
                <span className='bold'>Accept, Reject</span> or
                <span className='bold'> Reject and unmatch</span>
              </Typography>
            </div>

            {offerQuery.data && (
              <>
                {offerQuery.data.refused && !offerQuery.data?.accepted?.status && (
                  <>
                    <div className='offer-rejected-wrapper'>
                      <div className='offer-rejected-informative-text'>
                        <Icon icon='close-o' />
                        <Typography variant='body6' className='offer-sent-title'>
                          Your rejected the offer
                        </Typography>
                      </div>
                      <Typography variant='body6'>
                        You rejected this tenant’s offer. If you’re open to negotiate you can reach the tenant
                        on chat or if you want, you can unmatch him and don’t receive an offer again.
                      </Typography>
                    </div>
                  </>
                )}

                {offerQuery.data?.accepted?.status && (
                  <>
                    <div className='offer-accepted-wrapper'>
                      <div className='offer-accepted-informative-text'>
                        <Icon icon='checked-o' />
                        <Typography variant='body6' className='offer-sent-title'>
                          You accepted the offer
                        </Typography>
                      </div>
                      <Typography variant='body6'>
                        In order to complete the transaction, you will need to provide us with some documents.
                        Once you have all the documents uploaded you can complete the transaction.
                      </Typography>
                    </div>

                    <Documents room={room} />
                  </>
                )}

                {!offerQuery.data.refused && !offerQuery.data?.accepted?.status && (
                  <>
                    <ReviewOfferModal
                      open={reviewOfferModalVisibility}
                      onBackdropClick={() => setReviewOfferModalVisibility(false)}
                      room={room}
                      offer={offerQuery.data}
                      refuseOffer={refuseOffer}
                      acceptOffer={acceptOffer}
                      viewProfile={viewProfile}
                    />
                    <div className='received-offer'>
                      <div className='texts-wrapper'>
                        <Typography variant='body6' className='received-offer-title'>
                          You received an offer!
                        </Typography>
                        <Typography variant='body6' className='received-offer-description'>
                          Review the offer before taking action.
                        </Typography>
                      </div>
                      <Label
                        className='review-offer-button'
                        onClick={() => setReviewOfferModalVisibility(true)}>
                        Review offer
                      </Label>
                    </div>
                  </>
                )}
              </>
            )}

            <div className='divider' />

            <div className='explanation'>
              <Typography variant='body6' className='explanation-title'>
                Connection
              </Typography>
              <Typography variant='body6' className='explanation-dsecription'>
                In order to complete the transaction, you will need to provide us with some documents. Once
                you have all the documents uploaded you can complete the transaction.
              </Typography>
            </div>

            <div className='action-buttons'>
              <Label
                special
                variant='secondary'
                onClick={() => {
                  if (room.tenant_match?._id) {
                    unmatchTenant.mutate(room.tenant_match?._id);
                  }
                }}>
                <Icon icon='dislike' size={24} />
                Unmatch
              </Label>
              <Label variant='secondary'>
                <Icon icon='email' />
                Report
              </Label>
            </div>
          </>
        )}

        {room.tenant_match?.unmatched && (
          <>
            <div className='tenant-unmatched-wrapper'>
              <div className='texts-wrapper'>
                <div className='offer-rejected-informative-text'>
                  <Icon icon='close-o' />
                  <Typography variant='body6' className='offer-sent-title'>
                    You unmatched this tenant
                  </Typography>
                </div>
                <Typography variant='body6'>
                  You are no longer matched with this tenant. Your history conversation will remain visible
                  for 90 days or you can delete it whenever you want.
                </Typography>
              </div>

              <Label className='delete-conversation-button' variant='secondary'>
                Delete conversation
              </Label>
            </div>
          </>
        )}

        {room.property_match?.unmatched && (
          <>
            <div className='tenant-unmatched-wrapper'>
              <div className='texts-wrapper'>
                <div className='offer-rejected-informative-text'>
                  <Icon icon='close-o' />
                  <Typography variant='body6' className='offer-sent-title'>
                    You have been unmatched
                  </Typography>
                </div>
                <Typography variant='body6'>
                  You are no longer matched with this tenant. Your history conversation will remain visible
                  for 90 days or you can delete it whenever you want.
                </Typography>
              </div>

              <Label className='delete-conversation-button' variant='secondary'>
                Delete conversation
              </Label>
            </div>
          </>
        )}
      </div>
    </>
  );
})`
  &.match-details-tenant {
    border-radius: 12px;
    background: #f7f1e7;
    box-shadow: 0 16px 32px 0 rgba(0, 0, 0, 0.12);

    padding: 24px;
    display: grid;
    row-gap: 24px;
    align-self: flex-start;

    &.offer-refused {
      box-shadow: 0px 16px 32px 0px rgba(180, 38, 59, 0.25);
    }

    &.offer-accepted {
      box-shadow: 0px 16px 32px 0px rgba(64, 129, 64, 0.25);
    }

    &.unmatched {
      box-shadow: 0px 16px 32px 0px rgba(180, 38, 59, 0.25);
    }

    .tenant-details {
      display: flex;
      column-gap: 8px;

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

    .view-profile-button {
      width: 100%;
    }

    .received-offer {
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #cfe0cf;
      background: #e2ece2;
      display: grid;
      row-gap: 12px;

      .texts-wrapper {
        display: grid;
        row-gap: 4px;

        .received-offer-title {
          font-weight: 700;
          color: #184d6d;
        }

        .received-offer-description {
          font-weight: 500;
          color: #184d6d;
        }
      }

      .review-offer-button {
        width: 100%;
      }
    }

    .explanation {
      display: grid;
      row-gap: 4px;
      .explanation-title {
        font-weight: 700;
      }

      .explanation-description {
        .bold {
          font-weight: 600;
        }
      }
    }

    .offer-rejected-wrapper {
      display: grid;
      row-gap: 8px;

      .offer-rejected-informative-text {
        display: flex;
        column-gap: 4px;
        align-items: center;
        padding: 12px;
        box-sizing: border-box;
        border-radius: 8px;
        border: 1px solid #ecc9ce;
        background: #f4dee2;
        color: #b4263b;

        font-weight: 700;

        .icon {
          width: 16px !important;
          height: 16px !important;
        }
      }
    }

    .tenant-unmatched-wrapper {
      display: grid;
      row-gap: 24px;
      .texts-wrapper {
        display: grid;
        row-gap: 8px;

        .offer-rejected-informative-text {
          display: flex;
          column-gap: 4px;
          align-items: center;
          padding: 12px;
          box-sizing: border-box;
          border-radius: 8px;
          border: 1px solid #ecc9ce;
          background: #f4dee2;
          color: #b4263b;

          font-weight: 700;

          .icon {
            width: 16px !important;
            height: 16px !important;
          }
        }
      }

      .delete-conversation-button {
        width: 100%;
      }
    }

    .offer-accepted-wrapper {
      display: grid;
      row-gap: 8px;

      .offer-accepted-informative-text {
        display: flex;
        column-gap: 4px;
        align-items: center;
        padding: 12px;
        box-sizing: border-box;
        border-radius: 8px;
        border: 1px solid #cfe0cf;
        background: #e2ece2;
        color: #408140;

        font-weight: 700;

        .icon {
          width: 16px !important;
          height: 16px !important;
        }
      }
    }

    .divider {
      background: #e7e7e7;
      height: 2px;
    }

    .action-buttons {
      display: flex;
      column-gap: 16px;

      .label {
        flex-grow: 1;
      }
    }
  }
`;
