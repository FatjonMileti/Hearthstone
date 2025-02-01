import React, { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Search } from '../components/Search';
import moment from 'moment';
import { LogsTable } from '../components/LogsTable';
import { LogAction } from '../agent.interface';
import { useLogs } from '../hooks/useLogs';
import { Modal } from '../../../components';
import { Typography } from '../../../components';
import axios from '../../../utils/axios';
import config from '../../../config';
import { useUserStore } from '../../../globalState/user';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';

export const MatchesLogs = () => {
  const { list, setList, clearFilters } = useLogs({ url: 'match' });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [log, setLog] = useState<any>(null);
  const { auth } = useUserStore();

  React.useEffect(() => {
    if (selectedId) {
      getOneLog();
    }
  }, [selectedId]);

  const getOneLog = async () => {
    const { data } = await axios(auth!.access_token).get(`${config.apiUrl}/api/admin/match-log/${selectedId}`);
    setLog(data);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100, sortable: false },
    {
      field: 'user.first_name',
      headerName: 'Firstname',
      flex: 1,
      valueGetter: (params: any) => {
        if (params.row.user && params.row.user !== 'null') {
          return `${params.row.user?.first_name || ''}`;
        }
        return '';
      },
      sortable: false
    },
    {
      field: 'user.last_name',
      headerName: 'Lastname',
      flex: 1,
      valueGetter: (params: any) => {
        if (params.row.user && params.row.user !== 'null') {
          return `${params.row.user?.last_name || ''}`;
        }
        return '';
      },
      sortable: false
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      sortable: false
    },
    {
      field: 'active',
      headerName: 'Active',
      flex: 1,
      valueGetter: (params: any) => (params.row.active ? 'Yes' : 'No'),
      sortable: false
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      valueGetter: (params: any) => moment(params.row.date).format('DD-MM-YYYY'),
      sortable: false
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params: any) => {
        return (
          <IconButton
            aria-label='view'
            onClick={() => {
              setSelectedId(params.row._id);
              setOpenModal(true);
            }}>
            <VisibilityIcon />
          </IconButton>
        );
      }
    }
  ];

  return (
    <div>
      <Search
        search={(value) => {
          setList((prev: any) => ({ ...prev, search: value }));
        }}
        filter={(newFilters) => {
          setList((prev: any) => ({
            ...prev,
            filters: {
              ...prev.filters,
              ...newFilters
            }
          }));
        }}
        actionValues={Object.values(LogAction)}
        clearFilters={clearFilters}
      />
      <LogsTable list={list} setList={setList} columns={columns} />
      {log && (
        <Modal open={openModal} onBackdropClick={() => setOpenModal(!openModal)}>
          <Typography variant='body2'>Details</Typography>
          <hr />
          User: {JSON.stringify(log.user)} <br />
          Property: {JSON.stringify(log.ref)} <br />
          Action: {log.action} <br />
          Info: {JSON.stringify(log.info)}
        </Modal>
      )}
    </div>
  );
};
