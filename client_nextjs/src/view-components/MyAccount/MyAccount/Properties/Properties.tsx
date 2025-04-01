type IGridState = any;
import React from 'react';
import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import { useLocation, useNavigate } from '../../../../compat/router';

import { Typography } from '../../../../components';
import { Button } from '../../../../components';
import { Icon } from '../../../../components';
import { ShowGlobalLoading } from '../../../../components';
import { Label } from '../../../../components';

import axios from '../../../../utils/axios';
import { useUserStore } from '../../../../globalState/user';

import { Property } from './Property/Property';

import { EditPropertyModal } from '../../../Properties/NewProperty/EditPropertyModal';
import { AddPropertyModal } from '../../../Properties/NewProperty/AddPropertyModal';

const state: IGridState = {
  loading: true,
  rows: [],
  totalRows: 0,
  rowsPerPageOptions: [10, 20, 50],
  pageSize: 20,
  page: 1,
  rowCount: 0,
  sort: 'updated_at',
  asc: false,
  selectedIds: [],
  search: '',
  totalDocsUnfiltered: 0
};
export const Properties = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  const [list, setList] = React.useState<IGridState>({
    ...state
  });

  const [showNewPropertyModal, setShowNewPropertyModal] = React.useState<boolean>(false);
  const [editPropertyId, setEditPropertyId] = React.useState<string | undefined>(undefined);

  const [activeTab, setActiveTab] = React.useState('published');

  const { auth } = useUserStore();

  const queryParams = new URLSearchParams(useLocation().search);
  const navigate = useNavigate();

  React.useEffect(() => {
    setList((list) => ({
      ...list,
      search: activeTab
    }));
  }, [activeTab]);

  React.useEffect(() => {
    getAssets();
    if (queryParams.get('newProperty')) {
      setShowNewPropertyModal(true);
    }
  }, [list.search]);

  const getAssets = async () => {
    setList((prevList: any) => ({
      ...prevList,
      loading: true
    }));
    try {
      const { search, asc, sort, pageSize, page } = list;

      const { data } = await axios(auth.access_token).get('/api/asset', {
        params: {
          page: page || undefined,
          pageSize: pageSize,
          sort: sort || undefined,
          asc: asc.toString() || undefined,
          status: search || undefined
        }
      });

      setList((prevList: any) => ({
        ...prevList,
        rows: data.docs,
        totalRows: data.totalDocs,
        loading: false,
        totalDocsUnfiltered: data.totalDocsUnfiltered
      }));
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className={`properties-page ${className}`}>
      {list.loading && <ShowGlobalLoading />}

      {editPropertyId && (
        <EditPropertyModal
          showStore={[!!editPropertyId, () => setEditPropertyId(undefined)]}
          propertyId={editPropertyId}
          afterSaveAsDraft={() => {
            setEditPropertyId(undefined);
            getAssets();
          }}
          afterDelete={() => getAssets()}
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
          getAssets();
          navigate('/matches');
        }}
        onBack={() => setEditPropertyId(undefined)}
      />

      {!list.loading && list.rows.length === 0 && list.totalDocsUnfiltered === 0 && (
        <div className='no-properties'>
          <Typography variant='body2'>You currently have no properties in your portfolio</Typography>
          <Button
            size='large'
            className='add-property-button'
            startIcon={<Icon icon='plus' size={16} />}
            onClick={() => {
              setShowNewPropertyModal(true);
            }}>
            Add Property
          </Button>
        </div>
      )}

      {!list.loading && list?.totalDocsUnfiltered !== 0 && (
        <>
          <div className='properties-header'>
            <div className='manage-properties-bar'>
              <Typography variant='body2'>My Properties</Typography>
              <Button
                className='add-property-button'
                startIcon={<Icon icon='plus' size={20} />}
                onClick={() => {
                  setShowNewPropertyModal(true);
                }}>
                Add Property
              </Button>
            </div>

            <div className='filter-properties-tabs'>
              <Label
                variant='tertiary'
                size='large'
                active={activeTab === 'published'}
                onClick={() => setActiveTab('published')}>
                Published
              </Label>
              <Label
                variant='tertiary'
                size='large'
                active={activeTab === 'draft'}
                onClick={() => setActiveTab('draft')}>
                Drafts
              </Label>
              <Label
                variant='tertiary'
                size='large'
                active={activeTab === 'rented'}
                onClick={() => setActiveTab('rented')}>
                Under rental
              </Label>
            </div>
          </div>

          <div className='properties-list'>
            {list.rows.map((p, pIndex: number) => (
              <Property
                propertyId={p._id}
                key={pIndex}
                name={p.title}
                status={p.status_string}
                description={p.description}
                location={p.area_of_interest}
                area={p.floor_size}
                areaUnit={p.floor_size_unit}
                budget={p.budget}
                roomsDetails={p.room_details}
                propertyType={p.property_type}
                parkingSpot={p.parking_spot}
                epcRating={p.epc_rating}
                viewDetails={() => {
                  setEditPropertyId(p._id);
                }}
                images={p.property_images.length > 0 ? p.property_images : []}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
})`
  &.properties-page {
    display: grid;
    row-gap: 32px;
    align-content: flex-start;
    position: relative;
    grid-template-rows: min-content auto;
    height: 100%;

    .properties-header {
      display: grid;
      gap: 16px;

      .manage-properties-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .add-property-button {
           background-color: #E5155A;
            padding: 12px 20px;
        }
      }

      .filter-properties-tabs {
        display: flex;
        align-items: flex-start;
        border-bottom: 2px solid #f3f4f5;
        gap: 32px;

        .label {
          padding: 16px 0;
          margin-bottom: -2px;
          color: #646464;

          :hover {
            color: #0d2a38;
            border-color: #0d2a38;
          }
          &.active {
            color: #0d2a38;
            border-color: #0d2a38;
          }
        }
      }
    }

    .properties-list {
      display: grid;
      gap: 24px;

      //overflow-y: auto;
      //max-height: calc(100vh - 122px);
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
