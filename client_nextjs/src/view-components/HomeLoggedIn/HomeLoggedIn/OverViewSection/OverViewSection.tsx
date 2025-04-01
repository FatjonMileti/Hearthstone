import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { DashboardOverview } from './DashboardOverview';
import { GetNoticed } from './GetNoticed';

export const motionPropsAnimatePresence = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    duration: 1
  }
};

interface OverViewSectionProps extends HTMLAttributes<HTMLDivElement> {}
export const OverViewSection = styled(({ className }: OverViewSectionProps) => {
  return (
    <div className={classNames('overview-section', className)}>
      <DashboardOverview />
      <GetNoticed />
    </div>
  );
})`
  &.overview-section {
    display: grid;
    grid-template-columns: 2fr 1fr;

    width: 1440px;
    padding: 48px 36px 24px 36px;
    align-items: center;
    gap: 24px;
    justify-self: center;
    box-sizing: border-box;
  }
`;
