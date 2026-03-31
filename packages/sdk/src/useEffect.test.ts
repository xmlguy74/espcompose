import { describe, it, expect, beforeEach } from 'vitest';
import { setPhase } from './phase';
import { useEffect } from './hooks/useEffect';
import { useHAEntity, clearHAEntityCache } from './hooks/useHAEntity';
import { withReactiveScope } from './hooks/useReactiveScope';

describe('useEffect', () => {
  beforeEach(() => {
    setPhase('render');
  });

  it('runs the function once immediately', () => {
    let called = false;
    useEffect(() => {
      called = true;
    });
    expect(called).toBe(true);
  });

  it('tracks deps from HA entity access', () => {
    clearHAEntityCache();
    withReactiveScope(() => {
      const sensor = useHAEntity('sensor.humidity');
      useEffect(() => {
        void sensor.value;
      });
    });
  });
});
