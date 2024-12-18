import { useOrderbookStream, useSymbolsInfo } from '@orderly.network/hooks';
import { FC } from 'react';

import { Spinner } from '.';

import { getDecimalsFromTick } from '~/utils';

export const Orderbook: FC<{ symbol: string }> = ({ symbol }) => {
  const [data, { isLoading }] = useOrderbookStream(symbol, undefined, {
    level: 10
  });
  const symbolsInfo = useSymbolsInfo();

  if (isLoading || symbolsInfo.isNil) {
    return (
      <div className="w-[20rem] h-full flex-self-center flex flex-justify-center">
        <Spinner size="4rem" />
      </div>
    );
  }
  const symbolInfo = symbolsInfo[symbol]();
  const [_, base, quote] = symbol.split('_');
  const [baseDecimals, quoteDecimals] = getDecimalsFromTick(symbolInfo);
  const baseFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: baseDecimals });
  const quoteFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: quoteDecimals });

  let firstAsk: number;
  let firstBid: number;
  return (
    <div className="flex flex-col">
      <div className="grid gap-x-2 grid-cols-[5.5rem_5.5rem_8rem] font-bold font-size-[0.9rem] [&>*]:border-b [&>*]:border-[rgba(0, 0, 0, 0.2)] [&>*]:border-b-solid">
        <div>Price ({quote})</div>
        <div>Quantity ({base})</div>
        <div className="text-end">Total ({base})</div>
      </div>
      <div className="grid grid-rows-[1fr_1fr] flex-1">
        <div className="self-end grid gap-x-2 grid-cols-[5.5rem_5.5rem_8rem] font-bold font-size-[0.9rem] [&>*]:border-b [&>*]:border-[rgba(0, 0, 0, 0.2)] [&>*]:border-b-solid">
          {data.asks
            ?.filter(([price]) => !Number.isNaN(price))
            .map(([price, quantity, aggregated], index) => {
              if (firstAsk == null) {
                firstAsk = aggregated;
              }
              const gradient = (100 * aggregated) / firstAsk;
              return (
                <div
                  className="contents [&>*:nth-child(3n)]:text-end [&>*]:border-[rgba(255,255,255,0.5)] [&>*]:border-solid [&>*]:border-0 [&>*]:border-b-1"
                  key={index}
                >
                  <div className="color-[var(--color-light-red)]">
                    {quoteFormatter.format(price)}
                  </div>
                  <div>{baseFormatter.format(quantity)}</div>
                  <div
                    style={{
                      background: `linear-gradient(to left, rgba(161, 6, 6, 0.3) ${gradient}%, transparent ${gradient}%)`
                    }}
                  >
                    {baseFormatter.format(aggregated)}
                  </div>
                </div>
              );
            })}
        </div>
        <div className="self-start grid gap-x-2 grid-cols-[5.5rem_5.5rem_8rem] font-bold font-size-[0.9rem] [&>*]:border-b [&>*]:border-[rgba(0, 0, 0, 0.2)] [&>*]:border-b-solid">
          {data.bids
            ?.filter(([price]) => !Number.isNaN(price))
            .reverse()
            .map(([price, quantity, aggregated], index) => {
              if (firstBid == null) {
                firstBid = aggregated;
              }
              const gradient = (100 * aggregated) / firstBid;
              return (
                <div
                  className="contents [&>*:nth-child(3n)]:text-end [&>*]:border-[rgba(255,255,255,0.5)] [&>*]:border-solid [&>*]:border-0 [&>*]:border-b-1"
                  key={index}
                >
                  <div className="color-[var(--color-light-green)]">
                    {quoteFormatter.format(price)}
                  </div>
                  <div>{baseFormatter.format(quantity)}</div>
                  <div
                    style={{
                      background: `linear-gradient(to left, rgba(4, 109, 4, 0.3) ${gradient}%, transparent ${gradient}%)`
                    }}
                  >
                    {baseFormatter.format(aggregated)}
                  </div>
                </div>
              );
            })
            .reverse()}
        </div>
      </div>
    </div>
  );
};
