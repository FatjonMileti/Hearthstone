import { styled } from '@mui/system';
import React, { HTMLProps, ReactElement } from 'react';

export interface UploadProps extends HTMLProps<HTMLInputElement> {
  button?: ReactElement;
  onFiles?: (files: File[]) => void;
}

export const Upload = styled(({ button, onFiles = () => {}, ...otherProps }: UploadProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div>
      <input
        type='file'
        {...otherProps}
        ref={inputRef}
        style={{ display: !!button ? 'none' : 'initial' }}
        onChange={(e) => {
          if (e.target?.files) {
            onFiles(Array.from(e.target.files));
          }
        }}
      />
      {button &&
        React.cloneElement(button, {
          onClick: () => {
            inputRef?.current?.click();
          }
        })}
    </div>
  );
})``;
