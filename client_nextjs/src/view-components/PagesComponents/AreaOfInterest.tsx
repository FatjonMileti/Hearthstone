import { TextField, TextFieldProps } from '../../components/TextField';
import React from 'react';
import axios from 'axios';
import config from '../../config';

export interface AreaOfInterestProps extends TextFieldProps {
  areaOfInterest?: string;
  onAreaChange: (newValue: {
    formattedAddress: string;
    location: { latitude?: number; longitude?: number };
  }) => void;
}

export const AreaOfInterest = ({ areaOfInterest, onAreaChange, ...rest }: AreaOfInterestProps) => {
  const [searchValue, setSearchValue] = React.useState('');

  const debounceRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    if (areaOfInterest && areaOfInterest !== searchValue) {
      setSearchValue(areaOfInterest);
    }
  }, [areaOfInterest]);

  const debounce = (callback: TimerHandler, delay?: number) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(callback, delay);
  };

  const onSearchChange = async (newAreaOfInterest: string) => {
    try {
      setSearchValue(newAreaOfInterest);
      onAreaChange({
        formattedAddress: '',
        location: {}
      });

      debounce(async () => {
        try {
          const { data } = await axios.get(`${config.apiUrl}/api/map/address/${newAreaOfInterest}`);
          if (data?.formatted_address) {
            onAreaChange({
              formattedAddress: data?.formatted_address,
              location: {
                latitude: data?.geometry?.location?.lat,
                longitude: data?.geometry?.location?.lng
              }
            });
            setSearchValue(data?.formatted_address);
          } else {
            onAreaChange({
              formattedAddress: '',
              location: {}
            });
          }
        } catch (err) {
          throw err;
        }
      }, 1000);
    } catch (err) {
      throw err;
    }
  };

  return (
    <TextField value={searchValue} onChange={({ target: { value } }) => onSearchChange(value)} {...rest} />
  );
};
