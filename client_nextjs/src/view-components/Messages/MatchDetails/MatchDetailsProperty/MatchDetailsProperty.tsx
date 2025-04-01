import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import { IRoom } from '../../messages.interface';
import { useUserStore } from '../../../../globalState/user';
import { getAvatarFormIndex } from '../../../HomeLoggedIn/avatars';

import { Avatar } from '../../../../components/Avatar';
import { Typography } from '../../../../components/Typography';
import { Label } from '../../../../components/Label';
import { Icon } from '../../../../components/Icon';

import logoValpal from '../../../../assets/svg/logo-valpal.png';
import { MakeAnOfferModal, OfferFormType } from './MakeAnOfferModal';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from '../../../../utils/axios';
import { ShowGlobalLoading } from '../../../../components/ShowGlobalLoading';
import { ApiOfferDocument, ReviewOfferModal } from './MatchDetailsproperty.ReviewOfferModal';
import { Documents } from '../../Documents/Documents';
import { MatchedPropertyType } from '../../../Matches/matches.type';
import { ViewProperty } from '../../../Matches/MatchesProperties/ViewProperty';
import { MakeAnOffer } from './MakeAnOffer';
import { ReviewOffer } from './ReviewOffer';
import { AcceptedOffer } from './AcceptedOffer';
import { Step } from '../../../../components/Step';
import { DocumentType } from '../../../MyAccount/user.interface';
import { useProfileStore } from '../../../../globalState/profile';
import { useNavigate } from '../../../../compat/router';
import config from '../../../../config';
import { CompletedAllSteps } from './ComplettedAllSteps';
interface MatchDetailsPropertyProps extends HTMLAttributes<HTMLDivElement> {
  room: IRoom;
  fetchChatRooms: () => any;
}

