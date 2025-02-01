import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';

import { Label, Typography } from '../../../../components/index.ts';

import { MatchedTenantType } from '../../../Matches/matches.type.ts';
import { useProfileStore } from '../../../../globalState/profile.tsx';
import { getAvatarFormIndex } from '../../avatars.tsx';
import { motion, MotionProps } from 'framer-motion';

interface MultiplePerfectMatchesProps extends HTMLAttributes<HTMLDivElement> {
  match: MatchedTenantType;
  count: number;
  motionProps?: MotionProps;
}
export const MultiplePerfectMatches = styled(
  ({ className, match, count, motionProps = {} }: MultiplePerfectMatchesProps) => {
    const navigate = useNavigate();
    const profileStore = useProfileStore();

    const onReviewPerfectMatchesClick = () => {
      navigate('/matches');
    };

    return (
      <motion.div className={classNames('perfect-match', className)} {...motionProps}>
        <div className='left-content'>
          <div className='texts-wrapper'>
            <Typography variant='body1'>Amazing! You got {count} perfect matches</Typography>
            <Typography variant='body4'>
              Hey {profileStore.first_name}, you are now perfectly matched with{' '}
              <b>{`${match.tenant.first_name}'s`} property</b>. Reach out and drop a message to the landlord
              and when ready, make an offer and close the deal.
            </Typography>
          </div>

          <Label
            className='review-matches-button'
            variant='special'
            size='large'
            onClick={onReviewPerfectMatchesClick}>
            Review perfect matches
          </Label>
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
    );
  }
)`
  &.perfect-match {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 904px;
    align-items: flex-start;
    gap: 24px;
    border-radius: 16px;
    overflow: hidden;

    background: linear-gradient(180deg, #184d6d 0%, #0d2a38 100%);

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

      .review-matches-button {
        width: 100%;
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
