import { API } from '@orderly.network/types';

export function getDecimalsFromTick(symbol?: API.Symbol): [number, number] {
  if (symbol == null) {
    return [0, 0];
  }
  let baseDecimals: number = 0;
  if (symbol.base_tick < 1) {
    baseDecimals = (symbol.base_tick + '').split('.')[1].length;
  }
  let quoteDecimals: number = 0;
  if (symbol.quote_tick < 1) {
    quoteDecimals = (symbol.quote_tick + '').split('.')[1].length;
  }
  return [baseDecimals, quoteDecimals];
}
