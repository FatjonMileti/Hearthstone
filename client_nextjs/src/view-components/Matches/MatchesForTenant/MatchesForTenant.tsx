import { styled } from '@mui/system';
import classNames from 'classnames';
import React, { HTMLAttributes } from 'react';

import { Footer } from '../../Home/Footer';
import { HeaderLoggedIn } from '../../PagesComponents/HeaderLoggedIn/HeaderLoggedIn';
import { PotentialMatches } from './PotentialMatches';
import { Icon, Label, SegmentControl, Typography } from '../../../components/index';
import { useGlobalSetCriteria } from '../../SetCriteria/GlobalSetCriteria';
import { useSuggestedProperties } from '../../Suggestions/SuggestionsProperties/useSuggestedProperties';
import { PerfectMatches } from './PerfectMatches';
import { useMatchedProperties } from '../MatchesProperties/useMatchedProperties';

enum ActiveTab {
  Perfect = 'Perfect',
  Potential = 'Potential'
}

interface MatchesForTenantProps extends HTMLAttributes<HTMLDivElement> {}

export const MatchesForTenant = styled(({ className }: MatchesForTenantProps) => {
  const [activeTab, setActiveTab] = React.useState(ActiveTab.Potential);

  const globalSetCriteria = useGlobalSetCriteria();

  const suggestedProperties = useSuggestedProperties({
    params: { chosen: false },
    options: {
      refetchOnMount: true
    }
  });

  const matchedProperties = useMatchedProperties({
    params: { chosen: true },
    options: {
      refetchOnMount: true
    }
  });

  const onMatchOptionsClick = () => {
    globalSetCriteria.openSetCriteria({
      afterSetCriteria: () => {
        suggestedProperties.refetch();
      }
    });
  };

  return (
    <div className={classNames('matches-for-tenant', className)}>
      <div className='header-and-content-wrapper'>
        <HeaderLoggedIn />

        <div className='content-wrapper'>
          <div className='section-header'>
            <div className='header-left-content'>
              <Typography className='page-name'>My matches</Typography>
            </div>

            <div className='tabs-wrapper'>
              {suggestedProperties.isFetched && matchedProperties.isFetched && (
                <>
                  <SegmentControl
                    label='Potential matches'
                    active={activeTab === ActiveTab.Potential}
                    onClick={() => setActiveTab(ActiveTab.Potential)}
                    counter={
                      (suggestedProperties.data?.length > 0 && suggestedProperties.data?.length) || undefined
                    }
                  />

                  <SegmentControl
                    label='Saved matches'
                    active={activeTab === ActiveTab.Perfect}
                    onClick={() => setActiveTab(ActiveTab.Perfect)}
                    counter={
                      (matchedProperties.data?.length > 0 && matchedProperties.data?.length) || undefined
                    }
                  />
                </>
              )}
            </div>

            <div className='header-right-content'>
              {activeTab === ActiveTab.Potential && (
                <Label
                  variant='special'
                  size='large'
                  className='filters-button'
                  onClick={onMatchOptionsClick}>
                  <Icon icon='filter' />
                  Match options ({suggestedProperties.data?.length})
                </Label>
              )}
            </div>
          </div>

          {suggestedProperties.isFetched && matchedProperties.isFetched && (
            <>
              {activeTab === ActiveTab.Potential && <PotentialMatches />}
              {activeTab === ActiveTab.Perfect && <PerfectMatches />}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
})`
  &.matches-for-tenant {
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

      .header-logged-in {
        border: 1px solid #eee0d3;
      }

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
