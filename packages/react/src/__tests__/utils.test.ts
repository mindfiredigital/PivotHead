import { describe, it, expect } from 'vitest';
import { toJsonAttr } from '../utils';

describe('toJsonAttr', () => {
  it('serializes a plain object', () => {
    expect(toJsonAttr({ a: 1, b: 'x' })).toBe('{"a":1,"b":"x"}');
  });

  it('serializes an array', () => {
    expect(toJsonAttr([1, 2, 3])).toBe('[1,2,3]');
  });

  it('serializes a string', () => {
    expect(toJsonAttr('hello')).toBe('"hello"');
  });

  it('serializes a number', () => {
    expect(toJsonAttr(42)).toBe('42');
  });

  it('serializes null', () => {
    expect(toJsonAttr(null)).toBe('null');
  });

  it('returns undefined for undefined input (JSON.stringify behavior)', () => {
    expect(toJsonAttr(undefined)).toBeUndefined();
  });

  it('returns undefined for circular references', () => {
    const obj: Record<string, unknown> = {};
    obj.self = obj;
    expect(toJsonAttr(obj)).toBeUndefined();
  });

  it('serializes booleans', () => {
    expect(toJsonAttr(true)).toBe('true');
    expect(toJsonAttr(false)).toBe('false');
  });

  it('serializes nested objects', () => {
    const input = { rows: ['name'], measures: [{ uniqueName: 'value' }] };
    expect(toJsonAttr(input)).toBe(
      '{"rows":["name"],"measures":[{"uniqueName":"value"}]}'
    );
  });

  it('produces output that round-trips through JSON.parse', () => {
    const input = [{ name: 'Alice', value: 100 }];
    const output = toJsonAttr(input);
    expect(JSON.parse(output!)).toEqual(input);
  });
});
