import { styled } from '@mui/system';
import React from 'react';
import { Header } from './Agreement.Header';
import { Footer } from '../Home/Footer';
import { ContentAgreement } from './ContentAgreement';

interface IPolicyAgreement {
  className?: React.HTMLAttributes<HTMLDivElement>;
}
export const PolicyAgreement = styled((props: IPolicyAgreement) => {
  const { className } = props;
  return (
    <div className={`agreement-page ${className}`}>
      <Header />
      <ContentAgreement />
      <Footer />
    </div>
  );
})`
  &.agreement-page {
    position: relative;
    min-height: 100vh;
    display: grid;
    grid-template-rows: min-content auto;
    background: linear-gradient(148deg, #fffbf3 18.95%, #fff 100%);
    z-index: 0;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background-repeat: no-repeat;
      opacity: 0.05;
      background-position-y: top;
      background-size: cover;
      z-index: -1;
    }

    .header {
      z-index: 1;
    }
  }
`;
