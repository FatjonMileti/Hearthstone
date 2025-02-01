import { styled } from '@mui/system';
import { HeaderLoggedIn } from '../../PagesComponents/HeaderLoggedIn/HeaderLoggedIn.tsx';
import classNames from 'classnames';
import { ShowGlobalLoading } from '../../../components/index.ts';
import React, { HTMLAttributes } from 'react';
import { TenantCard } from '../../../components/index.ts';
import { getAvatarFormIndex } from '../../HomeLoggedIn/avatars.tsx';
import { ViewProfile } from './ViewProfile.tsx';
import { Footer } from '../../Home/Footer.tsx';
import { useNavigate } from 'react-router-dom';
import { Typography } from '../../../components/index.ts';
import { Icon } from '../../../components/index.ts';
import { Label } from '../../../components/index.ts';
import axios from '../../../utils/axios.ts';
import { useUserStore } from '../../../globalState/user.tsx';
import { useMatchesCount } from '../useMatchesCount.tsx';
import { useMatchedTenants } from './useMatchedTenants.tsx';
import { useSuggestedTenants } from '../../Suggestions/SugestionsTenants/useSuggestedTenants.tsx';
import { MatchedTenantType } from '../matches.type.ts';
import { useMutation } from '@tanstack/react-query';
import { Modal } from '../../../components/index.ts';
import { CloseButton } from '../../../components/index.ts';
import { Radio } from '../../../components/index.ts';
import { Select } from '../../../components/Select/Select.tsx';
import { Button } from '../../../components/index.ts';

interface MyMatchesTenants extends HTMLAttributes<HTMLDivElement> {}

