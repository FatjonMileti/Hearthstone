import { styled } from '@mui/system';
import { LoadingMatch } from './LoadingMatch';
import React, { HTMLAttributes } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';

import { create } from 'zustand';

interface BackdropStoreType {
  ids: any;
  setState: (
    partial:
      | BackdropStoreType
      | Partial<BackdropStoreType>
      | ((state: BackdropStoreType) => BackdropStoreType | Partial<BackdropStoreType>),
    replace?: boolean | undefined
  ) => void;
  show: (id: string) => void;
  hide: (id: string) => void;
}

const useBackdropStore = create<BackdropStoreType>((setState) => {
  return {
    ids: {},
    setState,
    show: (id) => {
      setState(({ ids }) => {
        ids[id] = true;
        return { ids };
      });
    },
    hide: (id) => {
      setState(({ ids }) => {
        delete ids[id];
        return { ids };
      });
    }
  };
});

export const ShowGlobalLoading = () => {
  const backdropStore = useBackdropStore();

  const id = React.useId();

  React.useEffect(() => {
    backdropStore.show(id);

    return () => {
      backdropStore.hide(id);
    };
  }, []);

  return null;
};

export const animation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    duration: 0.5
  }
};

export const GlobalLoading = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  const backdropStore = useBackdropStore();

  return createPortal(
    <>
      <AnimatePresence>
        {Object.values(backdropStore.ids).length > 0 && (
          <motion.div className={className} {...animation}>
            <LoadingMatch />
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
})`
  & {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999;

    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(4px);

    display: grid;
    justify-content: center;
    align-items: center;

    cursor: wait;
  }
`;
