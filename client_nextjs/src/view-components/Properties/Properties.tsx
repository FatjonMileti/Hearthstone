// @ts-nocheck
import React from 'react';
import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import { useLocation, useNavigate } from '../../compat/router';
import { useQuery } from '@tanstack/react-query';

import { SegmentControl, Typography, ShowGlobalLoading, Icon, Label } from '../../components/index';
import axios from '../../utils/axios';
import { useUserStore } from '../../globalState/user';
import { Property } from './Property/Property';
import { EditPropertyModal } from './NewProperty/EditPropertyModal';
import { AddPropertyModal } from './NewProperty/AddPropertyModal';
import { HeaderLoggedIn } from '../PagesComponents/HeaderLoggedIn/HeaderLoggedIn';
import { Footer } from '../Home/Footer';
import { ApiPropertyDocumentType } from './NewProperty/property.types';

enum ActiveTab {
  Published = 'published',
  Draft = 'draft'
}

interface PropertiesApiResponse {
  docs: ApiPropertyDocumentType[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  nextPage: number;
  page: number;
  pagingCounter: number;
  prevPage: number;
  totalDocs: number;
  totalDocsUnfiltered: number;
  totalPages: number;
}

export const Properties = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  const [paginationAndSort, setPaginationAndSort] = React.useState<PaginationAndSortParams>({
    page: 1,
    pageSize: 25,
    sort: 'updated_at',
    asc: false
  });

  const [showNewPropertyModal, setShowNewPropertyModal] = React.useState<boolean>(false);
  const [editPropertyId, setEditPropertyId] = React.useState<string | undefined>(undefined);

  const [activeTab, setActiveTab] = React.useState(ActiveTab.Published);

  const { auth } = useUserStore();

  const queryParams = new URLSearchParams(useLocation().search);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (queryParams.get('newProperty')) {
      setShowNewPropertyModal(true);
    }
  }, []);

  const propertiesQuery = useQuery({
    queryKey: ['properties', activeTab],
    queryFn: async () => {
      const { data } = await axios(auth.access_token).get<PropertiesApiResponse>('/api/asset', {
        params: {
          ...paginationAndSort,
          status: activeTab
        }
      });
      return data;
    },
    onSuccess: (data) => {
      setPaginationAndSort((paginationAndSort) => ({
        ...paginationAndSort,
        page: data.page,
        pageSize: data.limit
      }));
    }
  });

  return (
    <div className={`properties-page ${className}`}>
      {propertiesQuery.isFetching && <ShowGlobalLoading />}

      <div className='header-and-content-wrapper'>
        <HeaderLoggedIn />

        {/*{propertiesQuery.isFetched && propertiesQuery?.data?.totalDocsUnfiltered !== 0 && (*/}
        <div className='page-body-wrapper'>
          <div className='properties-header'>
            <Typography variant='body1' className='page-title'>
              My Properties
            </Typography>
            <div className='tabs-wrapper'>
              <SegmentControl
                label='Published'
                active={activeTab === ActiveTab.Published}
                onClick={() => setActiveTab(ActiveTab.Published)}
              />
              <SegmentControl
                label='Drafts'
                active={activeTab === ActiveTab.Draft}
                onClick={() => setActiveTab(ActiveTab.Draft)}
              />
            </div>
            <Label
              size='large'
              onClick={() => {
                setShowNewPropertyModal(true);
              }}>
              <Icon icon='plus' size={24} />
              Add Property
            </Label>
          </div>

          <div className='properties-list'>
            {propertiesQuery?.data?.docs.map((p, pIndex: number) => (
              <Property
                propertyId={p._id}
                key={pIndex}
                name={p.title}
                status={p.status_string}
                location={p.area_of_interest}
                budget={p.budget}
                roomsDetails={p.room_details}
                viewDetails={() => {
                  setEditPropertyId(p._id);
                }}
                afterPublish={() => {
                  setActiveTab(ActiveTab.Published);
                }}
                images={p.property_images || []}
              />
            ))}
          </div>
        </div>
        {/* )} */}
      </div>

      {editPropertyId && (
        <EditPropertyModal
          showStore={[!!editPropertyId, () => setEditPropertyId(undefined)]}
          propertyId={editPropertyId}
          afterSaveAsDraft={() => {
            setEditPropertyId(undefined);
            propertiesQuery.refetch();
          }}
          afterDelete={() => propertiesQuery.refetch()}
          onBack={() => setEditPropertyId(undefined)}
          afterStartMatching={() => {
            setEditPropertyId(undefined);
            navigate('/matches');
          }}
        />
      )}

      <AddPropertyModal
        showStore={[showNewPropertyModal, setShowNewPropertyModal]}
        afterSave={() => {
          setShowNewPropertyModal(false);
          propertiesQuery.refetch();
          navigate('/matches');
        }}
        onBack={() => setEditPropertyId(undefined)}
      />

      <Footer />
    </div>
  );
})`
  &.properties-page {
    display: grid;
    align-content: flex-start;
    position: relative;
    grid-template-rows: min-content auto;
    height: 100%;

    .header-and-content-wrapper {
      min-height: 100vh;
      display: grid;
      grid-template-rows: min-content auto;
      box-sizing: border-box;
    }

    .page-body-wrapper {
      display: grid;
      grid-template-rows: min-content auto;

      .properties-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px 36px;
        gap: 16px;

        .page-title {
          color: #0d2a38;
          font-weight: 600;
          line-height: 56px;
        }

        .tabs-wrapper {
          display: flex;
          gap: 8px;
        }
      }

      .properties-list {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        padding: 24px 36px 48px 36px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #fff 51.5%);
      }
    }

    .no-properties {
      position: absolute;
      inset: 0;
      display: grid;
      justify-items: center;
      align-content: center;
      height: 100%;

      .add-property-button {
        margin-top: 32px;
      }
    }
  }
`;
