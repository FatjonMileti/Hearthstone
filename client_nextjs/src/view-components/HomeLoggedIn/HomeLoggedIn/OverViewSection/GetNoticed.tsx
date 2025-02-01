import { styled } from '@mui/system';
import { HTMLProps } from 'react';
import { Icon, Label, Typography } from '../../../components/index.ts';
import classNames from 'classnames';
import { Step } from '../../../components/Step.tsx';
import { useProfileStore } from '../../../globalState/profile.tsx';
import { useNavigate } from 'react-router-dom';
import { DocumentType } from '../../MyAccount/user.interface.ts';

interface GetNoticedProps extends HTMLProps<HTMLDivElement> {}
export const GetNoticed = styled(({ className }: GetNoticedProps) => {
  const profileStore = useProfileStore();
  const navigate = useNavigate();

  const isAvatarAdded = !!profileStore.avatar;
  const isBioFilled = !!profileStore.description;
  const isIdVerified = !!profileStore.documents?.find((d) => d.type === DocumentType['Proof of ID']);

  const onFillBioClick = () => {
    navigate('/my-account/my-bio');
  };

  const onVerifyIdClick = () => {
    navigate('/my-account/security-details');
  };

  return (
    <div className={classNames('get-noticed', className)}>
      <div className='title-and-icon-wrapper'>
        <Icon className='star-icon' icon='star' />
        <Typography className='title' variant='body3'>
          Get noticed!
        </Typography>
      </div>
      <Typography variant='body4' className='description'>
        Add more information to your profile to improve your chances of landing your perfect match.
      </Typography>

      <div>
        <Step
          title='Add an avatar'
          description='You’ve selected your avatar.'
          state={isAvatarAdded ? 'filled' : 'default'}
        />
        <Step
          title='Fill out your bio'
          description='Describe yourself in a few words for potential matches.'
          state={isBioFilled ? 'filled' : 'default'}
          cta={
            <Label size='medium' variant='primary' onClick={onFillBioClick}>
              Fill Bio
            </Label>
          }
        />
        <Step
          title='Verify your ID'
          description='Let everyone know you’re legit and avoid scams.'
          state={isIdVerified ? 'filled' : 'default'}
          lastStep
          cta={
            <Label size='medium' variant='primary' onClick={onVerifyIdClick}>
              Verify ID
            </Label>
          }
        />
      </div>
    </div>
  );
})`
  &.get-noticed {
    display: flex;
    padding: 24px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    align-self: stretch;
    width: 100%;
    box-sizing: border-box;

    .title-and-icon-wrapper {
      display: flex;
      align-items: flex-start;
      gap: 8px;

      .title {
        font-weight: 900;
      }

      .description {
        align-self: stretch;
      }
    }
  }
`;
