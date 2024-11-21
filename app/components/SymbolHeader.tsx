import { useTickerStream } from '@orderly.network/hooks';
import { FC } from 'react';

import { Spinner, SymbolSelection } from '.';

import { usdFormatter } from '~/utils';

export const SymbolHeader: FC<{
  symbol: string;
  setSymbol: React.Dispatch<React.SetStateAction<string | undefined>>;
}> = ({ symbol, setSymbol }) => {
  const stream = useTickerStream(symbol);

  let content;
  if (!stream) {
    content = <Spinner />;
  } else {
    let dailyChange: string | undefined;
    let dailyChangePercentage: string | undefined;
    if (stream['24h_change'] != null && stream.change != null) {
      dailyChange = String(stream['24h_change']);
      dailyChangePercentage = ((stream.change ?? 0) * 100).toFixed(2);
    }

    content = (
      <>
        <SymbolSelection symbol={symbol} setSymbol={setSymbol} />
        <div className="flex flex-col font-size-[0.9rem]">
          <div className="font-size-[0.8rem] color-gray">Mark (USD)</div>
          <div>{usdFormatter.format(stream.mark_price)}</div>
        </div>
        <div className="flex flex-col font-size-[0.9rem]">
          <div className="font-size-[0.8rem] color-gray">Index (USD)</div>
          <div>{usdFormatter.format(stream.index_price)}</div>
        </div>
        <div className="flex flex-col font-size-[0.9rem]">
          <div className="font-size-[0.8rem] color-gray">24h volume (USD)</div>
          <div>{usdFormatter.format(stream['24h_amount'])}</div>
        </div>
        <div className="flex flex-col font-size-[0.9rem]">
          <div className="font-size-[0.8rem] color-gray">24h change (USD)</div>
          <div>
            {dailyChange && dailyChangePercentage ? (
              <>
                {!dailyChange.startsWith('-') ? '+' : ''}
                {usdFormatter.format(Number(dailyChange))} /{' '}
                {!dailyChange.startsWith('-') ? '+' : ''}
                {dailyChangePercentage}%
              </>
            ) : (
              '-'
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-[2.7rem] flex flex-items-center [&>*]:border-0 [&>*:not(:last-child)]:border-r-2 [&>*]:border-solid [&>*]:px-3 [&>*]:border-gray font-bold [&>*:not(:first-child)]:flex-1">
      {content}
    </div>
  );
};