export const MyMatchesTenants = styled(({ className }: MyMatchesTenants) => {
  const [filter, setFilter] = React.useState({
    withOffers: false,
    matchRate: 20
  });
  const [draftFilter, setDraftFilter] = React.useState({
    withOffers: false,
    matchRate: 20
  });

  const matchedTenants = useMatchedTenants({
    params: { chosen: true, matchRate: filter.matchRate },
    options: {
      refetchOnMount: true
    }
  });
  const [filterMatchesModal, setFilterMatchesModal] = React.useState(false);
  const [tenantToView, setTenantToView] = React.useState<MatchedTenantType | null>(null);
  const navigate = useNavigate();
  const userStore = useUserStore();

  const matchesCount = useMatchesCount({
    params: { chosen: true, disliked: false }
  });

  const suggestedTenants = useSuggestedTenants({
    params: { chosen: false, disliked: false }
  });

  const newChatWith = async (matchId: string) => {
    navigate(`/messages?matchId=${matchId}`);
  };

  const dislikeTenant = useMutation({
    mutationFn: (matchId: string) => {
      return axios(userStore.auth.access_token).delete(`/api/match/${matchId}`);
    },
    onSuccess: () => {
      if (tenantToView) {
        setTenantToView(null);
      }
      matchedTenants.refetch();
      matchesCount.refetch();
      suggestedTenants.refetch();
    }
  });

  const onCloseFilterModal = () => {
    setFilterMatchesModal(false);
  };

  return (
    <>
      {(matchedTenants.isFetching || dislikeTenant.isLoading) && <ShowGlobalLoading />}
      <div className={classNames('my-matches-tenants', className)}>
        <FilterMatchesModal open={filterMatchesModal} onBackdropClick={onCloseFilterModal}>
          <div className='modal-header'>
            <Typography variant='body2'>Filter your matches</Typography>
            <CloseButton onClick={onCloseFilterModal} size='medium' />
          </div>
          <div className='modal-body'>
            <div className='matches-with-offers'>
              <Typography variant='body4' className='show-only-matches-with-offers'>
                Show only matches with offers
              </Typography>
              <Radio />
            </div>
            <Select
              label='Match rate:'
              className='match-rate'
              value={draftFilter.matchRate}
              onChange={(e) => {
                setDraftFilter((prevDraftFilter) => ({
                  ...prevDraftFilter,
                  matchRate: Number(e.target.value)
                }));
              }}>
              {[20, 30, 40, 50, 60, 70, 80, 90].map((value) => (
                <option key={value} value={value}>
                  {`${value}% and above`}
                </option>
              ))}
            </Select>
            <div className='actions'>
              <Button
                size='large'
                variant='secondary'
                onClick={() => {
                  setDraftFilter({ matchRate: 20, withOffers: false });
                  setFilter({ matchRate: 20, withOffers: false });
                  onCloseFilterModal();
                }}>
                Reset filters
              </Button>
              <Button
                size='large'
                onClick={() => {
                  setFilter({ ...draftFilter });
                  onCloseFilterModal();
                }}>
                Set filters
              </Button>
            </div>
          </div>
        </FilterMatchesModal>
        <div className='header-and-content-wrapper'>
          <HeaderLoggedIn />
          <div className='content-wrapper'>
            <div className='content-header'>
              <div className='header-left-content'>
                <Typography>My matches</Typography>
                <Typography variant='body5'>
                  Here you can find all your matches as well as people/locations you are already matched with.
                </Typography>
              </div>

              <Label
                variant='secondary'
                className='filters-button'
                onClick={() => setFilterMatchesModal(true)}>
                <Icon icon='filter' />
                Filter matches
              </Label>
            </div>

            <div className='content'>
              {matchedTenants.data.map((tenantMatch, tenantIndex) => {
                const { criteria: tenantCriteria } = tenantMatch;

                return (
                  <TenantCard
                    key={tenantIndex}
                    transition={{ duration: 0.4 }}
                    name={`${tenantCriteria.firstName} ${tenantCriteria.lastName}`}
                    avatar={getAvatarFormIndex(tenantCriteria.avatar)}
                    inView={true}
                    percentage={tenantMatch?.property.percentage}
                    onViewProfileClick={() => {
                      setTenantToView(tenantMatch);
                    }}
                    matched={tenantMatch.matched}
                    awaitingMatch={tenantMatch.chosen && !tenantMatch.matched}
                    chatWith={() => {
                      newChatWith(tenantMatch._id);
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <Footer />
      </div>
      {tenantToView && (
        <ViewProfile
          tenantMatch={tenantToView}
          closeViewProfile={() => setTenantToView(null)}
          dislikeTenant={() => dislikeTenant.mutate(tenantToView.matchId)}
          disableLikeTenant
        />
      )}
    </>
  );
})`
  &.my-matches-tenants {
    box-sizing: border-box;
    display: grid;
    grid-template-rows: auto min-content;
    width: 100%;

    background: linear-gradient(180deg, #fffbf3 18.95%, #fff 100%), lightgray 50% / cover no-repeat;

    .header-and-content-wrapper {
      min-height: 100vh;
      display: grid;
      grid-template-rows: min-content auto;
      box-sizing: border-box;

      .content-wrapper {
        padding: 36px;
        display: grid;
        grid-template-rows: min-content auto;
        row-gap: 48px;
        box-sizing: border-box;

        .content-header {
          display: flex;
          justify-content: space-between;
          column-gap: 24px;
          align-items: center;
          box-sizing: border-box;

          .header-left-content {
            display: grid;
            row-gap: 8px;
          }

          .filters-button {
            display: flex;
            column-gap: 8px;
            padding: 16px 20px;
            height: 56px;
          }
        }

        .content {
          min-height: calc(100vh - 112px);
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          box-sizing: border-box;

          gap: 24px;
          justify-items: center;
          justify-self: center;
          align-content: flex-start;
        }
      }
    }
  }
`;
const FilterMatchesModal = styled(Modal)`
  & {
    .modal-container {
      padding: 0 !important;
    }
    padding: 24px;
    max-width: 440px;
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 16px 24px;
      box-sizing: border-box;
    }
    .modal-body {
      display: grid;
      padding: 16px 24px 24px 24px;
      justify-content: center;
      gap: 32px;
      .matches-with-offers {
        display: flex;
        padding: 24px;
        border: 1px solid #e7e7e7;
        border-radius: 8px;
        justify-content: space-between;
        align-items: center;
        gap: 16px;

        .show-only-matches-with-offers {
          font-weight: 700;
        }
        .radio-button {
          border: 2px solid #184d6d;
        }
      }
      .match-rate {
        label {
          font-size: 14px;
          line-height: 20px;
          font-weight: 700;
          color: #6a6d6d;
        }
        .input-wrapper {
          select {
            font-size: 16px;
            line-height: 24px;
            font-weight: 700;
            color: #0d2a38;
            font-family: 'Roobert', serif;
          }
        }
      }
      .actions {
        display: flex;
        column-gap: 16px;
        .button {
          width: 188px;
          padding: 20px 32px;
          flex-grow: 1;
        }
      }
    }
  }
`;