export const MatchDetailsProperty = styled(
  ({ className, room, fetchChatRooms }: MatchDetailsPropertyProps) => {
    const userStore = useUserStore();
    const profileStore = useProfileStore();
    const navigate = useNavigate();
    const { auth, userDetails } = useUserStore();

    const [offerModalVisibility, setOfferModalVisibility] = React.useState(false);

    const [reviewOfferModalVisibility, setReviewOfferModalVisibility] = React.useState(false);

    const [propertyToView, setPropertyToView] = React.useState(null);

    const [showDocuments, setShowDocuments] = React.useState<boolean | undefined>(false);

    const avatarKey = room.property_match?.landlord.avatar;

    const avatar = getAvatarFormIndex(avatarKey);

    const fullName = `${room.property_match?.landlord?.first_name} ${room.property_match?.landlord?.last_name}`;

    const property = room.property;

    const isIdVerified = !!profileStore.documents?.find((d) => d.type === DocumentType['Proof of ID']);

    const otherUser = room.participant._id === userDetails.user_id ? room.author : room.participant;

    const offerQuery = useQuery<ApiOfferDocument>({
      queryKey: ['offer', room.tenant_match?._id],
      queryFn: async () => {
        try {
          const { data } = await axios(userStore.auth.access_token).get(
            `/api/offer/matches/${room.tenant_match?._id}/offer`
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

    const makeOffer = useMutation<ApiOfferDocument, unknown, OfferFormType>({
      mutationFn: async (data: OfferFormType) => {
        const { data: offer } = await axios(userStore.auth.access_token).post<ApiOfferDocument>(
          '/api/offer',
          {
            offering_price: data.offeringPrice,
            min_duration: data.minDuration,
            warranty: data.warranty,
            match: room?.tenant_match?._id
          }
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return offer;
      },
      onSuccess: () => {
        setOfferModalVisibility(false);
        offerQuery.refetch();
      }
    });

    const cancelOffer = useMutation<ApiOfferDocument, unknown, string>({
      mutationFn: async (offerId: string) => {
        const { data } = await axios(userStore.auth.access_token).patch<ApiOfferDocument>(
          `/api/offer/${offerId}/canceled`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return data;
      },
      onSuccess: () => {
        setReviewOfferModalVisibility(false);
        offerQuery.refetch();
      }
    });

    const unmatchProperty = useMutation({
      mutationFn: (matchId: string) => {
        return axios(userStore.auth.access_token).patch(`/api/match/${matchId}/unmatched`);
      },
      onSuccess: () => {
        fetchChatRooms();
      }
    });

    const matchedProperty: any = {};
    matchedProperty.property = property;
    matchedProperty.property.created_by = room.property_match?.landlord;
    matchedProperty.matched = true;
    matchedProperty.property.percentage = property?.percentage || 34;

    const onVerifyIdClick = () => {
      navigate('/my-account/security-details');
    };

    const onSignTransactionAgreement = () => {
      navigate('/my-account/transaction-agreement');
    };

    const getEnvelopes = useQuery({
      queryKey: ['get-envelopes', room.property._id, otherUser._id],
      queryFn: async () => {
        return await axios(auth.access_token).get(`${config.apiUrl}/api/docusign/envelope`, {
          params: {
            document_type: 'Rent Contract',
            property: room.property._id,
            participant: otherUser._id,
            getDataFor: userDetails.role
          }
        });
      },
      enabled: isIdVerified && profileStore.signed_transaction_agreement,
      onSuccess: (data) => {
        const envelope = data.data.docs[0];
        if (envelope.signed_by_landlord && envelope.signed_by_tenant) {
          setShowDocuments(undefined);
        } else {
          setShowDocuments(true);
        }
      }
    });

    return (
      <>
        {offerQuery.isFetching && <ShowGlobalLoading />}

        <div className={classNames('match-details-property', className)}>
          <div className='property-details'>
            <div className='landlord-details'>
              <Avatar image={avatar} />
              <div className='details'>
                <Typography variant='body4' className='fullname'>
                  {fullName}
                </Typography>
                <Typography variant='body6' className='matched-on'>
                  Matched on {moment(room.tenant_match?.created_at).format('DD.MM.YYYY')}
                </Typography>
              </div>
            </div>
            {offerQuery.data === null && <MakeAnOffer setOfferModalVisibility={setOfferModalVisibility} />}
            {offerQuery.data && !offerQuery.data?.accepted.status && (
              <ReviewOffer setReviewOfferModalVisibility={setReviewOfferModalVisibility} />
            )}
            {offerQuery.data && offerQuery.data?.accepted.status && showDocuments !== undefined && (
              <AcceptedOffer />
            )}
            {showDocuments === undefined && (
              <CompletedAllSteps seePropertyDetails={() => setPropertyToView(matchedProperty)} />
            )}
            <div className='divider' />
            {(offerQuery.data && offerQuery.data?.accepted.status && (
              <>
                {!showDocuments && showDocuments !== undefined && (
                  <div>
                    <Step
                      title='Verify your ID'
                      description='In order to continue with the process you need to verify your ID.'
                      state={isIdVerified ? 'filled' : 'default'}
                      cta={
                        <Label size='medium' variant='primary' onClick={onVerifyIdClick}>
                          Verify ID
                        </Label>
                      }
                    />
                    <Step
                      title='Sign the transaction agreement'
                      description='In order to generate the final documents, you first need to sign the transaction agreement.'
                      state={
                        isIdVerified
                          ? !profileStore.signed_transaction_agreement
                            ? 'default'
                            : 'filled'
                          : 'inactive'
                      }
                      cta={
                        <Label size='medium' variant='primary' onClick={onSignTransactionAgreement}>
                          Sign agreement
                        </Label>
                      }
                    />
                    <Step
                      title='Sign the final documents'
                      description='The final step of your perfect match journey. All documents will be automatically generated and you can digitally sign them.'
                      state={!profileStore.signed_transaction_agreement ? 'inactive' : 'default'}
                      lastStep
                      cta={
                        <Label size='medium' variant='special' onClick={() => getEnvelopes.refetch()}>
                          Sign final documents
                        </Label>
                      }
                    />
                  </div>
                )}
                {showDocuments && <Documents room={room} />}
              </>
            )) || (
              <div className='match-section-wrapper'>
                <div className='match-section'>
                  <Typography variant='body4' className='title'>
                    About your match
                  </Typography>
                  <Typography variant='body4' className='description'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
                    ut labor...
                  </Typography>
                </div>
                <Label variant='secondary' onClick={() => setPropertyToView(matchedProperty)}>
                  Match details
                </Label>
              </div>
            )}
          </div>
          <div className='buttons'>
            {offerQuery.data === null && <Label variant='tertiary'>Get help</Label>}
            {offerQuery.data && (
              <Label
                variant='tertiary'
                onClick={() => {
                  if (room.property_match?._id) {
                    unmatchProperty.mutate(room.property_match?._id);
                  }
                }}>
                Unmatch
              </Label>
            )}
            <Label variant='tertiary'>Report user</Label>
          </div>
        </div>
        <MakeAnOfferModal
          room={room}
          open={offerModalVisibility}
          onBackdropClick={() => setOfferModalVisibility(false)}
          makeOffer={makeOffer}
        />
        {!offerQuery.isFetching && !!offerQuery.data && (
          <ReviewOfferModal
            room={room}
            open={reviewOfferModalVisibility}
            onBackdropClick={() => setReviewOfferModalVisibility(false)}
            offer={offerQuery.data}
            cancelOffer={cancelOffer}
          />
        )}
        {propertyToView && (
          <ViewProperty
            open={true}
            closeModal={() => setPropertyToView(null)}
            onBackdropClick={() => setPropertyToView(null)}
            propertyMatch={propertyToView}
            dislikeProperty={() => {
              if (room.property_match?._id) {
                unmatchProperty.mutate(room.property_match?._id);
              }
            }}
            chatWith={() => setPropertyToView(null)}
          />
        )}
      </>
    );
  }
)`
  &.match-details-property {
    border-radius: 16px;
    display: grid;
    padding: 24px;
    align-content: space-between;
    box-sizing: border-box;
    height: 100%;
    grid-auto-rows: min-content min-content;

    .property-details {
      display: grid;
      gap: 24px;

      .landlord-details {
        display: flex;
        gap: 16px;

        .details {
          display: flex;
          flex-direction: column;
          row-gap: 8px;

          .fullname {
            color: #0d2a38;
            font-weight: 700;
          }

          .matched-on {
            color: #a7a7a7;
            font-weight: 500;
            line-height: 20px;
          }
        }
      }

      .divider {
        background: #e7e7e7;
        height: 1px;
      }

      .match-section-wrapper {
        display: grid;
        gap: 16px;

        .match-section {
          display: grid;
          gap: 16px;

          .title {
            font-size: 16px;
            font-weight: 700;
            color: #0d2a38;
          }

          .description {
            color: #0d2a38;
            font-weight: 500;
          }
        }

        .offer-button {
          width: 100%;
        }
      }
    }

    .buttons {
      display: flex;
      gap: 40px;
      justify-content: flex-end;
    }
  }
`;
