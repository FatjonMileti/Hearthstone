import { styled } from '@mui/system';
import React from 'react';
import classNames from 'classnames';
import { HTMLMotionProps, motion } from 'framer-motion';

import { Typography } from '../../../components/Typography';
import { Label } from '../../../components/Label';
import { Icon } from '../../../components/Icon';

import { AddPropertyModal } from '../../Properties/NewProperty/AddPropertyModal';

export interface SelectAvatarProps extends HTMLMotionProps<'div'> {
  afterAddProperty: () => void | any;
  onBack: () => void;
}

export const AddProperty = styled(({ className, afterAddProperty, onBack, ...rest }: SelectAvatarProps) => {
  const [showModal, setShowModal] = React.useState(false);
  return (
    <>
      <motion.div className={classNames('add-property', className)} {...rest}>
        <div className='section-content'>
          <div className='select-avatar-header'>
            <Typography variant='body2' className='title'>
              Your properties
            </Typography>
            <Typography variant='body4' className='description'>
              You currently have no properties linked to your account. <br />
              Add a property to find potential tenants.
            </Typography>
          </div>
          <Label size='large' onClick={() => setShowModal(true)}>
            <Icon icon='plus' /> Add property
          </Label>
        </div>

        <div className='section-footer'>
          <Label size='large' variant='secondary' className='previous-button' onClick={onBack}>
            <Icon icon='arrow-left' /> Back
          </Label>
        </div>
      </motion.div>

      <AddPropertyModal
        showStore={[showModal, setShowModal]}
        onBack={() => setShowModal(false)}
        afterSave={async () => {
          await afterAddProperty();
          setShowModal(false);
        }}
      />
    </>
  );
})`
  &.add-property {
    box-sizing: border-box;
    display: grid;
    overflow-x: hidden;
    justify-items: center;
    grid-template-rows: auto min-content;
    height: 100%;

    .section-content {
      display: grid;
      justify-items: center;
      width: 100%;
      padding: 14px 36px;
      align-content: center;
      row-gap: 48px;

      .select-avatar-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        align-self: stretch;

        .title,
        .description {
          text-align: center;
        }

        .description {
          text-align: center;
          margin-top: 16px;
          align-self: stretch;
        }
      }
    }

    .section-footer {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      justify-content: space-between;
      padding: 24px 36px;
      box-sizing: border-box;

      .action-buttons {
        display: flex;
        column-gap: 24px;
        justify-content: center;
        align-items: center;
      }

      .next-button {
        justify-self: flex-end;
      }
    }
  }
`;
