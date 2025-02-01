import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PeopleIcon from '@mui/icons-material/People';
import { styled } from '@mui/system';
import { Typography } from '../../../components/Typography';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  padding: theme.spacing(1),
  height: 'fit-content',
  color: theme.palette.text.secondary
}));

interface IDashboardNavbar {
  activeTab: number;
  setActiveTab: React.Dispatch<React.SetStateAction<number>>;
}

export const DashboardNavbar = ({ activeTab, setActiveTab }: IDashboardNavbar) => {
  return (
    <Item>
      <Typography variant='body4'>Logs</Typography>
      <hr />
      <List>
        <ListItem
          style={{ backgroundColor: activeTab === 0 ? '#B2ADAC' : '', cursor: 'pointer' }}
          onClick={() => {
            setActiveTab(0);
          }}>
          <ListItemIcon>
            <AnalyticsIcon />
          </ListItemIcon>
          <ListItemText primary='Active sessions' />
        </ListItem>
        <ListItem
          style={{ backgroundColor: activeTab === 1 ? '#B2ADAC' : '', cursor: 'pointer' }}
          onClick={() => {
            setActiveTab(1);
          }}>
          <ListItemIcon>
            <HomeWorkIcon />
          </ListItemIcon>
          <ListItemText primary='Property logs' />
        </ListItem>
        <ListItem
          style={{ backgroundColor: activeTab === 2 ? '#B2ADAC' : '', cursor: 'pointer' }}
          onClick={() => {
            setActiveTab(2);
          }}>
          <ListItemIcon>
            <SyncAltIcon />
          </ListItemIcon>
          <ListItemText primary='Matches logs' />
        </ListItem>
      </List>
      <hr />
      <Typography variant='body4'>Users</Typography>
      <hr />
      <List>
        <ListItem
          style={{ backgroundColor: activeTab === 3 ? '#B2ADAC' : '', cursor: 'pointer' }}
          onClick={() => {
            setActiveTab(3);
          }}>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary='Landlords' />
        </ListItem>
        <ListItem
          style={{ backgroundColor: activeTab === 4 ? '#B2ADAC' : '', cursor: 'pointer' }}
          onClick={() => {
            setActiveTab(4);
          }}>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary='Tenants' />
        </ListItem>
      </List>
    </Item>
  );
};
