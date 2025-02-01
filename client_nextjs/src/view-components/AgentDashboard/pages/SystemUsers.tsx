import React, { useState } from 'react';
import { GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { Modal } from '../../../components';
import { LogsTable } from '../components/LogsTable';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Typography } from '../../../components';
import axios from '../../../utils/axios';
import config from '../../../config';
import { useUserStore } from '../../../globalState/user';
import { useApi } from '../hooks/useApi';
import { SearchUsers } from '../components/SearchUsers';

interface ISystemUsers {
  user_type: string;
}
export const SystemUsers = (props: ISystemUsers) => {
  const { list, setList } = useApi({ url: `user?role=${props.user_type}` });
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const { auth } = useUserStore();
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100, sortable: false },
    {
      field: 'first_name',
      headerName: 'Firstname',
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        if (params.row) {
          return `${params.row?.first_name || ''}`;
        }
        return '';
      },
      sortable: false
    },
    {
      field: 'last_name',
      headerName: 'Lastname',
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        if (params.row) {
          return `${params.row?.last_name || ''}`;
        }
        return '';
      },
      sortable: false
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
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
      getOneUser();
    }
  }, [selectedId]);

  const getOneUser = async () => {
    const { data } = await axios(auth.access_token).get(`${config.apiUrl}/api/user/${selectedId}`);
    setUser(data);
  };

  return (
    <div>
      <SearchUsers
        search={(value) => {
          setList((prev) => ({ ...prev, search: value }));
        }}
      />
      <LogsTable list={list} setList={setList} columns={columns} />
      {user && (
        <Modal open={openModal} onBackdropClick={() => setOpenModal(!openModal)}>
          <Typography variant='body2'>Details</Typography>
        </Modal>
      )}
    </div>
  );
};
