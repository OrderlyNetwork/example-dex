import { useOrderEntry, useSymbolsInfo } from '@orderly.network/hooks';
import { API, OrderEntity, OrderSide, OrderType } from '@orderly.network/types';
import { Slider } from '@radix-ui/themes';
import { useNotifications } from '@web3-onboard/react';
import { FixedNumber } from 'ethers';
import { Dispatch, FC, SetStateAction, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { Spinner, TokenInput } from '.';

import { getDecimalsFromTick } from '~/utils';
import { renderFormError } from '~/utils/form';

type Inputs = {
  direction: OrderSide;
  type: OrderType;
  quantity: string | number;
};

export const ClosePosition: FC<{
  position: API.PositionExt;
  refresh: import('swr/_internal').KeyedMutator<API.PositionInfo>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}> = ({ position, refresh, setOpen }) => {
  const [loading, setLoading] = useState(false);

  const symbolsInfo = useSymbolsInfo();

  const { register, handleSubmit, control } = useForm<Inputs>({
    defaultValues: {
      direction: position.position_qty > 0 ? OrderSide.SELL : OrderSide.BUY,
      type: OrderType.MARKET,
      quantity: Math.abs(position.position_qty)
    }
  });
  const { onSubmit, helper } = useOrderEntry(
    {
      symbol: position.symbol,
      side: OrderSide.BUY,
      order_type: OrderType.MARKET
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
      eventCode: 'closePosition',
      type: 'pending',
      message: 'Closing position...'
    });
    try {
      await onSubmit(getInput(data, position.symbol));
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
      refresh();
      setOpen(false);
    }
  };

  const symbolInfo = symbolsInfo[position.symbol]();
  const [_, base] = position.symbol.split('_');
  const [baseDecimals] = getDecimalsFromTick(symbolInfo);

  return (
    <form className="flex flex-1 flex-col gap-6 w-full" onSubmit={handleSubmit(submitForm)}>
      <div>Partially or fully close your open position at mark price.</div>

      <input className="hidden" {...register('direction')} />
      <input className="hidden" {...register('type')} />

      <label className="flex flex-col">
        <span className="font-bold font-size-5">Quantity ({base})</span>
        <Controller
          name="quantity"
          control={control}
          rules={{
            validate: {
              custom: async (_, data) => {
                const errors = await getValidationErrors(data, position.symbol, helper.validator);
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
              {renderFormError(error)}
            </>
          )}
        />
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
    side: data.direction,
    order_type: data.type,
    order_quantity: String(data.quantity),
    reduce_only: true
  };
}
