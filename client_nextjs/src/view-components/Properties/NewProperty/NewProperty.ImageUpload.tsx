import { styled } from '@mui/system';
import multimedia from './image.svg';
import { Typography } from '../../../components/Typography';
import { Upload } from '../../../components/Upload';
import { Button } from '../../../components/Button';
import { Icon } from '../../../components/Icon';
import React, { DragEventHandler, HTMLAttributes } from 'react';
import classNames from 'classnames';
import { IconButton } from '../../../components/IconButton';
import { Modal } from '../../../components/Modal';
import { TextField } from '../../../components/TextField';
import axiosWithToken from '../../../utils/axios';
import { useUserStore } from '../../../globalState/user';

interface ImageUploadProps extends HTMLAttributes<HTMLDivElement> {
  onNewImages?: (images: File[]) => void;
  onGenerateImages?: (images: any[]) => void;
}
export const ImageUpload = styled(
  ({ className, onNewImages = () => {}, onGenerateImages = () => {} }: ImageUploadProps) => {
    const [over, setOver] = React.useState(false);

    const [generateModal, setGenerateModal] = React.useState(false);
    const [prompt, setPrompt] = React.useState('');

    const { auth } = useUserStore();

    const handleDropOnUploadComponent: DragEventHandler = (e) => {
      e.preventDefault();
      const files: File[] = [];
      if (e.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        [...e.dataTransfer.items].forEach((item) => {
          // If dropped items aren't files, reject them
          if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file) {
              files.push(file);
            }
          }
        });
      } else {
        // Use DataTransfer interface to access the file(s)
        [...e.dataTransfer.files].forEach((file) => {
          files.push(file);
        });
      }
      if (files.find((file) => !file.type.startsWith('image/'))) {
        return;
      }

      onNewImages(files);
    };

    const handlePrompt = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPrompt(e.target.value);
    };

    const submitRequest = async () => {
      const response = await axiosWithToken(auth.access_token).post('/api/asset/generate-images', { prompt });

      console.log({ data: response.data });

      onGenerateImages(
        response.data.images.map((item: any) => ({ key: item.imageSrc, link: item.imageSrc }))
      );

      setGenerateModal(false);
    };

    return (
      <div
        className={classNames(className, 'new-property-upload-component', { over })}
        onDrop={(e) => {
          setOver(false);
          handleDropOnUploadComponent(e);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!over) {
            setOver(true);
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setOver(false);
        }}>
        <div className='drag-drop'>
          <div className='img' style={{ backgroundImage: `url(${multimedia})` }}></div>
          <Typography variant='body4'>Upload photos and videos or drag & drop them in here</Typography>
        </div>

        <Modal
          disableScrollLock
          open={generateModal}
          className='delete-confirm-modal'
          onBackdropClick={() => setGenerateModal(false)}>
          <div className='modal-header'>
            <IconButton size='large' noBackground onClick={() => setGenerateModal(false)}>
              <Icon icon='close' size={12} />
            </IconButton>
          </div>
          <Typography variant='body2' className='title'>
            Provide your prompt
          </Typography>
          <TextField name='prompt' onChange={handlePrompt} />
          <div className='actions'>
            <Button size='large' onClick={submitRequest}>
              Submit
            </Button>
          </div>
        </Modal>

        <Upload
          multiple
          accept='image/*'
          onFiles={(files) => onNewImages(files)}
          button={
            <Button variant='secondary' size='large' startIcon={<Icon icon='plus' size={24} />}>
              Upload media
            </Button>
          }></Upload>

        {/*<div style={{ display: 'flex', justifyContent: 'space-between', columnGap: '15px' }}>*/}
        {/*  <Button*/}
        {/*    variant='secondary'*/}
        {/*    size='large'*/}
        {/*    startIcon={<Icon icon='plus' size={14} />}*/}
        {/*    onClick={() => setGenerateModal(true)}>*/}
        {/*    Generate media*/}
        {/*  </Button>*/}
        {/*</div>*/}
      </div>
    );
  }
)`
  &.new-property-upload-component {
    width: 100%;
    display: grid;
    padding: 64px 0;
    border-radius: 8px;
    border: 1px dashed #cfd5d5;
    align-items: center;
    justify-items: center;
    gap: 24px;
    box-sizing: border-box;

    &.over {
      border: 4px dashed #cfd5d5;
      //box-shadow: 0 8px 32px 0 rgba(229, 21, 90, 0.25);
      box-shadow: 0 7.7px 23.2px 0 rgba(0, 0, 0, 0.25);
      padding: 61px 0;
    }

    .drag-drop {
      display: grid;
      align-items: center;
      gap: 24px;

      .img {
        width: 64px;
        height: 64px;
        background-repeat: no-repeat;
        background-size: cover;
        margin: 0 auto;
      }

      .typography {
        font-size: 18px;
        font-weight: 700;
      }
    }

    .delete-confirm-modal {
      .modal-container {
        padding: 0;
      }
      padding: 24px;
      min-width: 640px;
      .modal-header {
        display: flex;
        justify-content: flex-end;
      }
      .title {
        margin-top: 24px;
        text-align: center;
      }

      .description {
        margin-top: 16px;
        text-align: center;
      }
      .actions {
        margin-top: 48px;
        display: flex;
        column-gap: 16px;
        .button {
          flex-grow: 1;
        }
      }
    }
  }
`;
