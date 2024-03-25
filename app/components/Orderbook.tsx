import { useOrderbookStream } from '@orderly.network/hooks';
import { API } from '@orderly.network/types';
import { FunctionComponent } from 'react';

import { Spinner } from '.';

export const Orderbook: FunctionComponent<{ symbol: API.Symbol }> = ({ symbol }) => {
  const [data, { isLoading }] = useOrderbookStream(symbol.symbol, undefined, {
    level: 10
  });

  const [_, base, quote] = symbol.symbol.split('_');

  if (isLoading) {
    return (
      <div className="w-[20rem] h-full flex-self-center flex flex-justify-center">
        <Spinner size="4rem" />
      </div>
    );
  }

  let firstAsk: number;
  let firstBid: number;
  return (
    <div className="grid gap-x-2 grid-cols-[5.5rem_5.5rem_8rem] font-bold font-size-[0.9rem] [&>*]:border-b [&>*]:border-[rgba(0, 0, 0, 0.2)] [&>*]:border-b-solid">
      <div>Price ({quote})</div>
      <div>Quantity ({base})</div>
      <div className="text-end">Total ({base})</div>
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
              <div className="color-[var(--color-light-red)]">{price}</div>
              <div>{quantity}</div>
              <div
                style={{
                  background: `linear-gradient(to left, rgba(161, 6, 6, 0.3) ${gradient}%, transparent ${gradient}%)`
                }}
              >
                {aggregated}
              </div>
            </div>
          );
        })}
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
              <div className="color-[var(--color-light-green)]">{price}</div>
              <div>{quantity}</div>
              <div
                style={{
                  background: `linear-gradient(to left, rgba(4, 109, 4, 0.3) ${gradient}%, transparent ${gradient}%)`
                }}
              >
                {aggregated}
              </div>
            </div>
          );
        })
        .reverse()}
    </div>
  );
};
