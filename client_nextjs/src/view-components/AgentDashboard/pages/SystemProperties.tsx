import { useState } from 'react';
import { GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { Modal } from '../../../components/Modal';
import { LogsTable } from '../components/LogsTable';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useApi } from '../hooks/useApi';

export const SystemProperties = () => {
  const { list, setList } = useApi({ url: `asset` });
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [property, setProperty] = useState<any>(null);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Property ID', width: 100, sortable: false, flex: 1 },
    {
      field: 'area_of_interest',
      headerName: 'Location',
      flex: 1,
      sortable: false
    },
    {
      field: 'property_type',
      headerName: 'Property type',
      flex: 1,
      sortable: false
    },
    {
      field: 'status_string',
      headerName: 'Status',
      flex: 1,
      sortable: false
    },
    {
      field: 'created_by',
      headerName: 'Owner',
      flex: 1,
      sortable: false,
      valueGetter: (params: GridValueGetterParams) => {
        if (params.row.created_by) {
          return `${params.row?.created_by?.first_name} ${params.row?.created_by?.last_name}`;
        }
        return '';
      }
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
              setProperty(params.row);
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
      <LogsTable list={list} setList={setList} columns={columns} />
      {property && (
        <Modal open={openModal} onBackdropClick={() => setOpenModal(!openModal)}>
          {/*<Typography variant='body2'>Work</Typography>*/}
        </Modal>
      )}
    </div>
  );
};
