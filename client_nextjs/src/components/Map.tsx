import React, { HTMLAttributes } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { styled } from '@mui/system';
import classNames from 'classnames';

interface MapProps extends HTMLAttributes<HTMLDivElement> {
  address: {
    lat: number;
    lng: number;
  };
}
export const Map = styled(({ address, className }: MapProps) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_KEY || ''
  });

  const mapRef = React.useRef<any>(undefined);

  React.useEffect(() => {
    if (mapRef.current) {
      const bounds = new window.google.maps.LatLngBounds(address);
      mapRef.current?.fitBounds(bounds);
    }
  }, [address.lat, address.lng]);

  const onLoad = React.useCallback(function callback(map: any) {
    mapRef.current = map;
  }, []);

  return (
    <div className={classNames(className, 'google-maps-wrapper')}>
      {isLoaded && (
        <GoogleMap
          options={{ minZoom: 1, maxZoom: 20 }}
          mapContainerClassName='google-maps-component'
          center={address}
          zoom={15}
          onLoad={onLoad}>
          <Marker position={address} title='Description' draggable={false} />
        </GoogleMap>
      )}
    </div>
  );
})`
  &.google-maps-wrapper {
    height: 200px;
    width: 100%;
    display: grid;
    .google-maps-component {
    }
  }
`;
