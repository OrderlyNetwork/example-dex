export const baseFormatter = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 20 });
export const usdFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

export function filterAllowedCharacters(value: string): string {
  const commaPos = value.indexOf('.');
  if (commaPos >= 0) {
    return value.substring(0, commaPos) + '.' + value.substring(commaPos + 1).replace(/[^\d]/g, '');
  } else {
    return value.replace(/[^\d.,]/g, '');
  }
}

export function getFormattedNumber(value: string, decimals: number): string {
  if (value === '') return '';
  let commaPos: number;
  [value, commaPos] = getNumberAsUInt128(value, decimals);
  value = value.slice(0, commaPos) + '.' + value.slice(commaPos);
  value = value.replace(/0+$/, '').replace(/^0+/, '');
  if (value === '.') {
    value = '0';
  } else if (value.startsWith('.')) {
    value = '0' + value;
  } else if (value.endsWith('.')) {
    value = value.slice(0, -1);
  }
  return value;
}

export function getNumberAsUInt128(value: string, decimals: number): [string, number] {
  value = value.replaceAll(',', '');
  let commaPos = value.indexOf('.');
  if (commaPos === -1) {
    commaPos = value.length;
  }
  return [
    value
      .replace('.', '')
      .slice(0, commaPos + decimals)
      .padEnd(commaPos + decimals, '0'),
    commaPos
  ];
}
