import { useAccount, useOrderEntry, useSymbolsInfo, useWithdraw } from '@orderly.network/hooks';
import { OrderlyOrder, OrderSide, OrderType } from '@orderly.network/types';
import { Separator } from '@radix-ui/themes';
import { useNotifications } from '@web3-onboard/react';
import { FC, useCallback, useState } from 'react';
import { match } from 'ts-pattern';

import { ConnectWalletButton, Spinner, TokenInput } from '.';

import { getDecimalsFromTick, usdFormatter, renderFormError } from '~/utils';

export const CreateOrder: FC<{
  symbol: string;
}> = ({ symbol }) => {
  const [loading, setLoading] = useState(false);
  const symbolsInfo = useSymbolsInfo();
  const { account } = useAccount();
  const { availableWithdraw } = useWithdraw();
  const {
    submit,
    setValue,
    maxQty,
    estLeverage,
    estLiqPrice,
    formattedOrder,
    metaState: { errors, dirty, submitted },
    reset
  } = useOrderEntry(symbol, {
    initialOrder: {
      side: OrderSide.BUY,
      order_type: OrderType.MARKET,
      trigger_price: undefined,
      price: undefined,
      order_quantity: undefined
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
      eventCode: 'createOrder',
      type: 'pending',
      message: 'Creating order...'
    });
    try {
      await submit();
      update({
        eventCode: 'createOrderSuccess',
        type: 'success',
        message: 'Order successfully created!',
        autoDismiss: 5_000
      });
      reset();
    } catch (err) {
      console.error(`Unhandled error in "submitForm":`, err);
      update({
        eventCode: 'createOrderError',
        type: 'error',
        message: 'Order creation failed!',
        autoDismiss: 5_000
      });
    } finally {
      setLoading(false);
    }
  };

  const symbolInfo = symbolsInfo[symbol]();
  const [_, base, quote] = symbol.split('_');
  const [baseDecimals, quoteDecimals] = getDecimalsFromTick(symbolInfo);

  const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: baseDecimals });

  return (
    <form
      className="flex flex-1 flex-col gap-6 min-w-[16rem] max-w-[24rem]"
      onSubmit={(event) => {
        event.preventDefault();
        submitForm();
      }}
    >
      <div className="flex flex-1">
        <button
          type="button"
          className={`flex flex-items-center flex-justify-center py-1 bg-[var(--color-bg-green)] hover:bg-[var(--color-bg-green-hover)] font-bold border-rd-l-1 border-rd-r-0 w-[50%] ${formattedOrder.side === OrderSide.BUY ? 'border-solid border-3 border-[var(--color-light-green)]' : 'border-none'}`}
          onClick={() => {
            setValue('side', OrderSide.BUY);
          }}
        >
          Long
        </button>
        <button
          type="button"
          className={`flex flex-items-center flex-justify-center py-1 bg-[var(--color-bg-red)] hover:bg-[var(--color-bg-red-hover)] font-bold border-rd-r-1 border-rd-l-0 w-[50%] ${formattedOrder.side === OrderSide.SELL ? 'border-solid border-3 border-[var(--color-light-red)]' : 'border-none'}`}
          onClick={() => {
            setValue('side', OrderSide.SELL);
          }}
        >
          Short
        </button>
      </div>

      <div className="flex flex-1 justify-between gap-3">
        <span className="font-bold color-[var(--gray-12)]">Available:</span>
        <span>
          {usdFormatter.format(availableWithdraw)} {quote}
        </span>
      </div>

      <select
        className="flex flex-1 py-2 text-center font-bold"
        onChange={(event) => {
          console.log('CHANGE', event.target.value);
          setValue('order_type', event.target.value);
        }}
      >
        <option value="MARKET">Market</option>
        <option value="LIMIT">Limit</option>
        <option value="STOP_LIMIT">Stop Limit</option>
      </select>

      <label
        className={`flex-col ${match(formattedOrder.order_type)
          .with(OrderType.STOP_LIMIT, () => 'flex')
          .otherwise(() => 'hidden')}`}
      >
        <span className="font-bold font-size-5">Trigger Price ({quote})</span>
        <TokenInput
          className={`${hasError('trigger_price') ? 'border-[var(--color-red)]' : ''}`}
          decimals={quoteDecimals}
          placeholder="Trigger Price"
          name="trigger_price"
          hasError={!!hasError('trigger_price')}
          onValueChange={(value) => {
            setValue('trigger_price', value.toString());
          }}
        />
        {renderFormError(hasError('trigger_price'))}
      </label>

      <label className="flex flex-col">
        <span className="font-bold font-size-5">Price ({quote})</span>
        <TokenInput
          className={`${hasError('price') ? 'border-[var(--color-red)]' : ''}`}
          decimals={quoteDecimals}
          placeholder="Price"
          name="price"
          hasError={!!hasError('price')}
          readonly={match(formattedOrder.order_type)
            .with(OrderType.MARKET, () => true)
            .otherwise(() => false)}
          onValueChange={(value) => {
            setValue('price', value.toString());
          }}
        />
        {renderFormError(hasError('price'))}
      </label>

      <label className="flex flex-col">
        <span className="font-bold font-size-5">Quantity ({base})</span>
        <TokenInput
          className={`${hasError('order_quantity') ? 'border-[var(--color-red)]' : ''}`}
          decimals={baseDecimals}
          placeholder="Quantity"
          name="order_quantity"
          hasError={!!hasError('trigger_price')}
          onValueChange={(value) => {
            setValue('order_quantity', value.toString());
          }}
        />
        {renderFormError(hasError('order_quantity'))}
        <div className="flex flex-1 justify-between gap-3">
          <span className="font-bold color-[var(--gray-12)]">Max:</span>
          <span>
            {formatter.format(maxQty)} {base}
          </span>
        </div>
      </label>

      <Separator className="min-w-full my--2" />

      <div className="flex flex-1 justify-between gap-3">
        <span className="font-bold color-[var(--gray-12)]">Est. Liq. price:</span>
        <span>{estLiqPrice ? `${usdFormatter.format(estLiqPrice)} ${quote}` : '-'}</span>
      </div>
      <div className="flex flex-1 justify-between gap-3">
        <span className="font-bold color-[var(--gray-12)]">Account leverage:</span>
        <span>{estLeverage != null ? `⇒ ${formatter.format(estLeverage)}` : '-'}</span>
      </div>

      <Separator className="min-w-full my--2" />

      <button
        type="submit"
        disabled={loading}
        className={`relative py-2 font-size-5 bg-[var(--accent-9)] hover:bg-[var(--accent-10)] border-rd-1 border-0 ${account.address == null ? 'hidden' : ''}`}
      >
        {loading && <Spinner overlay={true} />} Create Order
      </button>
      {account.address == null && <ConnectWalletButton />}
    </form>
  );
};
