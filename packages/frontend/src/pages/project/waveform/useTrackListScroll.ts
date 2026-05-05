import { type SxProps, type Theme } from '@mui/material';
import { useLayoutEffect, useRef } from 'react';
import { useProjectStore } from '../store.js';

export const hiddenTrackListScrollbarSx: SxProps<Theme> = {
  scrollbarWidth: {
    md: 'none',
  },
  '&::-webkit-scrollbar': {
    display: {
      md: 'none',
    },
  },
};

export const useTrackListScroll = (enabled = true) => {
  const listRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const trackListElement = listRef.current;
    if (!trackListElement) {
      return undefined;
    }

    trackListElement.scrollTop = useProjectStore.getState().trackListScrollTop;

    const updateTrackListScrollTop = () => {
      const { scrollTop } = trackListElement;
      const { setTrackListScrollTop, trackListScrollTop } =
        useProjectStore.getState();

      if (trackListScrollTop !== scrollTop) {
        setTrackListScrollTop(scrollTop);
      }
    };

    trackListElement.addEventListener('scroll', updateTrackListScrollTop, {
      passive: true,
    });

    const unsubscribe = useProjectStore.subscribe(
      (state) => state.trackListScrollTop,
      (trackListScrollTop) => {
        if (trackListElement.scrollTop !== trackListScrollTop) {
          trackListElement.scrollTop = trackListScrollTop;
        }
      },
    );

    return () => {
      trackListElement.removeEventListener('scroll', updateTrackListScrollTop);
      unsubscribe();
    };
  }, [enabled]);

  return listRef;
};
