import React, { useState } from 'react';
import { styled } from '@mui/system';
import { Button } from '../../components';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AxiosError } from 'axios';
import axios from '../../utils/axios';
import config from '../../config';
import Grid from '@mui/material/Grid';
import { Box, Paper } from '@mui/material';
import { useProfileStore } from '../../globalState/profile';
import { useUserStore } from '../../globalState/user';
import { Envelopes } from './scenes/Envelopes';
import FormLabel from '@mui/material/FormLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import { DashboardHeader } from '../AgentDashboard/components/DashboardHeader';

const schema = yup.object().shape({
  landlord: yup.string().required('Landlord is required'),
  tenant: yup.string().required('Tenant is required'),
  property_id: yup.string().required('Property is required')
});

interface IAgreement {
  className?: React.HTMLAttributes<HTMLDivElement>;
}

const ItemContent = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  padding: theme.spacing(1),
  height: '100%',
  color: theme.palette.text.secondary
}));

export const Agreement = styled((props: IAgreement) => {
  const { className } = props;
  const [, setLoading] = React.useState(false);

  const [state, setState] = useState<{ tenants: any[]; landlords: any[]; properties: any[] }>({
    tenants: [],
    landlords: [],
    properties: []
  });

  const profileStore = useProfileStore();

  const { auth } = useUserStore();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
    setValue
  } = useForm({
    defaultValues: {
      tenant: '',
      landlord: '',
      property_id: ''
    },
    resolver: yupResolver(schema) as any,
    mode: 'all'
  });

  React.useEffect(() => {
    getUsers();
  }, []);

  React.useEffect(() => {
    if (profileStore) {
      setValue('landlord', `${profileStore.id}`);
    }
  }, [profileStore]);

  const getUsers = async () => {
    const params = {
      pageSize: 100
    };

    const [{ data: landlords }, { data: tenants }, { data: properties }] = await Promise.all([
      axios(auth.access_token).get(`${config.apiUrl}/api/user?role=Landlord`, {
        params
      }),
      axios(auth.access_token).get(`${config.apiUrl}/api/user?role=Tenant`, {
        params
      }),
      axios(auth.access_token).get(`${config.apiUrl}/api/asset?status=published`, {
        params
      })
    ]);

    setState((prevState) => ({
      ...prevState,
      tenants: tenants.docs,
      landlords: landlords.docs,
      properties: properties.docs
    }));
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    const { tenant, property_id, landlord } = data;

    try {
      await axios(auth.access_token).post(`${config.apiUrl}/api/docusign/create-envelope`, {
        tenant,
        landlord,
        property_id
      });
    } catch (err) {
      if (err instanceof AxiosError) {
        const message = err?.response?.data?.message;

        if (!message) throw err;

        if (message === 'tenant dont exist') {
          return setError('tenant', { message: 'tenant is not verified!', type: 'server' });
        }
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={`home-page ${className}`}>
      <DashboardHeader />

      <div className='container'>
        <div className='content'>
          <Box ml='5rem'>
            <ItemContent>
              <Grid container spacing={2}>
                <Grid item xs={5}>
                  <form className='content' onSubmit={handleSubmit(onSubmit)}>
                    <div className='form-fields'>
                      <FormControl fullWidth>
                        <FormLabel id='demo-simple-select-label'>Choose Landlord</FormLabel>
                        <Select
                          labelId='demo-simple-select-label'
                          id='demo-simple-select'
                          {...register('landlord')}
                          error={!!errors.landlord}
                          size='small'>
                          {state.landlords.map((user: any) => {
                            return (
                              <MenuItem value={user._id} key={user._id}>
                                {`${user.first_name} ${user.last_name}`}
                              </MenuItem>
                            );
                          })}
                        </Select>
                        <FormHelperText>{errors.landlord?.message?.toString()}</FormHelperText>
                      </FormControl>

                      <FormControl fullWidth>
                        <FormLabel id='demo-simple-select-label-tenant'>Choose Tenant</FormLabel>
                        <Select
                          labelId='demo-simple-select-label-tenant'
                          id='demo-simple-select-tenant'
                          {...register('tenant')}
                          error={!!errors.tenant}
                          size='small'>
                          {state.tenants.map((user: any) => {
                            return (
                              <MenuItem value={user._id} key={user._id}>
                                {`${user.first_name} ${user.last_name}`}
                              </MenuItem>
                            );
                          })}
                        </Select>
                        <FormHelperText>{errors.tenant?.message?.toString()}</FormHelperText>
                      </FormControl>

                      <FormControl fullWidth>
                        <FormLabel id='demo-simple-select-label-property'>Choose Property</FormLabel>
                        <Select
                          labelId='demo-simple-select-label-property'
                          id='demo-simple-select-property'
                          {...register('property_id')}
                          error={!!errors.property_id}
                          size='small'>
                          {state.properties.map((property: any) => {
                            return (
                              <MenuItem value={property._id} key={property._id}>
                                {`${property.area_of_interest}`}
                              </MenuItem>
                            );
                          })}
                        </Select>
                        <FormHelperText>{errors.property_id?.message?.toString()}</FormHelperText>
                      </FormControl>
                    </div>
                    <Button
                      className='login-button'
                      type='submit'
                      disabled={!isValid}
                      size='large'
                      style={{ marginTop: '2rem' }}>
                      Generate contract
                    </Button>
                  </form>
                </Grid>

                <Grid item xs={7}>
                  <Envelopes />
                </Grid>
              </Grid>
            </ItemContent>
          </Box>
        </div>
      </div>
    </div>
  );
})`
  &.home-page {
    position: relative;
    min-height: 100vh;
    display: grid;
    background-color: #f7f1e7;

    grid-template-rows: min-content auto;

    .header {
      z-index: 1;
    }
  }
`;
