import { useAccount, useOrderEntry, useSymbolsInfo, useWithdraw } from '@orderly.network/hooks';
import { AlgoOrderRootType, OrderlyOrder, OrderSide, OrderType } from '@orderly.network/types';
import { Separator } from '@radix-ui/themes';
import { useNotifications } from '@web3-onboard/react';
import { FC, useCallback, useEffect, useState } from 'react';
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
      order_type: OrderType.LIMIT,
      trigger_price: '',
      order_price: '',
      order_quantity: ''
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
    console.log('[errors]', errors);
    console.log('[formattedOrder]', formattedOrder);
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
      className="flex flex-1 flex-col gap-4 min-w-[16rem] max-w-[24rem]"
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
          if (event.target.value === 'BRACKET_MARKET') {
            setValue('order_type', OrderType.MARKET);
            setValue('algo_type', AlgoOrderRootType.BRACKET);
          } else if (event.target.value === 'BRACKET_LIMIT') {
            setValue('order_type', OrderType.LIMIT);
            setValue('algo_type', AlgoOrderRootType.BRACKET);
          } else {
            setValue('order_type', event.target.value);
            setValue('algo_type', undefined);
          }
        }}
      >
        <option value="MARKET">Market</option>
        <option value="LIMIT" selected>
          Limit
        </option>
        <option value="STOP_LIMIT">Stop Limit</option>
        <option value="BRACKET_MARKET">Bracket Market</option>
        <option value="BRACKET_LIMIT">Bracket Limit</option>
      </select>

      <label
        className={`flex flex-col max-h-fit overflow-hidden transition-duration-300 transition-property-[all] transition-ease-out ${match(
          formattedOrder.order_type
        )
          .with(OrderType.STOP_LIMIT, () => 'h-[6rem] my-0')
          .otherwise(() => 'h-0 my--2')}`}
      >
        <span className="font-bold font-size-4">Trigger Price ({quote})</span>
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

      <label
        className={`flex flex-col max-h-fit overflow-hidden transition-duration-300 transition-property-[all] transition-ease-out ${match(
          formattedOrder.order_type
        )
          .with(OrderType.MARKET, () => 'h-0 my--2')
          .otherwise(() => 'h-[6rem] my-0')}`}
      >
        <span className="font-bold font-size-4">Price ({quote})</span>
        <TokenInput
          className={`${hasError('order_price') ? 'border-[var(--color-red)]' : ''}`}
          decimals={quoteDecimals}
          placeholder="Price"
          name="order_price"
          hasError={!!hasError('order_price')}
          readonly={match(formattedOrder.order_type)
            .with(OrderType.MARKET, () => true)
            .otherwise(() => false)}
          onValueChange={(value) => {
            setValue('order_price', value.toString());
          }}
        />
        {renderFormError(hasError('order_price'))}
      </label>

      <label
        className={`flex flex-col max-h-fit overflow-hidden transition-duration-300 transition-property-[all] transition-ease-out ${match(
          formattedOrder.algo_type
        )
          .with(AlgoOrderRootType.BRACKET, () => 'h-[6rem] my-0')
          .otherwise(() => 'h-0 my--2')}`}
      >
        <span className="font-bold font-size-4">Take Profit Price ({quote})</span>
        <TokenInput
          className={`${hasError('tp_trigger_price') ? 'border-[var(--color-red)]' : ''}`}
          decimals={quoteDecimals}
          placeholder="Take Profit Price"
          name="tp_trigger_price"
          hasError={!!hasError('tp_trigger_price')}
          onValueChange={(value) => {
            setValue('tp_trigger_price', value.toString());
          }}
        />
        {renderFormError(hasError('tp_trigger_price'))}
      </label>

      <label
        className={`flex flex-col max-h-fit overflow-hidden transition-duration-300 transition-property-[all] transition-ease-out ${match(
          formattedOrder.algo_type
        )
          .with(AlgoOrderRootType.BRACKET, () => 'h-[6rem] my-0')
          .otherwise(() => 'h-0 my--2')}`}
      >
        <span className="font-bold font-size-4">Stop Loss Price ({quote})</span>
        <TokenInput
          className={`${hasError('sl_trigger_price') ? 'border-[var(--color-red)]' : ''}`}
          decimals={quoteDecimals}
          placeholder="Stop Loss Price"
          name="sl_trigger_price"
          hasError={!!hasError('sl_trigger_price')}
          onValueChange={(value) => {
            setValue('sl_trigger_price', value.toString());
          }}
        />
        {renderFormError(hasError('sl_trigger_price'))}
      </label>

      <label className="flex flex-col">
        <span className="font-bold font-size-4">Quantity ({base})</span>
        <TokenInput
          className={`${hasError('order_quantity') ? 'border-[var(--color-red)]' : ''}`}
          decimals={baseDecimals}
          placeholder="Quantity"
          name="order_quantity"
          hasError={!!hasError('order_quantity')}
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
        className={`relative py-2 font-size-4 bg-[var(--accent-9)] hover:bg-[var(--accent-10)] border-rd-1 border-0 ${account.address == null ? 'hidden' : ''}`}
      >
        {loading && <Spinner overlay={true} />} Create Order
      </button>
      {account.address == null && <ConnectWalletButton />}
    </form>
  );
};
