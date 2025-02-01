import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface ITableLog {
  list: any;
  setList: React.Dispatch<React.SetStateAction<any>>;
  columns: GridColDef[];
}

export const LogsTable = (props: ITableLog) => {
  const { list, setList, columns } = props;
  const onSortModelChange = (d: any) => {
    const selectedSort = d[0] || undefined;
    if (selectedSort) {
      setList((prevList: any) => ({
        ...prevList,
        sort: selectedSort.field,
        asc: selectedSort.sort === 'asc'
      }));
    }
  };
  const onPageChange = (d: number) => {
    setList((prevList: any) => ({
      ...prevList,
      page: d
    }));
  };

  const onPageSizeChange = (d: number) => {
    setList((prevList: any) => ({
      ...prevList,
      pageSize: d
    }));
  };

  return (
    <DataGrid
      autoHeight={true}
      sortingMode='server'
      sortingOrder={['asc', 'desc']}
      paginationModel={{ page: list.page || 0, pageSize: list.pageSize || 10 }}
      paginationMode='server'
      onSortModelChange={(d: any) => onSortModelChange(d)}
      onPaginationModelChange={(d: any) => { onPageChange(d.page); onPageSizeChange(d.pageSize); }}
      rowHeight={30}
      rows={list.rows}
      columns={columns}
      density='comfortable'
      disableColumnSelector
    />
  );
};
