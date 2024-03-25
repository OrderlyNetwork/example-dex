import { useOrderEntry, usePrivateQuery } from '@orderly.network/hooks';
import { API, OrderSide, OrderType } from '@orderly.network/types';
import { FunctionComponent, useState } from 'react';
import { Controller, FieldError, SubmitHandler, useForm } from 'react-hook-form';

import { Spinner, TokenInput } from '.';

type Inputs = {
  direction: 'Buy' | 'Sell';
  type: 'Market' | 'Limit';
  price: string;
  quantity: string;
};

export const CreateOrder: FunctionComponent<{
  symbol: API.Symbol;
}> = ({ symbol }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, control, getValues } = useForm<Inputs>({
    defaultValues: {
      direction: 'Buy',
      type: 'Market'
    }
  });
  const { data: orderbook } = usePrivateQuery<{
    asks?: { price: number }[];
    bids?: { price: number }[];
  }>(`/v1/orderbook/${symbol.symbol}?max_level=1`);
  const lowestAsk = orderbook?.asks?.[0].price;
  const highestBid = orderbook?.bids?.[orderbook.bids.length - 1].price;
  const minPrice = highestBid ? highestBid * (1 - symbol.price_range) : undefined;
  const maxPrice = lowestAsk ? lowestAsk * (1 + symbol.price_range) : undefined;
  const { onSubmit, freeCollateral, helper } = useOrderEntry(
    {
      symbol: symbol.symbol,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      side: 'BUY' as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      order_type: 'MARKET' as any
    },
    { watchOrderbook: true }
  );

  const submitForm: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    try {
      console.log('data', data);
      console.log('symbol', symbol);
      console.log('ORDER', {
        symbol: symbol.symbol,
        side: data.direction === 'Buy' ? OrderSide.BUY : OrderSide.SELL,
        order_type: data.type === 'Market' ? OrderType.MARKET : OrderType.LIMIT,
        order_price: data.price,
        order_quantity: data.quantity
      });

      const res = helper.validator({
        symbol: symbol.symbol,
        side: data.direction === 'Buy' ? OrderSide.BUY : OrderSide.SELL,
        order_type: data.type === 'Market' ? OrderType.MARKET : OrderType.LIMIT,
        order_price: data.price,
        order_quantity: data.quantity
      });
      console.log('res', res);
      await onSubmit({
        symbol: symbol.symbol,
        side: data.direction === 'Buy' ? OrderSide.BUY : OrderSide.SELL,
        order_type: data.type === 'Market' ? OrderType.MARKET : OrderType.LIMIT,
        order_price: data.price,
        order_quantity: data.quantity
      });
    } finally {
      setLoading(false);
    }
  };

  const [_, base, quote] = symbol.symbol.split('_');
  const [baseDecimals, quoteDecimals] = getDecimalsFromTick(symbol);
  const priceRequired = getValues('type') === 'Limit';

  const renderError = (error: FieldError) => {
    let content;
    switch (error.type) {
      case 'required':
        content = 'This field is required';
        break;
      case 'minBase':
        content = `The minimum base token (${base}) amount is ${symbol.base_min}`;
        break;
      case 'minQuote':
        content = `The minimum quote token (${quote}) amount is ${symbol.min_notional}`;
        break;
      case 'minPrice':
        content = `The minimum price is ${minPrice}`;
        break;
      case 'maxPrice':
        content = `The maximum price is ${maxPrice}`;
        break;
      default:
        console.error('Unhandled form error:', error);
        content = '';
    }
    return <span className="h-2 color-[var(--color-light-red)]">{content}</span>;
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
          Buy
        </label>
        <label
          className={`flex flex-items-center flex-justify-center py-1 bg-[var(--color-bg-red)] hover:bg-[var(--color-bg-red-hover)] font-bold border-rd-r-1 border-rd-l-0 w-[50%] ${watch('direction') === 'Sell' ? 'border-solid border-3 border-[var(--color-light-red)]' : ''}`}
        >
          <input type="radio" className="hidden" {...register('direction')} value="Sell" />
          Sell
        </label>
      </div>

      <select {...register('type')} className="flex flex-1 py-2 text-center font-bold">
        <option value="Market">Market</option>
        <option value="Limit">Limit</option>
      </select>

      <label className="flex flex-col">
        <span className="font-bold font-size-5">Price ({quote})</span>
        <Controller
          name="price"
          control={control}
          rules={{
            required: priceRequired,
            validate: {
              minPrice: (value) => {
                if (minPrice == null || !priceRequired) return true;
                return Number(value) >= minPrice;
              },
              maxPrice: (value) => {
                if (maxPrice == null || !priceRequired) return true;
                return Number(value) <= maxPrice;
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
            required: true,
            validate: {
              minBase: (value) => {
                return Number(value) >= symbol.base_min;
              },
              minQuote: (value) => {
                if (Number(getValues('price') ?? '0') === 0) return true;
                return Number(value) * Number(getValues('price')) >= symbol.min_notional;
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
        {loading && <Spinner overlay={true} />} Create Order
      </button>
    </form>
  );
};

function getDecimalsFromTick(symbol: API.Symbol): [number, number] {
  let baseDecimals: number = 0;
  if (symbol.base_tick < 1) {
    baseDecimals = (symbol.base_tick + '').split('.')[1].length;
  }
  let quoteDecimals: number = 0;
  if (symbol.quote_tick < 1) {
    quoteDecimals = (symbol.quote_tick + '').split('.')[1].length;
  }
  return [baseDecimals, quoteDecimals];
}
