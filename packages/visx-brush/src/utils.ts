import { MouseTouchOrPointerEvent } from '@visx/drag/lib/useDrag';
import React from 'react';
import { Scale, MouseButton, MouseButtonArray } from './types';

export function scaleInvert(scale: Scale, value: number) {
  // Test if the scale is an ordinalScale or not,
  // Since an ordinalScale doesn't support invert function.
  if ('invert' in scale && typeof scale.invert !== 'undefined') {
    return scale.invert(value).valueOf();
  }
  const [start, end] = scale.range() as number[];
  let i = 0;
  // ordinal should have step
  const step = 'step' in scale && typeof scale.step !== 'undefined' ? scale.step() : 1;
  const width = (step * (end - start)) / Math.abs(end - start);
  if (width > 0) {
    while (value > start + width * (i + 1)) {
      i += 1;
    }
  } else {
    while (value < start + width * (i + 1)) {
      i += 1;
    }
  }

  return i;
}

export function getDomainFromExtent(
  scale: Scale,
  start: number,
  end: number,
  tolerentDelta: number,
) {
  let domain;
  const invertedStart = scaleInvert(scale, start + (start < end ? -tolerentDelta : tolerentDelta));
  const invertedEnd = scaleInvert(scale, end + (end < start ? -tolerentDelta : tolerentDelta));
  const minValue = Math.min(invertedStart, invertedEnd);
  const maxValue = Math.max(invertedStart, invertedEnd);
  if ('invert' in scale && typeof scale.invert !== 'undefined') {
    domain = {
      start: minValue,
      end: maxValue,
    };
  } else {
    const values = [];
    const scaleDomain = scale.domain();
    for (let i = minValue; i <= maxValue; i += 1) {
      values.push(scaleDomain[i]);
    }
    domain = {
      values,
    };
  }

  return domain;
}

export function getPageCoordinates(event: MouseTouchOrPointerEvent) {
  if (typeof window !== 'undefined' && window.TouchEvent && event instanceof TouchEvent) {
    return {
      pageX: event.touches[0].pageX,
      pageY: event.touches[0].pageY,
    };
  }
  const pointerEvent = event as React.PointerEvent;
  return {
    pageX: pointerEvent.pageX,
    pageY: pointerEvent.pageY,
  };
}

export function getMouseButtonId(button: MouseButton) {
  if (typeof button === 'number') return button;
  if (typeof button !== 'string') return -1;

  switch (button) {
    case 'left':
      return 0;
    case 'middle':
      return 1;
    case 'right':
      return 2;
    default:
      return -1;
  }
}

function removeDuplicates<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

export function numberalizeMouseButtonArray(array: MouseButtonArray | undefined) {
  if (typeof array === 'undefined') return [];
  const arrayOfIds = [...array].map((b: MouseButton) => getMouseButtonId(b) as number);
  return removeDuplicates(arrayOfIds);
}
