import { useQuery } from '@orderly.network/hooks';
import { API } from '@orderly.network/types';
import { CaretDownIcon } from '@radix-ui/react-icons';
import { Button, Dialog } from '@radix-ui/themes';
import { FunctionComponent, useEffect, useState } from 'react';

import { Spinner } from '.';

export const SymbolSelection: FunctionComponent<{
  symbol?: API.Symbol;
  setSymbol: React.Dispatch<React.SetStateAction<API.Symbol | undefined>>;
}> = ({ symbol, setSymbol }) => {
  const [open, setOpen] = useState(false);
  const { data } = useQuery<API.Symbol[]>('/v1/public/info');

  useEffect(() => {
    if (!data || symbol) return;
    setSymbol(data.find((cur) => cur.symbol === 'PERP_BTC_USDC')!);
  }, [data, symbol, setSymbol]);

  if (!data || !symbol) {
    return <Spinner />;
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <button className="py-3 font-size-4 bg-transparent hover:bg-[var(--accent-3)] cursor-pointer flex flex-items-center gap-2">
          {symbol.symbol}
          <CaretDownIcon />
        </button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-xs" size="2">
        <Dialog.Title>
          <span className="mr-2">Select Symbol</span>
        </Dialog.Title>

        <div className="flex flex-col max-h-[30rem]">
          {data.map((cur) => {
            return (
              <Button
                key={cur.symbol}
                variant="ghost"
                className="border-rd-0 py-3 font-size-4"
                onClick={() => {
                  setSymbol(cur);
                  setOpen(false);
                }}
              >
                {cur.symbol}
              </Button>
            );
          })}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
