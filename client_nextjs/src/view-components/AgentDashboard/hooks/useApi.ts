import { useUserStore } from '../../../globalState/user';
import React from 'react';
import axios from '../../../utils/axios';
import config from '../../../config';

const state: any = {
  loading: true,
  rows: [],
  totalRows: 0,
  rowsPerPageOptions: [30, 50, 100],
  pageSize: 30,
  page: 0,
  rowCount: 0,
  sort: 'date',
  asc: false,
  selectedIds: [],
  search: '',
  filters: {
    type: 'all'
  }
};

interface ILogs {
  url: string;
}

export const useApi = (props: ILogs) => {
  const { auth } = useUserStore();

  const [list, setList] = React.useState<any>({
    ...state
  });

  const { url } = props;

  React.useEffect(() => {
    getData();
  }, [list.sort, list.search, list.asc, list.page, list.pageSize, list.filters, props.url]);

  const getData = async () => {
    const { page, pageSize, asc, search, sort } = list;
    const params: any = {
      page: page + 1,
      pageSize: pageSize,
      sort: sort || undefined,
      asc: asc.toString() || undefined,
      search: search || undefined
    };

    if (list.filters?.type) {
      params.type = list.filters.type;
    }

    if (list.filters?.action) {
      params.action = list.filters.action;
    }

    const { data } = await axios(auth!.access_token).get(`${config.apiUrl}/api/${url}`, {
      params
    });
    setList((prevList: any) => ({
      ...prevList,
      rows: data.docs,
      totalRows: data.totalDocs,
      rowCount: data.totalDocs,
      loading: false
    }));
  };

  const clearFilters = () => {
    setList(state);
  };

  return { list, setList, clearFilters };
};
