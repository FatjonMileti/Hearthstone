import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import { Typography } from '../../../components/Typography';
import { Label } from '../../../components/Label';
import classNames from 'classnames';
import { Icon } from '../../../components/Icon';

interface CreteAccountOrSignInProps extends HTMLAttributes<HTMLDivElement> {
  onSignInClick: () => void;
  onCreateAccountClick: () => void;
  onBack: () => any;
}
export const CreteAccountOrSignIn = styled(
  ({ className, onSignInClick, onBack, onCreateAccountClick }: CreteAccountOrSignInProps) => {
    return (
      <div className={classNames('create-account-or-sign-in', className)}>
        <div className='section-content'>
          <Icon icon='intersect' size={64} color='#E5155A' />
          <div className='texts'>
            <Typography variant='body2' className='title'>
              You need to have an account to match with tenants
            </Typography>
            <Typography variant='body4'>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
              labore et dolore magna aliqua.
            </Typography>
          </div>
          <div className='buttons'>
            <Label size='large' onClick={onCreateAccountClick}>
              Create Account
            </Label>
            <Label variant='secondary' size='large' onClick={onSignInClick}>
              Sign in
            </Label>
          </div>
        </div>

        <div className='section-footer'>
          <Label variant='secondary' size='large' onClick={onBack}>
            <Icon icon='arrow-left' /> Back
          </Label>
        </div>
      </div>
    );
  }
)`
  &.create-account-or-sign-in {
    display: grid;
    height: 100%;
    grid-template-rows: auto min-content;

    .section-content {
      display: grid;
      justify-items: center;
      row-gap: 48px;
      height: 100%;
      align-content: center;

      .icon {
        background-image: linear-gradient(to right, #833ab4, #fd1d1d, #fcb045);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .texts {
        display: grid;
        justify-items: center;
        row-gap: 16px;
        max-width: 670px;
        text-align: center;
        .title {
          max-width: 440px;
        }
      }
      .buttons {
        column-gap: 24px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        .label {
          width: 100%;
        }
      }
    }

    .section-footer {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr;
      align-items: center;
      justify-content: space-between;
      padding: 24px 36px;
      box-sizing: border-box;
    }
  }
`;
