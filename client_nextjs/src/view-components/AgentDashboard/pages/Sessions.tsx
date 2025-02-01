import React, { useState } from 'react';
import { GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { Modal } from '../../../components';
import { Search } from '../components/Search';
import moment from 'moment';
import { LogsTable } from '../components/LogsTable';
import { LoginLogAction } from '../agent.interface';
import { useLogs } from '../hooks/useLogs';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Typography } from '../../../components';
import axios from '../../../utils/axios';
import config from '../../../config';
import { useUserStore } from '../../../globalState/user';

export const Sessions = () => {
  const { list, setList, clearFilters } = useLogs({ url: 'session' });
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [log, setLog] = useState<any>(null);
  const { auth } = useUserStore();
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100, sortable: false },
    {
      field: 'user.first_name',
      headerName: 'Firstname',
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
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
      valueGetter: (params: GridValueGetterParams) => {
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

  React.useEffect(() => {
    if (selectedId) {
      getOneLog();
    }
  }, [selectedId]);

  const getOneLog = async () => {
    const { data } = await axios(auth.access_token).get(
      `${config.apiUrl}/api/admin/session-log/${selectedId}`
    );
    setLog(data);
  };

  return (
    <div>
      <Search
        search={(value) => {
          setList((prev) => ({ ...prev, search: value }));
        }}
        filter={(newFilters) => {
          setList((prev) => ({
            ...prev,
            filters: {
              ...prev.filters,
              ...newFilters
            }
          }));
        }}
        actionValues={Object.values(LoginLogAction)}
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
