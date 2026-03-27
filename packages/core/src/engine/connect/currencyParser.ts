/**
 * Try to parse currency-like strings into a number.
 * Handles symbols ($, €, £, ₹, etc.), spaces, thousands separators and decimal marks
 * including both "," and ".", and negatives in parentheses.
 */
export function parseCurrencyToNumber(input: unknown): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input === 'number') return isFinite(input) ? input : null;
  if (typeof input !== 'string') return null;

  let s = input.trim();
  if (!s) return null;

  const hasCurrencySymbol = /[€£¥₹$]/.test(s);
  const hasLetters = /[A-Za-z]/.test(s);
  const hasSeparator = /[.,]/.test(s);
  const hasParenNegRaw = s.startsWith('(') && s.endsWith(')');

  // If contains letters but no currency symbol (e.g., 'value 1'), don't treat as currency/number here
  if (hasLetters && !hasCurrencySymbol) return null;
  // If no currency symbol, no separators and no parentheses negative, leave as-is (handled later by Number/Date checks)
  if (!hasCurrencySymbol && !hasSeparator && !hasParenNegRaw) return null;

  // Detect and handle negatives like (1,234.56)
  let negative = false;
  if (hasParenNegRaw) {
    negative = true;
    s = s.slice(1, -1);
  }

  // Remove currency symbols and any non digit/sep/minus
  // Keep digits, comma, dot, minus
  s = s.replace(/[^0-9,.-]/g, '');

  // If there are multiple minus signs, invalid
  if ((s.match(/-/g) || []).length > 1) return null;
  // Normalize minus position
  s = s.replace(/(.*)-(.*)/, '-$1$2');

  const hasDot = s.includes('.');
  const hasComma = s.includes(',');

  const lastDot = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');

  let normalized = s;

  if (hasDot && hasComma) {
    // Use the rightmost separator as decimal separator
    const decimalSep = lastDot > lastComma ? '.' : ',';
    const thousandSep = decimalSep === '.' ? ',' : '.';
    normalized = normalized.split(thousandSep).join('');
    normalized = normalized.replace(decimalSep, '.');
  } else if (hasComma && !hasDot) {
    // Only comma present. If multiple commas -> treat all as thousands except possibly the last
    const parts = s.split(',');
    if (parts.length > 2) {
      // Remove all commas, assume integer (rarely has multiple decimal commas)
      normalized = parts.join('');
    } else if (parts.length === 2) {
      // Decide whether comma is decimal or thousand by digits after
      const frac = parts[1];
      if (frac.length === 2 || frac.length === 3) {
        normalized = parts[0] + '.' + frac; // decimal comma
      } else {
        normalized = parts.join(''); // thousands comma
      }
    }
  } else if (hasDot && !hasComma) {
    // Only dot present. If multiple dots, keep the last as decimal, remove others
    const pieces = s.split('.');
    if (pieces.length > 2) {
      const frac = pieces.pop() as string;
      normalized = pieces.join('') + '.' + frac;
    } else {
      normalized = s; // single dot, assume decimal
    }
  } else {
    normalized = s; // no separators, just digits (and maybe minus)
  }

  const n = Number(normalized);
  if (isNaN(n)) return null;
  return negative ? -n : n;
}
