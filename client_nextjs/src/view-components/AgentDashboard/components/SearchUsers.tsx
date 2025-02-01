import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import Grid from '@mui/material/Grid';

interface ISearchProps {
  search: (value: string) => void;
}

export const SearchUsers = (props: ISearchProps) => {
  const [searchTimeout, setSearchTimeout] = useState<any | null>(null);

  const handleSearch = (e: any) => {
    const searchValue = e.target.value;
    setSearchTimeout(
      setTimeout(() => {
        props.search(searchValue);
      }, 300)
    );
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <Box sx={{ pb: '15px' }} style={{ display: 'flex' }}>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <TextField
            variant='standard'
            placeholder='Search'
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchOutlinedIcon sx={{ mr: '0.7rem', color: '#505259' }} />,
              disableUnderline: true
            }}
          />
        </Grid>
        <Grid item xs={4}></Grid>
        <Grid item xs={5} style={{ display: 'flex' }}>
          <Grid item xs={6}></Grid>
          <Grid item xs={6}></Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
