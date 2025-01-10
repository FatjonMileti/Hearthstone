import React from 'react';
import { styled } from '@mui/system';
import { Typography } from './Typography';
import classNames from 'classnames';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  underline?: 'always' | 'hover' | 'none';
  size?: 'small' | 'medium';
}

export const Link = styled(
  ({ className, children, underline = 'hover', size = 'small', ...rest }: LinkProps) => {
    return (
      <a className={classNames('link', className, `underline-${underline}`, size)} {...rest}>
        <Typography variant='body5'>{children}</Typography>
      </a>
    );
  }
)`
  cursor: pointer;

  .typography {
    font-size: 14px;
    line-height: 24px;
    font-weight: 500;

    text-underline-offset: 8px;
    text-decoration-thickness: 1px;
    transition: text-decoration 2s;
  }

  &.small {
    padding: 4px 0;
    .typography {
      color: #0d2a38;
    }
  }

  &.medium {
    padding: 8px 0;
    .typography {
      font-weight: 700;
      color: #184d6d;
    }
    &:hover {
      .typography {
        color: #0d2a38;
      }
    }
  }

  &.underline-none {
    .typography {
      text-decoration: none;
    }
  }

  &.underline-hover {
    &:hover {
      .typography {
        text-decoration: underline;
      }
    }
  }

  &.underline-always {
    .typography {
      text-decoration: underline;
    }
  }
`;
