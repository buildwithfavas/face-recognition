import { describe, it, expect } from 'vitest';
import reducer, { startStream, stopStream, setDeviceId } from './CameraSlice';

describe('CameraSlice reducer', () => {
  it('should return the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state).toEqual({ streaming: false });
  });

  it('should handle startStream and stopStream', () => {
    const started = reducer(undefined, startStream());
    expect(started.streaming).toBe(true);
    const stopped = reducer(started, stopStream());
    expect(stopped.streaming).toBe(false);
  });

  it('should set device id', () => {
    const state = reducer(undefined, setDeviceId('device-123'));
    expect((state as any).deviceId).toBe('device-123');
    const cleared = reducer(state, setDeviceId(undefined));
    expect((cleared as any).deviceId).toBeUndefined();
  });
});
