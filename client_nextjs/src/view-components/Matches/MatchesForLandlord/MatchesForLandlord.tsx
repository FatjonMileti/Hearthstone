import { styled } from '@mui/system';
import classNames from 'classnames';
import React, { HTMLAttributes } from 'react';

import { Footer } from '../../Home/Footer.tsx';

import { HeaderLoggedIn } from '../../PagesComponents/HeaderLoggedIn/HeaderLoggedIn.tsx';
import { PotentialMatches } from './PotentialMatches.tsx';
import { Icon, Label, SegmentControl, Typography } from '../../../components/index.ts';
import { useSuggestedTenants } from '../../Suggestions/SugestionsTenants/useSuggestedTenants.tsx';
import { PerfectMatches } from './PerfectMatches.tsx';
import { useMatchedTenants } from '../MatchesTenants/useMatchedTenants.tsx';

enum ActiveTab {
  Perfect = 'Perfect',
  Potential = 'Potential'
}

interface MatchesForLandlordProps extends HTMLAttributes<HTMLDivElement> {}

export const MatchesForLandlord = styled(({ className }: MatchesForLandlordProps) => {
  const [activeTab, setActiveTab] = React.useState(ActiveTab.Potential);

  const suggestedTenants = useSuggestedTenants({
    params: { chosen: false, disliked: false },
    options: {
      refetchOnMount: true
    }
  });

  const matchedTenants = useMatchedTenants({
    params: { chosen: true },
    options: {
      refetchOnMount: true
    }
  });

  return (
    <div className={classNames('matches-for-landlord', className)}>
      <div className='header-and-content-wrapper'>
        <HeaderLoggedIn />
        <div className='content-wrapper'>
          <div className='section-header'>
            <div className='header-left-content'>
              <Typography className='page-name'>My matches</Typography>
            </div>

            <div className='tabs-wrapper'>
              <SegmentControl
                label='Potential matches'
                active={activeTab === ActiveTab.Potential}
                onClick={() => setActiveTab(ActiveTab.Potential)}
                counter={(suggestedTenants.data?.length > 0 && suggestedTenants.data?.length) || undefined}
              />
              <SegmentControl
                label='Saved matches'
                active={activeTab === ActiveTab.Perfect}
                onClick={() => setActiveTab(ActiveTab.Perfect)}
                counter={(matchedTenants.data?.length > 0 && matchedTenants.data?.length) || undefined}
              />
            </div>

            <div className='header-right-content'>
              {activeTab === ActiveTab.Potential && (
                <Label variant='special' size='large' className='filters-button'>
                  <Icon icon='filter' />
                  Match options ({suggestedTenants.data?.length})
                </Label>
              )}
            </div>
          </div>
          {activeTab === ActiveTab.Potential && <PotentialMatches />}
          {activeTab === ActiveTab.Perfect && <PerfectMatches />}
        </div>
      </div>
      <Footer />
    </div>
  );
})`
  &.matches-for-landlord {
    box-sizing: border-box;
    display: grid;
    grid-template-rows: auto min-content;
    width: 100%;
    //background: linear-gradient(180deg, #fffbf3 13.21%, #fff 51.66%), #fff;

    .header-and-content-wrapper {
      min-height: 100vh;
      display: grid;
      grid-template-rows: min-content auto;
      box-sizing: border-box;

      .content-wrapper {
        display: grid;
        grid-template-rows: min-content auto;
        box-sizing: border-box;

        .section-header {
          display: grid;
          grid-template-columns: 1fr max-content 1fr;
          padding: 24px 36px;
          align-items: center;
          width: 100%;
          box-sizing: border-box;

          .tabs-wrapper {
            display: flex;
            align-items: flex-start;
            gap: 8px;
          }

          .header-right-content {
            display: flex;
            justify-content: flex-end;
          }

          .header-left-content {
            .page-name {
              font-weight: 600;
              line-height: 56px;
            }
          }
        }
      }
    }
  }
`;
