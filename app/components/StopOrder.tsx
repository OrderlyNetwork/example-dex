import { useOrderEntry, useSymbolsInfo } from '@orderly.network/hooks';
import { positions } from '@orderly.network/perp';
import { API, OrderlyOrder, OrderSide, OrderType } from '@orderly.network/types';
import { Slider } from '@radix-ui/themes';
import { useNotifications } from '@web3-onboard/react';
import { FixedNumber } from 'ethers';
import { Dispatch, FC, SetStateAction, useCallback, useState } from 'react';
import { match } from 'ts-pattern';

import { Spinner, TokenInput } from '.';

import { getDecimalsFromTick, renderFormError, usdFormatter } from '~/utils';

export const StopOrder: FC<{
  position: API.PositionExt;
  setOpen: Dispatch<SetStateAction<boolean>>;
}> = ({ position, setOpen }) => {
  const [loading, setLoading] = useState(false);

  const symbolsInfo = useSymbolsInfo();

  const isLong = position.position_qty > 0;
  const {
    submit,
    setValue,
    formattedOrder,
    metaState: { dirty, errors, submitted }
  } = useOrderEntry(position.symbol, {
    initialOrder: {
      side: isLong ? OrderSide.SELL : OrderSide.BUY,
      order_type: OrderType.STOP_MARKET,
      trigger_price: undefined,
      order_quantity: String(Math.abs(position.position_qty))
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

  const isTakeProfit = isLong
    ? formattedOrder.side === OrderSide.SELL
    : formattedOrder.side === OrderSide.BUY;

  if (symbolsInfo.isNil) {
    return <Spinner />;
  }

  const submitForm = async () => {
    setLoading(true);
    const { update } = customNotification({
      eventCode: 'createStopOrder',
      type: 'pending',
      message: 'Creating order...'
    });
    try {
      console.log(errors);
      await submit();
      update({
        eventCode: 'createStopOrderSuccess',
        type: 'success',
        message: 'Order successfully created!',
        autoDismiss: 5_000
      });
    } catch (err) {
      console.error(`Unhandled error in "submitForm":`, err);
      update({
        eventCode: 'createStopOrderError',
        type: 'error',
        message: 'Order creation failed!',
        autoDismiss: 5_000
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const estimatedPnl = positions.unrealizedPnL({
    qty: Number(formattedOrder.order_quantity ?? 0),
    openPrice: position.average_open_price,
    markPrice: Number(formattedOrder.trigger_price ?? 0)
  });

  const symbolInfo = symbolsInfo[position.symbol]();
  const [_, base, quote] = position.symbol.split('_');
  const [baseDecimals, quoteDecimals] = getDecimalsFromTick(symbolInfo);

  return (
    <form
      className="flex flex-1 flex-col gap-3 w-full"
      onSubmit={(event) => {
        event.preventDefault();
        submitForm();
      }}
    >
      <div>
        Create an algorithmic order to (partially) close a position when a specific mark price is
        reached.
      </div>

      <div className="flex flex-1">
        <button
          type="button"
          className={`flex flex-items-center flex-justify-center py-1 bg-[var(--color-bg-green)] hover:bg-[var(--color-bg-green-hover)] font-bold border-rd-l-1 border-rd-r-0 w-[50%] ${isTakeProfit ? 'border-solid border-3 border-[var(--color-light-green)]' : 'border-none'}`}
          onClick={() => {
            setValue('side', isLong ? OrderSide.SELL : OrderSide.BUY);
          }}
        >
          Take Profit
        </button>
        <button
          type="button"
          className={`flex flex-items-center flex-justify-center py-1 bg-[var(--color-bg-red)] hover:bg-[var(--color-bg-red-hover)] font-bold border-rd-r-1 border-rd-l-0 w-[50%] ${!isTakeProfit ? 'border-solid border-3 border-[var(--color-light-red)]' : 'border-none'}`}
          onClick={() => {
            setValue('side', isLong ? OrderSide.BUY : OrderSide.SELL);
          }}
        >
          Stop Loss
        </button>
      </div>

      <label className="flex flex-col">
        <span className="font-bold font-size-5">Price ({quote})</span>
        <TokenInput
          className={`${hasError('trigger_price') ? 'border-[var(--color-red)]' : ''}`}
          decimals={quoteDecimals}
          placeholder="Price"
          name="trigger_price"
          hasError={!!hasError('trigger_price')}
          onValueChange={(value) => {
            setValue('trigger_price', value.toString());
          }}
        />
        {renderFormError(hasError('trigger_price'))}
      </label>

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

      <div className="flex flex-1 justify-between gap-3">
        <span className="font-bold color-[var(--gray-12)]">Est. PnL:</span>
        <span>
          {formattedOrder.order_quantity && formattedOrder.trigger_price
            ? `${usdFormatter.format(estimatedPnl)} ${quote}`
            : '-'}
        </span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="relative py-2 font-size-5 bg-[var(--accent-9)] hover:bg-[var(--accent-10)] border-rd-1 border-0"
      >
        {loading && <Spinner overlay={true} />}{' '}
        {match(isTakeProfit)
          .with(true, () => 'Take Profit')
          .with(false, () => 'Stop Loss')
          .exhaustive()}
      </button>
    </form>
  );
};
