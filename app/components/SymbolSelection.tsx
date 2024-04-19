import { MarketsType, useMarkets } from '@orderly.network/hooks';
import { CaretDownIcon } from '@radix-ui/react-icons';
import { Button, Dialog } from '@radix-ui/themes';
import { FC, useState } from 'react';

import { Spinner } from '.';

export const SymbolSelection: FC<{
  symbol?: string;
  setSymbol: React.Dispatch<React.SetStateAction<string | undefined>>;
}> = ({ symbol, setSymbol }) => {
  const [open, setOpen] = useState(false);

  const [markets] = useMarkets(MarketsType.ALL);
  if (!symbol) {
    return <Spinner />;
  }
  const [_, base] = symbol.split('_');

  console.log('markets', markets);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <button className="py-3 font-size-4 bg-transparent hover:bg-[var(--accent-3)] cursor-pointer flex flex-items-center gap-2">
          PERP-{base}
          <CaretDownIcon />
        </button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-xs" size="2">
        <Dialog.Title>
          <span className="mr-2">Select Symbol</span>
        </Dialog.Title>

        <div className="flex flex-col max-h-[30rem]">
          {Object.values(markets).map((market) => {
            const [_, base] = market.symbol.split('_');
            return (
              <Button
                key={market.symbol}
                variant="ghost"
                className="border-rd-0 py-3 font-size-4"
                onClick={() => {
                  setSymbol(market.symbol);
                  setOpen(false);
                }}
              >
                PERP-{base}
              </Button>
            );
          })}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
