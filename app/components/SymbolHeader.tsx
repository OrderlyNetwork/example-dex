/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTickerStream } from '@orderly.network/hooks';
import { API } from '@orderly.network/types';
import { FunctionComponent } from 'react';

import { SymbolSelection } from '.';

export const SymbolHeader: FunctionComponent<{
  symbol: API.Symbol;
  setSymbol: React.Dispatch<React.SetStateAction<API.Symbol | undefined>>;
}> = ({ symbol, setSymbol }) => {
  const stream = useTickerStream(symbol.symbol);

  if (!stream) return;

  return (
    <div className="flex flex-items-center [&>*]:border-0 [&>*:not(:last-child)]:border-r-2 [&>*]:border-solid [&>*]:px-3 [&>*]:border-gray font-bold [&>*:not(:first-child)]:flex-1">
      <SymbolSelection symbol={symbol} setSymbol={setSymbol} />
      <div className="flex flex-col font-size-[0.9rem]">
        <div className="font-size-[0.8rem] color-gray">Mark</div>
        <div>{stream.mark_price}</div>
      </div>
      <div className="flex flex-col font-size-[0.9rem]">
        <div className="font-size-[0.8rem] color-gray">Index</div>
        <div>{stream.index_price}</div>
      </div>
      <div className="flex flex-col font-size-[0.9rem]">
        <div className="font-size-[0.8rem] color-gray">24h volume</div>
        <div>{stream['24h_amount']}</div>
      </div>
      <div className="flex flex-col font-size-[0.9rem]">
        <div className="font-size-[0.8rem] color-gray">24h change</div>
        <div>
          {(stream as any)['24h_change']?.toNumber() ?? '-'} /{' '}
          {(stream as any)['24h_change']?.div(stream.index_price).mul(100).toPrecision(4, 2) ?? '-'}
          %
        </div>
      </div>
    </div>
  );
};
