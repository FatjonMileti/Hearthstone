import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { Label, Typography } from '../../../../../components/index';
import { useNavigate } from '../../../../../compat/router';
import { useSuggestedTenants } from '../../../../Suggestions/SugestionsTenants/useSuggestedTenants';
import { getAvatarFormIndex } from '../../avatars';
import { useProfileStore } from '../../../../../globalState/profile';
import { motion, MotionProps } from 'framer-motion';

interface MatchesAwaitingProps extends HTMLAttributes<HTMLDivElement> {
  motionProps?: MotionProps;
}
export const MatchesAwaiting = styled(({ className, motionProps = {} }: MatchesAwaitingProps) => {
  const suggestedTenants = useSuggestedTenants({
    params: { chosen: false, disliked: false },
    options: {
      refetchOnMount: true
    }
  });
  const profileStore = useProfileStore();

  const navigate = useNavigate();

  const onReviewMatchesClick = () => {
    navigate('matches');
  };

  return (
    <motion.div className={classNames('matches-awaiting', className)} {...motionProps}>
      <div className='left-content'>
        <div className='texts-wrapper'>
          <Typography variant='body1'>Matches are waiting</Typography>
          <Typography variant='body4'>
            Hey {profileStore.first_name}, we’ve found <b>153 potential matches</b> for you that match your
            requirements. Out of those, our algorithms indicate that there could be{' '}
            <b>24 perfect matches for you.</b>
          </Typography>
          <Typography variant='body4'>
            Click the button below to review them or find them in the Matches panel.
          </Typography>
        </div>
        <Label
          className='start-matching-button'
          variant='special'
          size='large'
          onClick={onReviewMatchesClick}>
          Review matches
        </Label>
      </div>
      <div className='right-content'>
        <div className='matches-wrapper'>
          {!suggestedTenants.isFetching &&
            suggestedTenants?.data.slice(0, 6).map((st, spIndex) => {
              return (
                <img key={spIndex} alt='Matched property' src={getAvatarFormIndex(st.criteria.avatar)} />
              );
            })}
        </div>
      </div>
    </motion.div>
  );
})`
  &.matches-awaiting {
    display: flex;
    width: 904px;
    align-items: flex-start;
    gap: 24px;
    flex-shrink: 0;

    border-radius: 16px;
    background: #fff;
    /* Shadow L */
    box-shadow: 0px 4px 32px 0px rgba(13, 42, 56, 0.1);

    .left-content {
      display: flex;
      padding: 48px;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 24px;
      flex: 1 0 0;
      align-self: stretch;

      .start-matching-button {
        width: 100%;
      }

      .texts-wrapper {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
        align-self: stretch;
      }
    }

    .right-content {
      display: flex;
      padding: 24px;
      align-items: flex-start;
      gap: 10px;

      .matches-wrapper {
        width: 392px;
        height: 392px;
        position: relative;

        img {
          flex-shrink: 0;
          position: absolute;
          object-fit: cover;
          border-radius: 50%;
          aspect-ratio: 1/1;

          &:nth-of-type(1) {
            height: 168px;
            top: 40px;
            right: 19px;
          }

          &:nth-of-type(2) {
            height: 168px;
            left: 102px;
            bottom: 40px;
          }

          &:nth-of-type(3) {
            height: 126px;
            left: 14px;
            top: 96px;
          }

          &:nth-of-type(4) {
            height: 84px;
            right: 30px;
            bottom: 91px;
          }

          &:nth-of-type(5) {
            height: 84px;
            top: 37px;
            left: 120px;
          }

          &:nth-of-type(6) {
            height: 84px;
            left: 14px;
            bottom: 73px;
          }
        }
      }
    }
  }
`;
