import { styled } from '@mui/system';
import { Button, ButtonProps } from '../../../components/Button';
import { Icon } from '../../../components/Icon';
import classNames from 'classnames';
import axios from 'axios';
import config from '../../../config';

interface UseMyLocationProps extends ButtonProps {
  onLocation?: (location: {
    formattedAddress: string;
    location: { latitude?: number; longitude?: number };
  }) => void;
}

export const UseMyLocation = styled(({ className, onLocation = () => {} }: UseMyLocationProps) => {
  const getLocation = async () => {
    const options = {
      enableHighAccuracy: true,
      timeout: 10000
    };

    try {
      const position: GeolocationPosition = await new Promise((resolve, reject) => {
        const successCallback = (position: GeolocationPosition) => {
          resolve(position);
        };

        const errorCallback = (error: GeolocationPositionError) => {
          reject(error);
        };

        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
      });

      const place = await axios.get(`${config.apiUrl}/api/map`, {
        params: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      });

      // console.log('place: ', place);

      onLocation({
        formattedAddress: place.data.text,
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Button
      onClick={getLocation}
      className={classNames('use-my-location-button', className)}
      variant='secondary'
      startIcon={<Icon icon='direction-tool' color='black' />}>
      Use my location
    </Button>
  );
})`
  &.use-my-location-button {
    padding: 16px 20px;
    height: 56px;

    border: 2px solid #0d2a38;
    color: #0d2a38;
  }
`;
