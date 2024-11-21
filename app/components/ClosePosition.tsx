import { useOrderEntry, useSymbolsInfo } from '@orderly.network/hooks';
import { API, OrderlyOrder, OrderSide, OrderType } from '@orderly.network/types';
import { Slider } from '@radix-ui/themes';
import { useNotifications } from '@web3-onboard/react';
import { FixedNumber } from 'ethers';
import { Dispatch, FC, SetStateAction, useCallback, useState } from 'react';

import { Spinner, TokenInput } from '.';

import { getDecimalsFromTick } from '~/utils';
import { renderFormError } from '~/utils/form';

export const ClosePosition: FC<{
  position: API.PositionExt;
  setOpen: Dispatch<SetStateAction<boolean>>;
}> = ({ position, setOpen }) => {
  const [loading, setLoading] = useState(false);

  const symbolsInfo = useSymbolsInfo();

  const {
    submit,
    setValue,
    formattedOrder,
    metaState: { dirty, errors, submitted }
  } = useOrderEntry(position.symbol, {
    initialOrder: {
      side: position.position_qty > 0 ? OrderSide.SELL : OrderSide.BUY,
      order_type: OrderType.MARKET,
      order_quantity: String(Math.abs(position.position_qty)),
      reduce_only: true
    }
  });
  const hasError = useCallback(
    (
      key: keyof OrderlyOrder
    ):
      | {
          type: string;
          message: string;
        }
      | undefined => {
      if (!dirty[key] && !submitted) {
        return;
      }
      return errors?.[key];
    },
    [errors, dirty, submitted]
  );
  const [_0, customNotification] = useNotifications();

  if (symbolsInfo.isNil) {
    return <Spinner />;
  }

  const submitForm = async () => {
    setLoading(true);
    const { update } = customNotification({
      eventCode: 'closePosition',
      type: 'pending',
      message: 'Closing position...'
    });
    try {
      await submit();
      update({
        eventCode: 'closePositionSuccess',
        type: 'success',
        message: 'Successfully closed position!',
        autoDismiss: 5_000
      });
    } catch (err) {
      console.error(`Unhandled error in "submitForm":`, err);
      update({
        eventCode: 'closePositionError',
        type: 'error',
        message: 'Closing position failed!',
        autoDismiss: 5_000
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const symbolInfo = symbolsInfo[position.symbol]();
  const [_, base] = position.symbol.split('_');
  const [baseDecimals] = getDecimalsFromTick(symbolInfo);

  return (
    <form
      className="flex flex-1 flex-col gap-6 w-full"
      onSubmit={(event) => {
        event.preventDefault();
        submitForm();
      }}
    >
      <div>Partially or fully close your open position at mark price.</div>

      <label className="flex flex-col">
        <span className="font-bold font-size-5">Quantity ({base})</span>

        <TokenInput
          className={`mb-2 ${hasError('order_quantity') ? 'border-[var(--color-red)]' : ''}`}
          decimals={baseDecimals}
          placeholder="Quantity"
          name="order_quantity"
          value={formattedOrder.order_quantity}
          onValueChange={(value) => {
            setValue('order_quantity', value.toString());
          }}
          min={FixedNumber.fromString('0')}
          max={FixedNumber.fromString(String(Math.abs(position.position_qty)))}
          hasError={!!hasError('order_quantity')}
        />
        <Slider
          value={[Number(formattedOrder.order_quantity)]}
          defaultValue={[100]}
          variant="surface"
          name="order_quantity"
          onValueChange={(value) => {
            setValue('order_quantity', value.toString());
          }}
          min={0}
          max={Math.abs(position.position_qty)}
          step={symbolInfo.base_tick}
        />
        <div className="font-size-[1.1rem] flex w-full justify-center my-1">
          {formattedOrder.order_quantity} {base}
        </div>
        {renderFormError(hasError('order_quantity'))}
      </label>

      <button
        type="submit"
        disabled={loading}
        className="relative py-2 font-size-5 bg-[var(--accent-9)] hover:bg-[var(--accent-10)] border-rd-1 border-0"
      >
        {loading && <Spinner overlay={true} />} Close Position
      </button>
    </form>
  );
};
