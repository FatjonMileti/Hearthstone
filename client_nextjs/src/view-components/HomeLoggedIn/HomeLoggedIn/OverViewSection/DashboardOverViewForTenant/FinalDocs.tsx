import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { useNavigate } from '../../../../../compat/router';

import { Avatar, Label, Typography } from '../../../../../components/index';
import { useProfileStore } from '../../../../../globalState/profile';
import { getAvatarFormIndex } from '../../avatars';
import { MatchedPropertyType } from '../../../../Matches/matches.type';
import { motion, MotionProps } from 'framer-motion';

interface FinalDocsProps extends HTMLAttributes<HTMLDivElement> {
  match: MatchedPropertyType;
  motionProps?: MotionProps;
}
export const FinalDocs = styled(({ className, match, motionProps = {} }: FinalDocsProps) => {
  const navigate = useNavigate();
  const profileStore = useProfileStore();

  const onReviewPerfectMatchesClick = () => {
    navigate('/matches');
  };

  return (
    <motion.div className={classNames('final-docs', className)} {...motionProps}>
      <div className='left-content'>
        <div className='texts-wrapper'>
          <Typography variant='body1'>You’re almost there!</Typography>
          <Typography variant='body4'>
            You have one last step to complete which is signing the final documents. You have 2 days to sign
            and send the final documents. Once you and your perfect match have the documents signed, you have
            officially rented out your property.
          </Typography>
        </div>

        <Label
          className='review-matches-button'
          variant='special'
          size='large'
          onClick={onReviewPerfectMatchesClick}>
          Sign final documents
        </Label>
      </div>
      <div className='right-content'>
        <Avatar image={getAvatarFormIndex(profileStore.avatar)} />
        <Avatar image={match.property.property_images?.[0]?.link} />
      </div>
    </motion.div>
  );
})`
  &.final-docs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 904px;
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
      padding: 24px;
      display: grid;
      grid-template-rows: min-content min-content;
      justify-content: center;

      .avatar {
        width: 230px;
        height: 230px;
        position: relative;
        &:nth-of-type(2) {
          margin-top: -64px;

          &:before {
            content: '';
            background-color: #123b52;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            clip-path: circle(50% at 50% -51px);
          }
        }
      }
    }
  }
`;
