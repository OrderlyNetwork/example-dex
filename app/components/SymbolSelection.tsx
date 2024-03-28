import { useSymbolsInfo } from '@orderly.network/hooks';
import { API } from '@orderly.network/types';
import { CaretDownIcon } from '@radix-ui/react-icons';
import { Button, Dialog } from '@radix-ui/themes';
import { FunctionComponent, useState } from 'react';

import { Spinner } from '.';

export const SymbolSelection: FunctionComponent<{
  symbol?: API.Symbol;
  setSymbol: React.Dispatch<React.SetStateAction<API.Symbol | undefined>>;
}> = ({ symbol, setSymbol }) => {
  const [open, setOpen] = useState(false);
  const symbolInfo = useSymbolsInfo();

  if (!symbol || symbolInfo.isNil) {
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
          {Object.values(symbolInfo)
            .filter((cur) => typeof cur !== 'boolean')
            .map((cur) => {
              // type guard
              if (typeof cur === 'boolean') return;
              const symbol = cur();
              return (
                <Button
                  key={symbol.symbol}
                  variant="ghost"
                  className="border-rd-0 py-3 font-size-4"
                  onClick={() => {
                    setSymbol(symbol);
                    setOpen(false);
                  }}
                >
                  {symbol.symbol}
                </Button>
              );
            })}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
