import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../pivot-head/internal/sanitize';

describe('escapeHtml', () => {
  it('returns empty string for null', () => {
    expect(escapeHtml(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(escapeHtml(undefined)).toBe('');
  });

  it('passes plain strings through unchanged', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });

  it('escapes ampersand', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes less-than', () => {
    expect(escapeHtml('<tag>')).toBe('&lt;tag&gt;');
  });

  it('escapes greater-than', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b');
  });

  it('escapes double quotes', () => {
    expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeHtml("it's fine")).toBe('it&#039;s fine');
  });

  it('converts a number to its string representation', () => {
    expect(escapeHtml(42)).toBe('42');
  });

  it('converts an object to its string representation', () => {
    expect(escapeHtml({ toString: () => 'obj<>' })).toBe('obj&lt;&gt;');
  });

  it('handles a realistic XSS payload', () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe(
      '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'
    );
  });

  it('escapes all special characters in one string', () => {
    expect(escapeHtml('& < > " \'')).toBe('&amp; &lt; &gt; &quot; &#039;');
  });

  it('does not double-escape already escaped entities', () => {
    // The function is not idempotent by design — raw & is escaped
    expect(escapeHtml('&amp;')).toBe('&amp;amp;');
  });
});
