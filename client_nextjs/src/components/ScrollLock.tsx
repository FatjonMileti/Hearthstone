import React from 'react';
import { create } from 'zustand';

interface ScrollLockStoreType {
  ids: any;
  lock: (id: string) => any;
  unlock: (id: string) => any;
}

const useScrollLockStore = create<ScrollLockStoreType>((setState) => {
  return {
    ids: {},
    lock: (id: string) => {
      setState(({ ids }) => {
        ids[id] = true;

        if (Object.keys(ids).length === 1) {
          document.body.style.overflow = 'hidden';
        }
        return { ids };
      });
    },
    unlock: (id: string) => {
      setState(({ ids }) => {
        delete ids[id];

        if (Object.keys(ids).length === 0) {
          document.body.style.overflow = 'unset';
        }
        return { ids };
      });
    }
  };
});

export const ScrollLock = () => {
  const id = React.useId();
  const scrollLockStore = useScrollLockStore();

  React.useEffect(() => {
    scrollLockStore.lock(id);
    return () => {
      scrollLockStore.unlock(id);
    };
  }, []);

  return null;
};
