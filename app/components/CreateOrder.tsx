import { useOrderEntry, useSymbolsInfo, useWithdraw } from '@orderly.network/hooks';
import { OrderEntity, OrderSide, OrderType } from '@orderly.network/types';
import { Separator } from '@radix-ui/themes';
import { useConnectWallet, useNotifications } from '@web3-onboard/react';
import { FC, useState } from 'react';
import { Controller, FieldError, SubmitHandler, useForm } from 'react-hook-form';
import { match } from 'ts-pattern';

import { ConnectWalletButton, Spinner, TokenInput } from '.';

import { getDecimalsFromTick, usdFormatter } from '~/utils';

type Inputs = {
  direction: 'Buy' | 'Sell';
  type: 'Market' | 'Limit' | 'StopLimit';
  triggerPrice?: string;
  price: string;
  quantity: string;
};

export const CreateOrder: FC<{
  symbol: string;
}> = ({ symbol }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, control, reset } = useForm<Inputs>({
    defaultValues: {
      direction: 'Buy',
      type: 'Market'
    }
  });
  const symbolsInfo = useSymbolsInfo();
  const [{ wallet }] = useConnectWallet();
  const { availableWithdraw } = useWithdraw();
  const { onSubmit, helper, maxQty, estLeverage, estLiqPrice } = useOrderEntry(
    {
      symbol,
      side: match(watch('direction', 'Buy'))
        .with('Buy', () => OrderSide.BUY)
        .with('Sell', () => OrderSide.SELL)
        .exhaustive(),
      order_type: match(watch('type', 'Market'))
        .with('Market', () => OrderType.MARKET)
        .with('Limit', () => OrderType.LIMIT)
        .with('StopLimit', () => OrderType.STOP_LIMIT)
        .exhaustive(),
      order_quantity: watch('quantity', undefined),
      order_price: watch('price', undefined)
    },
    { watchOrderbook: true }
  );
  const [_0, customNotification] = useNotifications();

  if (symbolsInfo.isNil) {
    return <Spinner />;
  }

  const submitForm: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    const { update } = customNotification({
      eventCode: 'createOrder',
      type: 'pending',
      message: 'Creating order...'
    });
    try {
      await onSubmit(getInput(data, symbol));
      update({
        eventCode: 'createOrderSuccess',
        type: 'success',
        message: 'Order successfully created!',
        autoDismiss: 5_000
      });
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
      reset();
    }
  };

  const symbolInfo = symbolsInfo[symbol]();
  const [_, base, quote] = symbol.split('_');
  const [baseDecimals, quoteDecimals] = getDecimalsFromTick(symbolInfo);

  const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: baseDecimals });

  const renderError = (error?: FieldError) => {
    return (
      <span
        className={`${error == null ? 'h-0' : 'h-[1.3rem]'} overflow-hidden color-[var(--color-light-red)] transition-duration-300 transition-property-[height] transition-ease-out`}
      >
        {error?.message ?? ''}
      </span>
    );
  };

  return (
    <form
      className="flex flex-1 flex-col gap-6 min-w-[16rem] max-w-[24rem]"
      onSubmit={handleSubmit(submitForm)}
    >
      <div className="flex flex-1">
        <label
          className={`flex flex-items-center flex-justify-center py-1 bg-[var(--color-bg-green)] hover:bg-[var(--color-bg-green-hover)] font-bold border-rd-l-1 border-rd-r-0 w-[50%] ${watch('direction') === 'Buy' ? 'border-solid border-3 border-[var(--color-light-green)]' : ''}`}
        >
          <input type="radio" className="hidden" {...register('direction')} value="Buy" />
          Long
        </label>
        <label
          className={`flex flex-items-center flex-justify-center py-1 bg-[var(--color-bg-red)] hover:bg-[var(--color-bg-red-hover)] font-bold border-rd-r-1 border-rd-l-0 w-[50%] ${watch('direction') === 'Sell' ? 'border-solid border-3 border-[var(--color-light-red)]' : ''}`}
        >
          <input type="radio" className="hidden" {...register('direction')} value="Sell" />
          Short
        </label>
      </div>

      <div className="flex flex-1 justify-between gap-3">
        <span className="font-bold color-[var(--gray-12)]">Available:</span>
        <span>
          {usdFormatter.format(availableWithdraw)} {quote}
        </span>
      </div>

      <select {...register('type')} className="flex flex-1 py-2 text-center font-bold">
        <option value="Market">Market</option>
        <option value="Limit">Limit</option>
        <option value="StopLimit">Stop Limit</option>
      </select>

      <label
        className={`flex-col ${match(watch('type', 'Market'))
          .with('StopLimit', () => 'flex')
          .otherwise(() => 'hidden')}`}
      >
        <span className="font-bold font-size-5">Trigger Price ({quote})</span>
        <Controller
          name="triggerPrice"
          control={control}
          rules={{
            validate: {
              custom: async (_, data) => {
                const errors = await getValidationErrors(data, symbol, helper.validator);
                return errors?.trigger_price != null ? errors.trigger_price.message : true;
              }
            }
          }}
          render={({ field: { name, onBlur, onChange }, fieldState: { error } }) => (
            <>
              <TokenInput
                className={`${error != null ? 'border-[var(--color-red)]' : ''}`}
                decimals={quoteDecimals}
                placeholder="Price"
                name={name}
                onBlur={onBlur}
                onChange={onChange}
                hasError={error != null}
              />
              {renderError(error)}
            </>
          )}
        />
      </label>

      <label className="flex flex-col">
        <span className="font-bold font-size-5">Price ({quote})</span>
        <Controller
          name="price"
          control={control}
          rules={{
            validate: {
              custom: async (_, data) => {
                const errors = await getValidationErrors(data, symbol, helper.validator);
                return errors?.order_price != null ? errors.order_price.message : true;
              }
            }
          }}
          render={({ field: { name, onBlur, onChange }, fieldState: { error } }) => (
            <>
              <TokenInput
                className={`${error != null ? 'border-[var(--color-red)]' : ''}`}
                decimals={quoteDecimals}
                placeholder="Price"
                name={name}
                onBlur={onBlur}
                onChange={onChange}
                hasError={error != null}
              />
              {renderError(error)}
            </>
          )}
        />
      </label>

      <label className="flex flex-col">
        <span className="font-bold font-size-5">Quantity ({base})</span>
        <Controller
          name="quantity"
          control={control}
          rules={{
            validate: {
              custom: async (_, data) => {
                const errors = await getValidationErrors(data, symbol, helper.validator);
                return errors?.order_quantity != null ? errors.order_quantity.message : true;
              }
            }
          }}
          render={({ field: { name, onBlur, onChange }, fieldState: { error } }) => (
            <>
              <TokenInput
                className={`${error != null ? 'border-[var(--color-red)]' : ''}`}
                decimals={baseDecimals}
                placeholder="Quantity"
                name={name}
                onBlur={onBlur}
                onChange={onChange}
                hasError={error != null}
              />
              {renderError(error)}
              <div className="flex flex-1 justify-between gap-3">
                <span className="font-bold color-[var(--gray-12)]">Max:</span>
                <span>
                  {formatter.format(maxQty)} {base}
                </span>
              </div>
            </>
          )}
        />
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
        className={`relative py-2 font-size-5 bg-[var(--accent-9)] hover:bg-[var(--accent-10)] border-rd-1 border-0 ${wallet == null ? 'hidden' : ''}`}
      >
        {loading && <Spinner overlay={true} />} Create Order
      </button>
      {wallet == null && <ConnectWalletButton />}
    </form>
  );
};

async function getValidationErrors(
  data: Inputs,
  symbol: string,
  validator: ReturnType<typeof useOrderEntry>['helper']['validator']
): Promise<ReturnType<ReturnType<typeof useOrderEntry>['helper']['validator']>> {
  return validator(getInput(data, symbol));
}

function getInput(data: Inputs, symbol: string): OrderEntity {
  return {
    symbol,
    side: match(data.direction)
      .with('Buy', () => OrderSide.BUY)
      .with('Sell', () => OrderSide.SELL)
      .exhaustive(),
    order_type: match(data.type)
      .with('Market', () => OrderType.MARKET)
      .with('Limit', () => OrderType.LIMIT)
      .with('StopLimit', () => OrderType.STOP_LIMIT)
      .exhaustive(),
    order_price: data.price,
    order_quantity: data.quantity,
    trigger_price: data.triggerPrice
  };
}
