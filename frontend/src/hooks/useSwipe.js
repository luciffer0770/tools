import { useRef } from 'react';

export function useSwipe({ onLeft, onRight, threshold = 50 } = {}) {
  const startX = useRef(0);

  function onTouchStart(e) {
    startX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e) {
    const endX = e.changedTouches[0].clientX;
    const dx = endX - startX.current;
    if (dx > threshold) onRight?.();
    if (dx < -threshold) onLeft?.();
  }

  return { onTouchStart, onTouchEnd };
}
