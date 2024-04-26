import { useSymbolsInfo, useTPSLOrder } from '@orderly.network/hooks';
import { API } from '@orderly.network/types';
import { Slider } from '@radix-ui/themes';
import { useNotifications } from '@web3-onboard/react';
import { FixedNumber } from 'ethers';
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { Spinner, TokenInput } from '.';

import { getDecimalsFromTick, renderFormError, usdFormatter } from '~/utils';

type Inputs = {
  tp_trigger_price?: string;
  sl_trigger_price?: string;
  quantity?: string | number;
};

export const TpSlOrder: FC<{
  symbol: string;
  position: API.PositionExt;
  refresh: import('swr/_internal').KeyedMutator<API.PositionInfo>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}> = ({ symbol, position, refresh, setOpen }) => {
  const [loading, setLoading] = useState(false);

  const symbolsInfo = useSymbolsInfo();

  const { handleSubmit, control, watch } = useForm<Inputs>({
    defaultValues: {
      tp_trigger_price: undefined,
      sl_trigger_price: undefined,
      quantity: String(Math.abs(position.position_qty))
    }
  });
  const [algoOrder, { setValue, submit, errors }] = useTPSLOrder(position);
  const [_0, customNotification] = useNotifications();

  const tp_trigger_price = watch('tp_trigger_price');
  useEffect(() => {
    if (tp_trigger_price == null) return;
    setValue('tp_trigger_price', tp_trigger_price);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tp_trigger_price]);
  const sl_trigger_price = watch('sl_trigger_price');
  useEffect(() => {
    if (sl_trigger_price == null) return;
    setValue('sl_trigger_price', sl_trigger_price);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sl_trigger_price]);
  const quantity = watch('quantity');
  useEffect(() => {
    if (quantity == null) return;
    setValue('quantity', quantity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity]);

  if (symbolsInfo.isNil) {
    return <Spinner />;
  }

  const submitForm: SubmitHandler<Inputs> = async () => {
    setLoading(true);
    const { update } = customNotification({
      eventCode: 'createStopOrder',
      type: 'pending',
      message: 'Creating order...'
    });
    try {
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
      refresh();
      setOpen(false);
    }
  };

  // const estimatedPnl = positions.unrealizedPnL({
  //   qty: Number(watch('quantity') ?? 0),
  //   openPrice: position.average_open_price,
  //   markPrice: Number(watch('trigger_price') ?? 0)
  // });

  const symbolInfo = symbolsInfo[symbol]();
  const [_, base, quote] = symbol.split('_');
  const [baseDecimals, quoteDecimals] = getDecimalsFromTick(symbolInfo);

  return (
    <form className="flex flex-1 flex-col gap-3 w-full" onSubmit={handleSubmit(submitForm)}>
      <div>
        Create an algorithmic order to (partially) close a position when a specific mark price is
        reached.
      </div>

      <label className="flex flex-col">
        <span className="font-bold font-size-5">TP Trigger Price ({quote})</span>
        <Controller
          name="tp_trigger_price"
          control={control}
          render={({ field: { name, onBlur, onChange } }) => (
            <>
              <TokenInput
                className={`${errors?.tp_trigger_price != null ? 'border-[var(--color-red)]' : ''}`}
                decimals={quoteDecimals}
                placeholder="Price"
                name={name}
                onBlur={onBlur}
                onChange={onChange}
                hasError={errors?.tp_trigger_price != null}
              />
              {renderFormError(errors?.tp_trigger_price)}
            </>
          )}
        />
      </label>

      <div className="flex flex-1 justify-between gap-3 mt--3">
        <span className="font-bold color-[var(--gray-12)]">Est. PnL:</span>
        <span>
          {(algoOrder as any).tp_pnl != null
            ? `${usdFormatter.format((algoOrder as any).tp_pnl)} ${quote}`
            : '-'}
        </span>
      </div>

      <label className="flex flex-col">
        <span className="font-bold font-size-5">SL Trigger Price ({quote})</span>
        <Controller
          name="sl_trigger_price"
          control={control}
          render={({ field: { name, onBlur, onChange } }) => (
            <>
              <TokenInput
                className={`${errors?.sl_trigger_price != null ? 'border-[var(--color-red)]' : ''}`}
                decimals={quoteDecimals}
                placeholder="Price"
                name={name}
                onBlur={onBlur}
                onChange={onChange}
                hasError={errors?.sl_trigger_price != null}
              />
              {renderFormError(errors?.sl_trigger_price)}
            </>
          )}
        />
      </label>

      <div className="flex flex-1 justify-between gap-3 mt--3">
        <span className="font-bold color-[var(--gray-12)]">Est. PnL:</span>
        <span>
          {(algoOrder as any).sl_pnl != null
            ? `${usdFormatter.format((algoOrder as any).sl_pnl)} ${quote}`
            : '-'}
        </span>
      </div>

      <label className="flex flex-col">
        <span className="font-bold font-size-5">Quantity ({base})</span>
        <Controller
          name="quantity"
          control={control}
          render={({ field: { name, onBlur, onChange, value } }) => (
            <>
              <TokenInput
                className={`mb-2 ${errors?.quantity != null ? 'border-[var(--color-red)]' : ''}`}
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
                hasError={errors?.quantity != null}
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
              {renderFormError(errors?.quantity)}
            </>
          )}
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="relative py-2 font-size-5 bg-[var(--accent-9)] hover:bg-[var(--accent-10)] border-rd-1 border-0"
      >
        {loading && <Spinner overlay={true} />} Create TP & SL Order
      </button>
    </form>
  );
};
