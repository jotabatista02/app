/**
 * Parse a numeric entry without accepting a valid prefix followed by garbage.
 * Brazilian grouping wins ambiguous dot-only entries: "1.234" means 1234.
 * Use a comma for decimals when entering three decimal places, e.g. "1,234".
 * A leading zero makes "0.125" an unambiguous decimal entry.
 */
export function parseNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (typeof value !== 'string') return NaN;

  let entry = value.replace(/\s/gu, '');
  if (entry === '') return 0;
  // Currency pasted from pt-BR formatting may put the sign before or after R$.
  entry = entry.replace(/^([+-]?)R\$/iu, '$1');
  const sign = entry.startsWith('-') ? -1 : 1;
  if (/^[+-]/u.test(entry)) entry = entry.slice(1);
  if (!entry) return NaN;

  let normalized;
  if (entry.includes(',')) {
    if (/^(?:\d+|[1-9]\d{0,2}(?:\.\d{3})+),\d+$/u.test(entry)) {
      normalized = entry.replace(/\./gu, '').replace(',', '.');
    } else if (/^,\d+$/u.test(entry)) {
      normalized = `0.${entry.slice(1)}`;
    } else return NaN;
  } else if (/^[1-9]\d{0,2}(?:\.\d{3})+$/u.test(entry)) {
    normalized = entry.replace(/\./gu, '');
  } else if (/^(?:\d+|\d+\.\d+|\.\d+)$/u.test(entry)) {
    normalized = entry;
  } else return NaN;

  const result = Number(normalized) * sign;
  return Number.isFinite(result) ? result : NaN;
}

const MAX_CURRENCY = Number.MAX_SAFE_INTEGER / 100;

/**
 * Round an actual monetary amount to the nearest cent, with positive half ties
 * rounding up. Suggested-price ceiling belongs to the pricing engine instead.
 * The bounded correction only restores half-cent ties lost to binary arithmetic;
 * it does not add a growing epsilon to the amount or round intermediate costs.
 */
export function roundCurrency(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error('O valor monetário deve ser um número finito maior ou igual a zero.');
  }
  if (value > MAX_CURRENCY) {
    throw new Error('O valor monetário excede o limite seguro para representar centavos.');
  }

  const scaled = value * 100;
  const whole = Math.floor(scaled);
  const fraction = scaled - whole;
  const tolerance = Math.min(1e-7, Number.EPSILON * Math.max(1, scaled) * 2);
  const restoredTie = fraction < 0.5 && 0.5 - fraction <= tolerance;
  const cents = Math.round(restoredTie ? whole + 0.5 : scaled);
  if (!Number.isSafeInteger(cents)) {
    throw new Error('O valor monetário excede o limite seguro para representar centavos.');
  }
  return cents === 0 ? 0 : cents / 100;
}
