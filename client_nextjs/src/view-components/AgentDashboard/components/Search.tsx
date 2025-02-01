import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Button } from '../../../components/Button';

interface ISearchProps {
  search: (value: string) => void;
  filter: (value: any) => void;
  actionValues: string[];
  clearFilters: () => void;
}

export const Search = (props: ISearchProps) => {
  const [searchTimeout, setSearchTimeout] = useState<any | null>(null);
  const [radioValue, setRadioValue] = React.useState('all');
  const [action, setAction] = React.useState('');

  const handleSelectChange = (event: SelectChangeEvent) => {
    setAction(event.target.value as string);
    props.filter({ action: event.target.value as string });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRadioValue((event.target as HTMLInputElement).value);
  };
  const handleSearch = (e: any) => {
    const searchValue = e.target.value;
    setSearchTimeout(
      setTimeout(() => {
        props.search(searchValue);
      }, 300)
    );
  };

  useEffect(() => {
    props.filter({ type: radioValue });
  }, [radioValue]);

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const clearAllFilters = () => {
    props.clearFilters();
    setSearchTimeout(null);
    setRadioValue('all');
    setAction('');
  };

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
        <Grid item xs={4}>
          <FormControl>
            <FormLabel id='demo-row-radio-buttons-group-label'>Filter</FormLabel>
            <RadioGroup
              row
              aria-labelledby='demo-row-radio-buttons-group-label'
              name='row-radio-buttons-group'
              onChange={handleChange}
              value={radioValue}>
              <FormControlLabel value='all' control={<Radio />} label='All' />
              <FormControlLabel value='lastmonth' control={<Radio />} label='Last month' />
              <FormControlLabel value='lastweek' control={<Radio />} label='Last week' />
              <FormControlLabel value='today' control={<Radio />} label='Today' />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={5} style={{ display: 'flex' }}>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <FormLabel id='demo-simple-select-label'>Action</FormLabel>
              <Select
                labelId='demo-simple-select-label'
                id='demo-simple-select'
                value={action}
                label='Age'
                size='small'
                onChange={handleSelectChange}>
                {props.actionValues.map((action: string) => {
                  return (
                    <MenuItem value={action} key={action}>
                      {capitalizeFirstLetter(action)}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl style={{ marginLeft: '10px' }}>
              <FormLabel id='demo-row-radio-buttons-group-label'>Clear</FormLabel>
              <Button size='small' onClick={() => clearAllFilters()} style={{ height: '40px' }}>
                Clear
              </Button>
            </FormControl>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
