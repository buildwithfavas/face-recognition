 import { describe, it, expect } from 'vitest';
import reducer, { setDetections, clearDetections, setIsDetecting } from './FacesSlice';
import type { FaceResult } from './types';

describe('FacesSlice reducer', () => {
  it('should return the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state).toEqual({ detections: [], isDetecting: false, lastUpdated: null });
  });

  it('should handle setDetections and update lastUpdated', () => {
    const detections: FaceResult[] = [
      {
        id: '1',
        box: { x: 1, y: 2, width: 10, height: 12 },
        score: 0.9,
        age: 30,
        gender: 'other',
        expressions: { happy: 0.8 },
      },
    ];
    const state = reducer(undefined, setDetections(detections));
    expect(state.detections).toHaveLength(1);
    expect(state.detections[0].id).toBe('1');
    expect(state.lastUpdated).not.toBeNull();
  });

  it('should handle clearDetections', () => {
    const detections: FaceResult[] = [
      { id: '1', box: { x: 0, y: 0, width: 1, height: 1 } },
    ];
    const withData = reducer(undefined, setDetections(detections));
    const cleared = reducer(withData, clearDetections());
    expect(cleared.detections).toHaveLength(0);
    expect(cleared.lastUpdated).toBeNull();
  });

  it('should handle setIsDetecting', () => {
    const stateTrue = reducer(undefined, setIsDetecting(true));
    expect(stateTrue.isDetecting).toBe(true);
    const stateFalse = reducer(stateTrue, setIsDetecting(false));
    expect(stateFalse.isDetecting).toBe(false);
  });
});
