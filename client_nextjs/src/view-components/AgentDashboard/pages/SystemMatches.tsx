import { GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { LogsTable } from '../components/LogsTable';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useApi } from '../hooks/useApi';

export const SystemMatches = () => {
  const { list, setList } = useApi({ url: `match` });
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Match ID', width: 100, sortable: false, flex: 1 },
    {
      field: 'landlord',
      headerName: 'Landlord',
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        if (params.row.landlord) {
          return `${params.row?.landlord?.first_name} ${params.row?.landlord?.last_name}`;
        }
        return '';
      },
      sortable: false
    },
    {
      field: 'tenant',
      headerName: 'Tenant',
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        if (params.row.tenant) {
          return `${params.row?.tenant?.first_name} ${params.row?.tenant?.last_name}`;
        }
        return '';
      },
      sortable: false
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: () => {
        return (
          <IconButton aria-label='view'>
            <VisibilityIcon />
          </IconButton>
        );
      }
    }
  ];

  return (
    <div>
      <LogsTable list={list} setList={setList} columns={columns} />
    </div>
  );
};
