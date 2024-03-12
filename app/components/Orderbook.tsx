import { useOrderbookStream } from '@orderly.network/hooks';
import { API } from '@orderly.network/types';
import { FunctionComponent } from 'react';

export const Orderbook: FunctionComponent<{ symbol: API.Symbol }> = ({ symbol }) => {
  const [data, { isLoading }] = useOrderbookStream(symbol.symbol, undefined, {
    level: 10
  });

  let firstAsk: number;
  let firstBid: number;
  return (
    <div className="max-w-full w-full flex flex-col gap-3 flex-items-center flex-justify-center">
      {!isLoading && (
        <div className="grid gap-x-2 grid-cols-[6rem_6rem_10rem] font-bold font-size-[0.9rem] [&>*]:border-b [&>*]:border-[rgba(0, 0, 0, 0.2)] [&>*]:border-b-solid [&>*:nth-child(3n -1)]:text-end [&>*:nth-child(3n)]:text-end">
          <div>Price (USDC)</div>
          <div>Quantity (ETH)</div>
          <div>Total (ETH)</div>
          {data.asks
            ?.filter(([price]) => !Number.isNaN(price))
            .map(([price, quantity, aggregated]) => {
              if (firstAsk == null) {
                firstAsk = aggregated;
              }
              const gradient = (100 * aggregated) / firstAsk;
              return (
                <>
                  <div className="color-[var(--color-red)] border-white">{price}</div>
                  <div>{quantity}</div>
                  <div
                    style={{
                      background: `linear-gradient(to left, rgba(161, 6, 6, 0.3) ${gradient}%, transparent ${gradient}%)`
                    }}
                  >
                    {aggregated}
                  </div>
                </>
              );
            })}
          {data.bids
            ?.filter(([price]) => !Number.isNaN(price))
            .reverse()
            .map(([price, quantity, aggregated]) => {
              if (firstBid == null) {
                firstBid = aggregated;
              }
              const gradient = (100 * aggregated) / firstBid;
              return (
                <>
                  <div className="color-[var(--color-green)] border-white">{price}</div>
                  <div>{quantity}</div>
                  <div
                    style={{
                      background: `linear-gradient(to left, rgba(4, 109, 4, 0.3) ${gradient}%, transparent ${gradient}%)`
                    }}
                  >
                    {aggregated}
                  </div>
                </>
              );
            })
            .reverse()}
        </div>
      )}
    </div>
  );
};
