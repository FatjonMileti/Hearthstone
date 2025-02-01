import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';

import { Avatar, Icon, Label, Typography } from '../../../../components/index.ts';

import { MatchedPropertyType } from '../../../Matches/matches.type.ts';
import { getAvatarFormIndex } from '../../avatars.tsx';
import { useProfileStore } from '../../../../globalState/profile.tsx';
import { motion, MotionProps } from 'framer-motion';

interface MultiplePerfectMatchesProps extends HTMLAttributes<HTMLDivElement> {
  match: MatchedPropertyType;
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
              <b>{`${match.landlord.first_name}'s`} property</b>. Reach out and drop a message to the landlord
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
          style={{ backgroundImage: `url(' ${match.property.property_images?.[0]?.link} ')` }}>
          <div className='slide-header'>
            <div className='header-left-content'>
              <Avatar image={getAvatarFormIndex(match.landlord.avatar)} />
              <div>
                <Typography variant='body5'>{`${match.landlord.first_name} ${match.landlord.last_name}`}</Typography>
              </div>
            </div>
          </div>

          <div className='slide-footer'>
            <Typography className='property-name'>{match.property.title}</Typography>
            <div className='property-details'>
              <div className='detail'>
                <Icon icon='location' />
                <Typography variant='body5'>{match.property.area_of_interest}</Typography>
              </div>
              <span className='dot'>•</span>
              <div className='detail'>
                <Typography variant='body5'>
                  £{match.property.budget.min_budget} - £{match.property.budget.max_budget}PCM
                </Typography>
              </div>
              <span className='dot'>•</span>
              <div className='detail'>
                <Icon icon='double-bed' />
                <Typography variant='body5'>{match.property.room_details.numberOfBedrooms}</Typography>
              </div>
              <span className='dot'>•</span>
              <div className='detail'>
                <Icon icon='bathtub' />
                <Typography variant='body5'>{match.property.room_details.number_of_bathrooms}</Typography>
              </div>
            </div>
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

      display: flex;
      gap: 10px;
      flex-direction: column;
      justify-content: space-between;

      .slide-header {
        padding: 24px;
        background: linear-gradient(180deg, rgba(38, 38, 38, 0.8) 0%, rgba(38, 38, 38, 0) 100%);
        display: flex;
        column-gap: 24px;
        align-items: center;
        justify-content: space-between;

        .header-left-content {
          display: flex;
          column-gap: 8px;
          align-items: center;

          .avatar {
            height: 44px;
            width: 44px;
          }

          .typography {
            color: white;
            font-weight: 700;
          }
        }
      }

      .slide-footer {
        padding: 24px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 8px;
        background: linear-gradient(180deg, rgba(13, 42, 56, 0) 0%, #0d2a38 100%);

        .property-name {
          font-family: Roobert, serif;
          font-size: 18px;
          font-style: normal;
          font-weight: 700;
          line-height: 24px;
          color: white;
        }

        .property-details {
          color: white;
          font-weight: 700;
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;

          .dot {
            color: #a7a7a7;
          }

          .detail {
            display: flex;
            column-gap: 4px;
            align-items: center;

            .icon {
              height: 20px !important;
              width: 20px !important;
            }
          }
        }
      }
    }
  }
`;
