import { type api } from '@musetric/api';
import {
  type MouseEvent,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import { type SubtitleCursor } from './subtitleCursor.js';
import { seekSubtitlePlaybackTime } from './subtitleSeek.js';

const subtitleSegmentIndexAttribute = 'data-subtitle-segment-index';
const subtitleWordStartAttribute = 'data-subtitle-word-start';

const getEventTargetElement = (eventTarget: EventTarget) => {
  if (eventTarget instanceof HTMLElement) {
    return eventTarget;
  }

  if (eventTarget instanceof Node) {
    return eventTarget.parentElement ?? undefined;
  }

  return undefined;
};

const getSubtitleSegmentElement = (
  subtitleListElement: HTMLDivElement,
  segmentIndex: number,
) => {
  return subtitleListElement.querySelector<HTMLElement>(
    `[${subtitleSegmentIndexAttribute}="${segmentIndex}"]`,
  );
};

const getClickedSubtitleWordElement = (eventTarget: EventTarget) => {
  const targetElement = getEventTargetElement(eventTarget);
  if (!targetElement) {
    return;
  }

  return targetElement.closest<HTMLElement>(`[${subtitleWordStartAttribute}]`);
};

const getSubtitleSegmentElementIndex = (segmentElement: HTMLElement) => {
  const segmentIndex = segmentElement.dataset.subtitleSegmentIndex;

  return segmentIndex === undefined ? undefined : Number(segmentIndex);
};

const getSubtitleWordStart = (wordElement: HTMLElement) => {
  const wordStart = wordElement.dataset.subtitleWordStart;

  return wordStart === undefined ? undefined : Number(wordStart);
};

const shouldFollowFromSubtitleSegment = (
  subtitleListElement: HTMLDivElement,
  segmentElement: HTMLElement,
) => {
  const listRect = subtitleListElement.getBoundingClientRect();
  const segmentRect = segmentElement.getBoundingClientRect();
  const listCenterY = listRect.top + listRect.height / 2;
  const segmentCenterY = segmentRect.top + segmentRect.height / 2;

  return segmentCenterY >= listCenterY && segmentCenterY <= listRect.bottom;
};

const scrollSubtitleSegmentToCenter = (
  segmentElement: HTMLElement,
  behavior: ScrollBehavior,
) => {
  segmentElement.scrollIntoView({
    block: 'center',
    behavior,
  });
};

const scheduleSubtitleSegmentCentering = (
  segmentElement: HTMLElement,
  scrollFrameRef: RefObject<number | undefined>,
  behavior: ScrollBehavior,
) => {
  if (scrollFrameRef.current !== undefined) {
    window.cancelAnimationFrame(scrollFrameRef.current);
  }

  scrollFrameRef.current = window.requestAnimationFrame(() => {
    scrollSubtitleSegmentToCenter(segmentElement, behavior);
    scrollFrameRef.current = undefined;
  });
};

export const useSubtitleFollowScroll = (
  subtitle: api.subtitle.Segment[],
  subtitleCursor: SubtitleCursor,
  subtitleListRef: RefObject<HTMLDivElement | null>,
) => {
  const activeSegmentIndexRef = useRef(subtitleCursor.getActiveSegmentIndex());
  const followScrollHeldRef = useRef(false);
  const skippedFollowScrollSegmentIndexRef = useRef<number | undefined>(
    undefined,
  );
  const scrollFrameRef = useRef<number | undefined>(undefined);
  const pointerFollowScrollHeldRef = useRef(false);
  const releaseFollowScrollTimeoutRef = useRef<number | undefined>(undefined);
  const touchFollowScrollHeldRef = useRef(false);

  useEffect(() => {
    const subtitleListElement = subtitleListRef.current;
    if (!subtitleListElement) {
      return;
    }

    const clearReleaseFollowScrollTimeout = () => {
      if (releaseFollowScrollTimeoutRef.current === undefined) {
        return;
      }

      window.clearTimeout(releaseFollowScrollTimeoutRef.current);
      releaseFollowScrollTimeoutRef.current = undefined;
    };

    const holdFollowScroll = () => {
      clearReleaseFollowScrollTimeout();
      followScrollHeldRef.current = true;
    };

    const releaseFollowScroll = () => {
      clearReleaseFollowScrollTimeout();

      releaseFollowScrollTimeoutRef.current = window.setTimeout(() => {
        followScrollHeldRef.current = false;
        releaseFollowScrollTimeoutRef.current = undefined;
      }, 650);
    };

    const holdPointerFollowScroll = () => {
      pointerFollowScrollHeldRef.current = true;
      holdFollowScroll();
    };

    const holdActivePointerFollowScroll = () => {
      if (pointerFollowScrollHeldRef.current) {
        holdFollowScroll();
      }
    };

    const releasePointerFollowScroll = () => {
      pointerFollowScrollHeldRef.current = false;
      releaseFollowScroll();
    };

    const holdTouchFollowScroll = () => {
      touchFollowScrollHeldRef.current = true;
      holdFollowScroll();
    };

    const releaseTouchFollowScroll = () => {
      touchFollowScrollHeldRef.current = false;
      releaseFollowScroll();
    };

    const holdFollowScrollUntilIdle = () => {
      holdFollowScroll();
      releaseFollowScroll();
    };

    const releaseFollowScrollAfterUserScroll = () => {
      if (
        followScrollHeldRef.current &&
        !pointerFollowScrollHeldRef.current &&
        !touchFollowScrollHeldRef.current
      ) {
        releaseFollowScroll();
      }
    };

    subtitleListElement.addEventListener(
      'pointerdown',
      holdPointerFollowScroll,
    );
    subtitleListElement.addEventListener(
      'pointermove',
      holdActivePointerFollowScroll,
    );
    subtitleListElement.addEventListener('touchstart', holdTouchFollowScroll);
    subtitleListElement.addEventListener('touchmove', holdTouchFollowScroll);
    subtitleListElement.addEventListener('wheel', holdFollowScrollUntilIdle);
    subtitleListElement.addEventListener(
      'scroll',
      releaseFollowScrollAfterUserScroll,
    );
    window.addEventListener('pointerup', releasePointerFollowScroll);
    window.addEventListener('pointercancel', releasePointerFollowScroll);
    window.addEventListener('touchend', releaseTouchFollowScroll);
    window.addEventListener('touchcancel', releaseTouchFollowScroll);
    window.addEventListener('blur', releaseFollowScroll);

    return () => {
      clearReleaseFollowScrollTimeout();
      pointerFollowScrollHeldRef.current = false;
      touchFollowScrollHeldRef.current = false;
      followScrollHeldRef.current = false;

      subtitleListElement.removeEventListener(
        'pointerdown',
        holdPointerFollowScroll,
      );
      subtitleListElement.removeEventListener(
        'pointermove',
        holdActivePointerFollowScroll,
      );
      subtitleListElement.removeEventListener(
        'touchstart',
        holdTouchFollowScroll,
      );
      subtitleListElement.removeEventListener(
        'touchmove',
        holdTouchFollowScroll,
      );
      subtitleListElement.removeEventListener(
        'wheel',
        holdFollowScrollUntilIdle,
      );
      subtitleListElement.removeEventListener(
        'scroll',
        releaseFollowScrollAfterUserScroll,
      );
      window.removeEventListener('pointerup', releasePointerFollowScroll);
      window.removeEventListener('pointercancel', releasePointerFollowScroll);
      window.removeEventListener('touchend', releaseTouchFollowScroll);
      window.removeEventListener('touchcancel', releaseTouchFollowScroll);
      window.removeEventListener('blur', releaseFollowScroll);
    };
  }, [subtitleListRef]);

  useLayoutEffect(() => {
    const subtitleListElement = subtitleListRef.current;
    if (!subtitleListElement) {
      return;
    }

    const activeSegmentElement = getSubtitleSegmentElement(
      subtitleListElement,
      subtitleCursor.getActiveSegmentIndex(),
    );

    if (activeSegmentElement) {
      scrollSubtitleSegmentToCenter(activeSegmentElement, 'instant');
    }
  }, [subtitle, subtitleCursor, subtitleListRef]);

  useEffect(() => {
    activeSegmentIndexRef.current = subtitleCursor.getActiveSegmentIndex();

    const unsubscribe = subtitleCursor.subscribeActiveSegmentIndex(() => {
      const nextActiveSegmentIndex = subtitleCursor.getActiveSegmentIndex();
      const subtitleListElement = subtitleListRef.current;

      if (!subtitleListElement) {
        activeSegmentIndexRef.current = nextActiveSegmentIndex;
        return;
      }

      const previousActiveSegmentElement = getSubtitleSegmentElement(
        subtitleListElement,
        activeSegmentIndexRef.current,
      );
      const shouldFollow = previousActiveSegmentElement
        ? shouldFollowFromSubtitleSegment(
            subtitleListElement,
            previousActiveSegmentElement,
          )
        : false;

      activeSegmentIndexRef.current = nextActiveSegmentIndex;

      if (skippedFollowScrollSegmentIndexRef.current !== undefined) {
        const shouldSkipFollowScroll =
          nextActiveSegmentIndex === skippedFollowScrollSegmentIndexRef.current;
        skippedFollowScrollSegmentIndexRef.current = undefined;

        if (shouldSkipFollowScroll) {
          return;
        }
      }

      if (!shouldFollow || followScrollHeldRef.current) {
        return;
      }

      const nextActiveSegmentElement = getSubtitleSegmentElement(
        subtitleListElement,
        nextActiveSegmentIndex,
      );

      if (nextActiveSegmentElement) {
        scheduleSubtitleSegmentCentering(
          nextActiveSegmentElement,
          scrollFrameRef,
          'smooth',
        );
      }
    });

    return () => {
      unsubscribe();

      if (scrollFrameRef.current !== undefined) {
        window.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = undefined;
      }
    };
  }, [subtitleCursor, subtitleListRef]);

  return (event: MouseEvent<HTMLElement>) => {
    const subtitleListElement = subtitleListRef.current;
    if (!subtitleListElement) {
      return;
    }

    const clickedWordElement = getClickedSubtitleWordElement(event.target);
    if (!clickedWordElement) {
      return;
    }

    const clickedWordStart = getSubtitleWordStart(clickedWordElement);
    if (clickedWordStart === undefined) {
      return;
    }

    const clickedSegmentElement = clickedWordElement.closest<HTMLElement>(
      `[${subtitleSegmentIndexAttribute}]`,
    );
    if (!clickedSegmentElement) {
      return;
    }

    const clickedSegmentIndex = getSubtitleSegmentElementIndex(
      clickedSegmentElement,
    );
    if (
      clickedSegmentIndex === undefined ||
      clickedSegmentIndex >= subtitle.length
    ) {
      return;
    }

    skippedFollowScrollSegmentIndexRef.current = clickedSegmentIndex;
    seekSubtitlePlaybackTime(clickedWordStart);

    const listRect = subtitleListElement.getBoundingClientRect();
    const listCenterY = listRect.top + listRect.height / 2;
    if (event.clientY < listCenterY) {
      return;
    }

    scheduleSubtitleSegmentCentering(
      clickedSegmentElement,
      scrollFrameRef,
      'smooth',
    );
  };
};
