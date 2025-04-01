import { styled } from '@mui/system';
import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { Icon, Label, ShowGlobalLoading, Typography } from '../../../../../components/index';

import { useNavigate } from '../../../../../compat/router';
import { MatchedTenantType } from '../../../../Matches/matches.type';
import { getAvatarFormIndex } from '../../avatars';
import { useProfileStore } from '../../../../../globalState/profile';
import { ViewProfile } from '../../../../Matches/MatchesTenants/ViewProfile';
import { useMutation } from '@tanstack/react-query';
import { cancelMatchedTenant } from '../../../../Matches/MatchesForLandlord/cancelMatchedTenant';
import { useMatchedTenants } from '../../../../Matches/MatchesTenants/useMatchedTenants';
import { useUserStore } from '../../../../../globalState/user';
import { motion, MotionProps } from 'framer-motion';

interface PerfectMatchProps extends HTMLAttributes<HTMLDivElement> {
  match: MatchedTenantType;
  motionProps?: MotionProps;
}
export const PerfectMatch = styled(({ className, match, motionProps = {} }: PerfectMatchProps) => {
  const navigate = useNavigate();
  const profileStore = useProfileStore();
  const userStore = useUserStore();

  const [perfectMatchToView, setPerfectMatchToView] = React.useState<MatchedTenantType | null>(null);

  const matchedTenants = useMatchedTenants({
    params: { chosen: true },
    options: {
      refetchOnMount: true
    }
  });
  const onMessageClick = () => {
    navigate(`/messages?matchId=${match._id}`);
  };

  const dislikeTenant = useMutation({
    mutationFn: cancelMatchedTenant,
    onSuccess: () => {
      if (perfectMatchToView) {
        setPerfectMatchToView(null);
      }
      matchedTenants.refetch();
    }
  });

  return (
    <>
      {dislikeTenant.isLoading && <ShowGlobalLoading />}
      <motion.div className={classNames('perfect-match', className)} {...motionProps}>
        <div className='left-content'>
          <div className='texts-wrapper'>
            <Typography variant='body1'>Good news! You got a perfect match</Typography>
            <Typography variant='body4'>
              Hey {profileStore.first_name}, you are now perfectly matched with{' '}
              <b>{`${match.tenant.first_name}'s`} property</b>. Reach out and drop a message to the landlord
              and when ready, make an offer and close the deal.
            </Typography>
          </div>
          <div className='action-buttons'>
            {match.matched && (
              <Label variant='secondary' inverted size='large' onClick={onMessageClick}>
                <Icon icon='email' />
                Message
              </Label>
            )}
            {!match.matched && (
              <Label variant='primary' inverted size='large' onClick={() => setPerfectMatchToView(match)}>
                Property details
              </Label>
            )}
          </div>
        </div>
        <div
          className='right-content'
          style={{ backgroundImage: `url(' ${getAvatarFormIndex(match.tenant.avatar)} ')` }}>
          <div className='tenant-details-wrapper'>
            <Typography
              className='tenant-name'
              variant='body3'>{`${match.tenant.first_name} ${match.tenant.last_name}`}</Typography>
            <Typography variant='body5'></Typography>
          </div>
        </div>
      </motion.div>
      {perfectMatchToView && (
        <ViewProfile
          tenantMatch={perfectMatchToView}
          closeViewProfile={() => setPerfectMatchToView(null)}
          dislikeTenant={() =>
            dislikeTenant.mutate({
              access_token: userStore.auth.access_token,
              matchId: perfectMatchToView.matchId
            })
          }
          disableLikeTenant
        />
      )}
    </>
  );
})`
  &.perfect-match {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 904px;
    align-items: flex-start;
    gap: 24px;
    border-radius: 16px;
    overflow: hidden;

    background: linear-gradient(180deg, #e5155a 0%, #b4263b 100%);

    /* Shadow L */
    box-shadow: 0px 4px 32px 0px rgba(13, 42, 56, 0.1);

    .left-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 48px;
      box-sizing: border-box;
      height: 100%;
      justify-content: space-between;

      .texts-wrapper {
        display: flex;
        flex-direction: column;
        gap: 16px;
        color: white;
      }

      .action-buttons {
        display: flex;
        gap: 16px;
      }
    }

    .right-content {
      width: 440px;
      height: 440px;
      background-size: cover;
      position: relative;
      .tenant-details-wrapper {
        display: flex;
        padding: 24px;
        align-items: flex-end;
        box-sizing: border-box;
        position: absolute;
        width: 100%;
        bottom: 0;
        background: linear-gradient(180deg, rgba(13, 42, 56, 0) 0%, rgba(13, 42, 56, 0.25) 50%, #0d2a38 100%);
        height: 270px;
        .tenant-name {
          font-weight: 900;
          color: white;
        }
      }
    }
  }
`;
