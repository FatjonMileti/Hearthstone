import { styled } from '@mui/system';
import classNames from 'classnames';
import React, { HTMLAttributes } from 'react';
import { Typography } from '../../components';
import { motion, MotionProps } from 'framer-motion';
import axios from '../../utils/axios';
import { useUserStore } from '../../globalState/user';

interface MessagesPropertiesProps extends HTMLAttributes<HTMLDivElement> {
  onPropertySelect?: (propertyId: string) => void;
}

export const MessagesProperties = styled(
  ({ className, onPropertySelect = () => {} }: MessagesPropertiesProps) => {
    const [properties, setProperties] = React.useState<any[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = React.useState('');
    const userStore = useUserStore();
    const selectedProperty = properties.find((property) => property._id === selectedPropertyId);

    React.useEffect(() => {
      getProperties();
    }, []);

    const getProperties = async () => {
      try {
        const response = await axios(userStore.auth.access_token).get('/api/chat/started-conversations');
        setProperties(response.data);
      } catch (err) {
        throw err;
      }
    };

    return (
      <div className={classNames('messages-properties', className)}>
        <motion.div className='properties-list'>
          {properties.map((property, propertyIndex) => (
            <Property
              key={propertyIndex}
              image={property.property_images[0]?.link}
              onClick={() => {
                if (selectedPropertyId === property._id) {
                  setSelectedPropertyId('');
                  onPropertySelect('');
                } else {
                  setSelectedPropertyId(property._id);
                  onPropertySelect(property._id);
                }
              }}
              className={classNames({ active: selectedPropertyId === property._id })}
              active={selectedPropertyId === property._id}
            />
          ))}
        </motion.div>

        <div className='blury-end' />

        {selectedProperty && (
          <Typography variant='body5' className='conversations-for'>
            Conversations for <span className='bold-part'>{selectedProperty?.area_of_interest}</span>
          </Typography>
        )}
      </div>
    );
  }
)`
  &.messages-properties {
    display: grid;
    row-gap: 24px;
    position: relative;

    .properties-list {
      display: flex;
      column-gap: 8px;
      align-items: center;
      height: 56px;
      padding-right: 56px;
      box-sizing: border-box;
      width: 100%;
      overflow-x: auto;

      ::-webkit-scrollbar {
        display: none;
      }
      scrollbar-width: none;
    }

    .blury-end {
      background: linear-gradient(270deg, #fffbf4 0%, rgba(255, 251, 244, 0) 100%);
      height: 56px;
      width: 56px;
      position: absolute;
      right: 0;
    }

    .conversations-for {
      .bold-part {
        font-weight: 700;
      }
    }
  }
`;

const Property = styled(
  ({
    className,
    image,
    active,
    onClick = () => {},
    ...otherProps
  }: HTMLAttributes<HTMLDivElement> & MotionProps & { image: string; active?: boolean }) => {
    const propertyRef = React.useRef<HTMLDivElement>(null);
    const variants = {
      inactive: {
        height: '48px',
        width: '48px'
      },
      active: {
        height: '56px',
        width: '56px',
        border: '2.5px solid #e5155a'
      },
      hover: {
        height: '56px',
        width: '56px'
      }
    };

    return (
      <motion.div
        ref={propertyRef}
        initial='inactive'
        variants={variants}
        animate={active ? 'active' : 'inactive'}
        whileHover='hover'
        className={classNames(className, 'property')}
        onClick={(e) => {
          propertyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          onClick(e);
        }}
        {...otherProps}></motion.div>
    );
  }
)`
  &.property {
    height: 48px;
    width: 48px;
    border-radius: 50%;
    cursor: pointer;
    background-image: url(${(props) => props.image});
    background-size: cover;
    box-sizing: border-box;
    background-position: center;
    flex-shrink: 0;
  }
`;
