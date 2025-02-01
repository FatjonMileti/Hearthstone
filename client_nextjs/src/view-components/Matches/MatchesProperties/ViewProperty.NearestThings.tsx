import { styled } from '@mui/system';
import classNames from 'classnames';
import React, { HTMLAttributes } from 'react';
import { Button } from '../../../components/Button';
import axios from 'axios';
import config from '../../../config';
import { Typography } from '../../../components/Typography';
import { Icon } from '../../../components/Icon';
interface NearestThingsProps extends HTMLAttributes<HTMLElement> {
  location: {
    lat: number;
    lng: number;
  };
}

type NearPlace = {
  place: {
    name: string;
  };
  distance?: {
    value: number;
    text: string;
  };
};
export const NearestThings = styled(({ className, location }: NearestThingsProps) => {
  const [selectedButton, setSelectedButton] = React.useState('stations');
  const [stations, setStations] = React.useState<NearPlace[]>([]);
  const [schools, setSchools] = React.useState<NearPlace[]>([]);
  const [importantPlaces, setImportantPlaces] = React.useState<NearPlace[]>([]);

  React.useEffect(() => {
    if (location.lat && location.lng) {
      getNearestStations();
      getNearestSchools();
      getImportantPlaces();
    }
  }, [location.lat, location.lng]);

  const getNearestStations = async () => {
    try {
      const { data } = await axios.get(`${config.apiUrl}/api/map/station`, {
        params: {
          latitude: location.lat,
          longitude: location.lng
        }
      });

      setStations(data);
    } catch (error: any) {
      console.log(error);
    }
  };

  const getNearestSchools = async () => {
    try {
      const { data } = await axios.get(`${config.apiUrl}/api/map/school`, {
        params: {
          latitude: location.lat,
          longitude: location.lng
        }
      });
      setSchools(data);
    } catch (error: any) {
      console.log(error);
    }
  };

  const getImportantPlaces = async () => {
    try {
      const { data } = await axios.get(`${config.apiUrl}/api/map/places`, {
        params: {
          latitude: location.lat,
          longitude: location.lng
        }
      });

      setImportantPlaces(data);
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <div className={classNames('nearest-things', className)}>
      <div className='buttons-wrapper'>
        <Button
          variant='primary'
          inverted
          size='large'
          onClick={() => setSelectedButton('stations')}
          active={selectedButton === 'stations'}>
          Nearest stations
        </Button>
        <Button
          variant='primary'
          inverted
          size='large'
          onClick={() => setSelectedButton('Schools')}
          active={selectedButton === 'Schools'}>
          Nearest schools
        </Button>
        <Button
          variant='primary'
          inverted
          size='large'
          onClick={() => setSelectedButton('ImportantPlaces')}
          active={selectedButton === 'ImportantPlaces'}>
          Important places
        </Button>
      </div>
      <div className='nearest-locations'>
        {selectedButton === 'stations' ? (
          <>
            {stations.slice(0, 3).map((station, stationsIndex) => (
              <div key={stationsIndex} className='location'>
                <Icon icon='bus' />
                <Typography variant='body4' className='place'>
                  {station.place.name}
                  <span className='separator'> - </span>
                  <span className='distance'>{station?.distance?.text}</span>
                </Typography>
              </div>
            ))}
          </>
        ) : selectedButton === 'Schools' ? (
          <>
            {schools.slice(0, 3).map((station, schoolIndex) => (
              <div key={schoolIndex} className='location'>
                <Typography variant='body4' className='place'>
                  {station.place.name}
                  <span className='separator'> - </span>
                  <span className='distance'>{station?.distance?.text}</span>
                </Typography>
              </div>
            ))}
          </>
        ) : selectedButton === 'ImportantPlaces' ? (
          <>
            {importantPlaces.slice(0, 3).map((station, stationIndex) => (
              <div key={stationIndex} className='location'>
                <Typography variant='body4' className='place'>
                  {station.place.name}
                  <span className='separator'> - </span>
                  <span className='distance'>{station?.distance?.text}</span>
                </Typography>
              </div>
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
})`
  &.nearest-things {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 16px;

    .buttons-wrapper {
      display: flex;
      padding: 4px;
      align-items: flex-start;
      border-radius: 2500px;
      border: 1px solid #e7e7e7;

      .active {
        background: #eee0d3;
        font-weight: 600;
      }

      button {
        font-weight: 400;
        font-size: 16px;
        padding: 12px 16px;
        line-height: 24px;
        height: auto;
      }

      button:hover {
        background: #eee0d3;
      }
    }

    .nearest-locations {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .location {
        display: flex;
        column-gap: 4px;

        .place {
          color: #0d2a38;
          font-weight: 700;
        }

        .separator {
          color: #e7e7e7;
        }

        .distance {
          color: #184d6d;
        }
      }
    }
  }
`;
