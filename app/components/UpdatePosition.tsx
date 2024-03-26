import { useOrderEntry } from '@orderly.network/hooks';
import { API, OrderEntity, OrderSide, OrderType } from '@orderly.network/types';
import { Cross1Icon } from '@radix-ui/react-icons';
import { Button, Dialog, Separator, Slider } from '@radix-ui/themes';
import { FixedNumber } from 'ethers';
import { FunctionComponent, useState } from 'react';
import { Controller, FieldError, SubmitHandler, useForm } from 'react-hook-form';

import { Spinner, TokenInput } from '.';

import { getDecimalsFromTick } from '~/helpers/api';

type Inputs = {
  direction: OrderSide;
  type: OrderType;
  price?: string;
  quantity?: string | number;
};

export const UpdatePosition: FunctionComponent<{
  symbol: API.Symbol;
  position: API.PositionExt;
  refresh: import('swr/_internal').KeyedMutator<API.PositionInfo>;
}> = ({ symbol, position, refresh }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, control, reset } = useForm<Inputs>({
    defaultValues: {
      direction: position.position_qty > 0 ? OrderSide.SELL : OrderSide.BUY,
      type: OrderType.MARKET
    }
  });
  const { onSubmit, helper } = useOrderEntry(
    {
      symbol: symbol.symbol,
      side: OrderSide.BUY,
      order_type: OrderType.MARKET
    },
    { watchOrderbook: true }
  );

  const submitForm: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    try {
      await onSubmit(getInput(data, symbol.symbol));
    } catch (err) {
      console.error(`Unhandled error in "submitForm":`, err);
    } finally {
      setLoading(false);
      refresh();
      setOpen(false);
    }
  };

  const [_, base, quote] = symbol.symbol.split('_');
  const [baseDecimals, quoteDecimals] = getDecimalsFromTick(symbol);

  const baseFormatter = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 20 });
  const usdFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

  const renderPositionValue = (header: string, value: string) => (
    <div className="flex flex-col gap-1">
      <div className="font-bold font-size-[1.1rem]">{header}</div>
      <div>{value}</div>
    </div>
  );

  const renderError = (error: FieldError) => {
    return <span className="h-2 color-[var(--color-light-red)]">{error.message}</span>;
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(change) => {
        reset();
        setOpen(change);
      }}
    >
      <Dialog.Trigger>
        <Button>Update</Button>
      </Dialog.Trigger>
      <Dialog.Content
        className="max-w-md"
        size="2"
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
      >
        <Dialog.Title className="flex justify-between flex-items-center">
          <span className="mr-2">Update Position</span>
          <Button
            variant="ghost"
            color="crimson"
            onClick={() => {
              setOpen(false);
            }}
          >
            <Cross1Icon />
          </Button>
        </Dialog.Title>

        <div className="flex w-full flex-wrap gap-4 pt-4 [&>*]:flex-1 [&>*]-min-w-[10rem]">
          {renderPositionValue('Symbol', symbol.symbol)}
          {renderPositionValue('Quantity', baseFormatter.format(position.position_qty))}
          {renderPositionValue('Avg. Open', usdFormatter.format(position.average_open_price))}
          {renderPositionValue('Mark Price', usdFormatter.format(position.mark_price))}
          {renderPositionValue('Unreal. PnL', usdFormatter.format(position.unrealized_pnl))}
          {renderPositionValue(
            'Est.Liq Price',
            position.est_liq_price ? usdFormatter.format(position.est_liq_price) : '-'
          )}
        </div>
        <Separator className="min-w-full my-4" />
        <form className="flex flex-1 flex-col gap-6 w-full" onSubmit={handleSubmit(submitForm)}>
          <input className="hidden" {...register('direction')} />
          <input className="hidden" {...register('type')} />

          <label className="flex flex-col">
            <span className="font-bold font-size-5">Price ({quote})</span>
            <Controller
              name="price"
              control={control}
              rules={{
                validate: {
                  custom: async (_, data) => {
                    const errors = await getValidationErrors(data, symbol.symbol, helper.validator);
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
                    const errors = await getValidationErrors(data, symbol.symbol, helper.validator);
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
                    max={FixedNumber.fromString(String(position.position_qty))}
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
                    max={position.position_qty}
                    step={symbol.base_tick}
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
            {loading && <Spinner overlay={true} />} Close Position
          </button>
        </form>
      </Dialog.Content>
    </Dialog.Root>
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
    order_price: data.price,
    order_quantity: String(data.quantity),
    reduce_only: true
  };
}
