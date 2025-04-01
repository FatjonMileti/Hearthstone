import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';

import { Label } from '../../../components/Label';
import { Typography } from '../../../components/Typography';

import { Icon } from '../../../components/Icon';
import { useNavigate } from '../../../compat/router';

interface TenantsMatchingHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const TenantsMatchingHeader = styled(({ className }: TenantsMatchingHeaderProps) => {
  const navigate = useNavigate();
  return (
    <div className={classNames(className, 'tenants-matching-header')}>
      <div className='criteria-wrapper'>
        <div className='criteria'>
          <Typography variant='body6' className='criteria-key'>
            Looking for
          </Typography>
          <Typography variant='body5' className='criteria-value'>
            Tenants
          </Typography>
        </div>
        <div className='divider-line' />
        <div className='criteria'>
          <Typography variant='body6' className='criteria-key'>
            Credit score
          </Typography>
          <Typography variant='body5' className='criteria-value'>
            Good
          </Typography>
        </div>

        <div className='divider-line' />
        <div className='criteria'>
          <Typography variant='body6' className='criteria-key'>
            Move in
          </Typography>
          <Typography variant='body5' className='criteria-value'>
            Immediately
          </Typography>
        </div>
        <div className='divider-line' />
      </div>
      <Label variant='tertiary' onClick={() => navigate('/my-account/properties')}>
        <Icon icon='filter' />
        Preferences
      </Label>
    </div>
  );
})`
  &.tenants-matching-header {
    padding: 12px 32px;

    background: #fff;
    /* Card Shadow */
    box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.1);
    border-radius: 32px;

    display: flex;
    column-gap: 16px;
    font-weight: 500;

    .criteria-wrapper {
      display: flex;
      column-gap: 16px;

      .criteria {
        display: grid;

        .criteria-key {
          font-weight: 500;
          color: #a7a7a7;
        }
        .criteria-value {
          font-weight: 700;
          color: #0d2a38;
        }
      }
    }

    .divider-line {
      width: 1px;
      background: #e7e7e7;
    }
  }
`;
