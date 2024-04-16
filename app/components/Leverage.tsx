import { useLeverage, useMarginRatio } from '@orderly.network/hooks';
import { Button, Dialog } from '@radix-ui/themes';
import { FC, PropsWithChildren, useRef, useState } from 'react';

import { LeverageEditor } from './LeverageEditor';

export const LeverageDialog: FC<PropsWithChildren> = (props) => {
  const [open, setOpen] = useState(false);
  const { currentLeverage } = useMarginRatio();

  const [maxLeverage, { update, config: leverageLevers, isMutating }] = useLeverage();
  const nextLeverage = useRef(maxLeverage ?? 0);

  const onSave = (value: { leverage: number }) => {
    return Promise.resolve().then(() => {
      nextLeverage.current = value.leverage;
    });
  };

  const onSubmit = () => {
    if (nextLeverage.current === maxLeverage) return;
    update({ leverage: nextLeverage.current }).then(
      () => {
        setOpen(false);
        // display success
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any) => {
        console.dir(err);
        // display error
      }
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>{props.children}</Dialog.Trigger>
      <Dialog.Title>Account Leverage</Dialog.Title>
      <Dialog.Content>
        <div className="flex flex-col">
          <div className="flex gap-1">
            <span className="flex-1">Current:</span>
            <span>{currentLeverage}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="flex-1">Max account leverage</span>
            <div className="my-5 h-[80px]">
              <LeverageEditor
                maxLeverage={maxLeverage}
                leverageLevers={leverageLevers}
                onSave={onSave}
              />
            </div>
          </div>
        </div>
        <Button
          onClick={() => {
            setOpen(false);
          }}
        >
          Cancel
        </Button>
        <Button onClick={() => onSubmit()} loading={isMutating}>
          Save
        </Button>
      </Dialog.Content>
    </Dialog.Root>
  );
};
