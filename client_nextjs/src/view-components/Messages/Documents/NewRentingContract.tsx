import React from 'react';
import { ShowGlobalLoading } from '../../../components/ShowGlobalLoading';
import { Button } from '../../../components/Button';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AxiosError } from 'axios';
import axios from '../../../utils/axios';
import config from '../../../config';

import { useProfileStore } from '../../../globalState/profile';
import { useUserStore } from '../../../globalState/user';

const schema = yup.object().shape({
  landlord: yup.string().required('Landlord is required'),
  tenant: yup.string().required('Tenant is required'),
  property_id: yup.string().required('Property is required')
});

interface INewRentingContract {
  tenant: string;
  property: any;
  canCreate: boolean;
  onFinish: () => void;
}

export const NewRentingContract = (props: INewRentingContract) => {
  const [loading, setLoading] = React.useState(false);
  const profileStore = useProfileStore();

  const { auth } = useUserStore();

  const { handleSubmit, setError, setValue } = useForm({
    defaultValues: {
      tenant: '',
      landlord: '',
      property_id: ''
    },
    resolver: yupResolver(schema) as any,
    mode: 'all'
  });

  React.useEffect(() => {
    if (profileStore) {
      setValue('landlord', `${profileStore.id}`);
    }
    setValue('tenant', props.tenant);
    setValue('property_id', props.property._id);
  }, [props]);

  // console.log({ props });
  const onSubmit = async (data: any) => {
    setLoading(true);
    const { tenant, property_id, landlord } = data;

    try {
      await axios(auth.access_token).post(`${config.apiUrl}/api/docusign/create-envelope`, {
        tenant,
        landlord,
        property_id
      });
    } catch (err: AxiosError | any) {
      const message = err?.response?.data?.message;

      if (!message) throw err;

      if (message === 'tenant dont exist') {
        return setError('tenant', { message: 'tenant is not verified!', type: 'server' });
      }

      throw err;
    } finally {
      setLoading(false);
      props.onFinish();
    }
  };
  return loading ? (
    <ShowGlobalLoading />
  ) : (
    <Button
      className='login-button'
      type='submit'
      disabled={!props.canCreate}
      onClick={handleSubmit(onSubmit)}
      size='small'>
      Create renting contract
    </Button>
  );
};
