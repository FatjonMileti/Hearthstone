import { styled } from '@mui/system';
import { DialogHTMLAttributes } from 'react';
import { ScrollLock } from './ScrollLock';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';

export interface ModalProps extends DialogHTMLAttributes<HTMLDialogElement> {
  open?: boolean;
  onBackdropClick?: () => void;
  disableScrollLock?: boolean;
  closeModal?: () => void;
  preMount?: boolean;
}

const backdropVariants = {
  open: {
    backdropFilter: 'blur(2px)',
    transition: {
      duration: 0.1
    }
  },
  closed: {
    backdropFilter: 'blur(0px)',
    transition: {
      duration: 0.1,
      delay: 0.1
    }
  }
};

const modalVariants = {
  open: {
    opacity: 1,
    transition: {
      delay: 0.1,
      duration: 0.1
    }
  },
  closed: {
    opacity: 0,
    transition: {
      duration: 0.1
    }
  }
};

export const Modal = styled(
  ({
    children,
    open,
    // onClose = () => {},
    className,
    onBackdropClick = () => {},
    disableScrollLock = false,
    preMount = false
  }: ModalProps) => {
    if (typeof document === 'undefined') {
      return null;
    }
    return createPortal(
      <>
        {open && !disableScrollLock && <ScrollLock />}

        <AnimatePresence>
          {(open || preMount) && (
            <motion.div
              animate='open'
              exit='closed'
              variants={backdropVariants}
              initial={{ opacity: 'blur(0px)' }}
              onMouseDown={onBackdropClick}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: '99',
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
              }}>
              <motion.div
                animate='open'
                exit='closed'
                initial={{ opacity: 0 }}
                variants={modalVariants}
                className={`modal ${className}`}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}>
                <div className='modal-container'>{children}</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>,
      document.body
    );
  }
)`
  &.modal {
    padding: 0;
    border-radius: 16px;
    border: none;
    background: white;
    position: absolute;
    box-sizing: border-box;
    min-width: 200px;
    min-height: 100px;

    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .modal-container {
      padding: 24px;
      box-sizing: border-box;
      height: 100%;
    }
  }
`;
