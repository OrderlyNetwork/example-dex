import { useOrderEntry, useSymbolsInfo } from '@orderly.network/hooks';
import { API, OrderEntity, OrderSide, OrderType } from '@orderly.network/types';
import { Slider } from '@radix-ui/themes';
import { useNotifications } from '@web3-onboard/react';
import { FixedNumber } from 'ethers';
import { Dispatch, FC, SetStateAction, useState } from 'react';
import { Controller, FieldError, SubmitHandler, useForm } from 'react-hook-form';
import { P, match } from 'ts-pattern';

import { Spinner, TokenInput } from '.';

import { getDecimalsFromTick } from '~/utils';

type Inputs = {
  direction: 'TakeProfit' | 'StopLoss';
  type: OrderType;
  trigger_price?: string;
  quantity?: string | number;
};

export const StopOrder: FC<{
  symbol: string;
  position: API.PositionExt;
  refresh: import('swr/_internal').KeyedMutator<API.PositionInfo>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}> = ({ symbol, position, refresh, setOpen }) => {
  const [loading, setLoading] = useState(false);

  const symbolsInfo = useSymbolsInfo();

  const { register, handleSubmit, control, watch } = useForm<Inputs>({
    defaultValues: {
      direction: 'TakeProfit',
      type: OrderType.STOP_MARKET,
      trigger_price: String(position.average_open_price),
      quantity: String(Math.abs(position.position_qty))
    }
  });
  const { onSubmit, helper } = useOrderEntry(
    {
      symbol,
      side: OrderSide.BUY,
      order_type: OrderType.STOP_MARKET
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
      eventCode: 'createStopOrder',
      type: 'pending',
      message: 'Creating order...'
    });
    try {
      await onSubmit(getInput(data, position));
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
      refresh();
      setOpen(false);
    }
  };

  const symbolInfo = symbolsInfo[symbol]();
  const [_, base, quote] = symbol.split('_');
  const [baseDecimals, quoteDecimals] = getDecimalsFromTick(symbolInfo);

  const renderError = (error: FieldError) => {
    return <span className="h-2 color-[var(--color-light-red)]">{error.message}</span>;
  };

  return (
    <form className="flex flex-1 flex-col gap-6 w-full" onSubmit={handleSubmit(submitForm)}>
      <div className="flex flex-1">
        <label
          className={`flex flex-items-center flex-justify-center py-1 bg-[var(--color-bg-green)] hover:bg-[var(--color-bg-green-hover)] font-bold border-rd-l-1 border-rd-r-0 w-[50%] ${watch('direction') === 'TakeProfit' ? 'border-solid border-3 border-[var(--color-light-green)]' : ''}`}
        >
          <input type="radio" className="hidden" {...register('direction')} value="TakeProfit" />
          Take Profit
        </label>
        <label
          className={`flex flex-items-center flex-justify-center py-1 bg-[var(--color-bg-red)] hover:bg-[var(--color-bg-red-hover)] font-bold border-rd-r-1 border-rd-l-0 w-[50%] ${watch('direction') === 'StopLoss' ? 'border-solid border-3 border-[var(--color-light-red)]' : ''}`}
        >
          <input type="radio" className="hidden" {...register('direction')} value="StopLoss" />
          Stop Loss
        </label>
      </div>

      <input className="hidden" {...register('type')} />

      <label className="flex flex-col">
        <span className="font-bold font-size-5">Price ({quote})</span>
        <Controller
          name="trigger_price"
          control={control}
          rules={{
            validate: {
              min: (_, data) => {
                const isLong = position.position_qty > 0;
                if (data.trigger_price == null) return true;
                const triggerPrice = Number(data.trigger_price);
                return match([isLong, data.direction])
                  .with(P.union([true, 'TakeProfit'], [false, 'StopLoss']), () =>
                    triggerPrice > position.mark_price
                      ? true
                      : 'Minimum trigger price should be greater than mark price'
                  )
                  .otherwise(() => true);
              },
              max: (_, data) => {
                const isLong = position.position_qty > 0;
                if (data.trigger_price == null) return true;
                const triggerPrice = Number(data.trigger_price);
                return match([isLong, data.direction])
                  .with(P.union([false, 'TakeProfit'], [true, 'StopLoss']), () =>
                    triggerPrice < position.mark_price
                      ? true
                      : 'Maximum trigger price should be less than mark price'
                  )
                  .otherwise(() => true);
              },
              custom: async (_, data) => {
                const errors = await getValidationErrors(data, position, helper.validator);
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
              {error && renderError(error)}
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
                const errors = await getValidationErrors(data, position, helper.validator);
                return errors?.order_quantity != null ? errors.order_quantity.message : true;
              }
            }
          }}
          render={({ field: { name, onBlur, onChange, value }, fieldState: { error } }) => (
            <>
              <TokenInput
                className={`mb-2 ${error != null ? 'border-[var(--color-red)]' : ''}`}
                decimals={baseDecimals}
                placeholder="Quantity"
                name={name}
                onBlur={onBlur}
                onChange={onChange}
                value={value}
                onValueChange={(newVal) => {
                  value = newVal.toString();
                }}
                min={FixedNumber.fromString('0')}
                max={FixedNumber.fromString(String(Math.abs(position.position_qty)))}
                hasError={error != null}
              />
              <Slider
                value={[Number(value)]}
                defaultValue={[100]}
                variant="surface"
                name={name}
                onValueChange={(value) => {
                  onChange(value[0]);
                }}
                onValueCommit={onBlur}
                min={0}
                max={Math.abs(position.position_qty)}
                step={symbolInfo.base_tick}
              />
              <div className="font-size-[1.1rem] flex w-full justify-center my-1">
                {value} {base}
              </div>
              {error && renderError(error)}
            </>
          )}
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="relative py-2 font-size-5 bg-[var(--accent-9)] hover:bg-[var(--accent-10)] border-rd-1 border-0"
      >
        {loading && <Spinner overlay={true} />}{' '}
        {match(watch('direction'))
          .with('TakeProfit', () => 'Take Profit')
          .with('StopLoss', () => 'Stop Loss')
          .exhaustive()}
      </button>
    </form>
  );
};

async function getValidationErrors(
  data: Inputs,
  position: API.PositionExt,
  validator: ReturnType<typeof useOrderEntry>['helper']['validator']
): Promise<ReturnType<ReturnType<typeof useOrderEntry>['helper']['validator']>> {
  return validator(getInput(data, position));
}

function getInput(data: Inputs, position: API.PositionExt): OrderEntity {
  const isLong = position.position_qty > 0;
  return {
    symbol: position.symbol,
    isStopOrder: true,
    order_quantity: data.quantity,
    trigger_price: data.trigger_price,
    side: match(isLong)
      .with(true, () => OrderSide.SELL)
      .with(false, () => OrderSide.BUY)
      .exhaustive(),
    order_type: OrderType.STOP_MARKET
  };
}
