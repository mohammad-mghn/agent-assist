import { describe, expect, it } from 'vitest';
import {
  findJumpStops,
  getActiveJumpStop,
  getNextJumpStop,
  getNextJumpStopNumber,
  insertJumpStopMarker,
} from '@/lib/jump-stop';

describe('jump-stop', () => {
  it('finds numbered jump-stop markers', () => {
    const text = 'Hello <<1>> world <<name>>';
    expect(findJumpStops(text)).toHaveLength(2);
    expect(findJumpStops(text)[0]).toMatchObject({
      start: 6,
      end: 11,
      innerStart: 8,
      innerEnd: 9,
    });
  });

  it('computes next jump-stop number', () => {
    expect(getNextJumpStopNumber('<<1>> <<3>>')).toBe(4);
    expect(getNextJumpStopNumber('no markers')).toBe(1);
  });

  it('inserts a new numbered marker at the selection', () => {
    const result = insertJumpStopMarker('Hello world', 6, 6);
    expect(result.text).toBe('Hello <<1>>world');
    expect(result.selectEnd - result.selectStart).toBe('<<1>>'.length);
  });

  it('detects active jump-stop from caret position', () => {
    const text = 'Hi <<1>> there';
    const active = getActiveJumpStop(text, 5, 5);
    expect(active?.start).toBe(3);
  });

  it('returns the next jump-stop after the current one', () => {
    const text = '<<1>> and <<2>>';
    const first = findJumpStops(text)[0]!;
    const next = getNextJumpStop(text, first);
    expect(next?.start).toBe(10);
  });
});
