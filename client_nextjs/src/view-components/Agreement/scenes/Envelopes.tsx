import React from 'react';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { useUserStore } from '../../../globalState/user';
import axios from '../../../utils/axios';
import config from '../../../config';
import { Link } from 'react-router-dom';

const state: IGridState = {
  loading: true,
  rows: [],
  totalRows: 0,
  rowsPerPageOptions: [10, 20, 50],
  pageSize: 9,
  page: 1,
  rowCount: 0,
  sort: 'created_at',
  asc: false,
  selectedIds: [],
  search: ''
};

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'status', headerName: 'Status', width: 130 },
  { field: 'document_type', headerName: 'Document type', flex: 1 },
  {
    field: 'landlord',
    headerName: 'Landlord',
    width: 130,
    valueGetter: (params: GridValueGetterParams) => {
      if (params.row.land_lord) {
        return `${params.row.land_lord.first_name || ''} ${params.row.land_lord.last_name || ''}`;
      }
      return '';
    }
  },
  {
    field: 'tenant',
    headerName: 'Tenant',
    width: 160,
    valueGetter: (params: GridValueGetterParams) => {
      if (params.row?.tenant) {
        return `${params.row.tenant.first_name || ''} ${params.row.tenant.last_name || ''}`;
      }
      return '';
    }
  },
  {
    field: 'details',
    headerName: 'Details',
    width: 130,
    renderCell: (params: any) => {
      return <Link to={`/dashboard/contracts/${params.row.id}`}>Details</Link>;
    }
  }
];

export const Envelopes = () => {
  const { auth } = useUserStore();
  const [list, setList] = React.useState<IGridState>({
    ...state
  });

  React.useEffect(() => {
    getEnvelopes();
  }, []);

  const getEnvelopes = async () => {
    const { data } = await axios(auth.access_token).get(`${config.apiUrl}/api/docusign/envelope`);
    setList((prevList: any) => ({
      ...prevList,
      rows: data.docs,
      totalRows: data.totalDocs,
      loading: false
    }));
  };

  return (
    <div style={{ height: 350, width: '100%' }}>
      <DataGrid rows={list.rows} columns={columns} />
    </div>
  );
};
