import { styled } from '@mui/system';
import React from 'react';
import classNames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollLock } from './ScrollLock';
import { createPortal } from 'react-dom';

interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  disableScrollLock?: boolean;
  setOpen: (open: boolean) => void;
}
export const Drawer = styled(
  ({ className, children, open = false, disableScrollLock = false, setOpen }: DrawerProps) => {
    const variants = {
      open: { x: 0 },
      closed: { x: '100%' }
    };

    return createPortal(
      <>
        {open && !disableScrollLock && <ScrollLock />}

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: 'blur(0)' }}
              animate={{
                opacity: 1,
                backdropFilter: 'blur(2px)'
              }}
              exit={{
                opacity: 0,
                backdropFilter: 'blur(0)',
                transition: {
                  delay: 0.3,
                  duration: 0.3
                }
              }}
              className={classNames(className, 'drawer drawer-backdrop')}
              // onClick={() => setOpen(false)}
              onMouseDown={() => setOpen(false)}>
              <motion.div
                animate='open'
                exit='closed'
                initial={{ x: '100%' }}
                variants={variants}
                transition={{ duration: 0.3 }}
                className='drawer-body'
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}>
                {open && children}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>,
      document.body
    );
  }
)`
  &.drawer {
    position: fixed;
    inset: 0;
    z-index: 99;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);

    .drawer-body {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 33vw;
      min-width: 476px;
      background: white;
      overflow-y: auto;
    }
  }
`;
