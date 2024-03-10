import { FunctionComponent } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { TokenInput } from '.';

type Inputs = {
  direction: 'Buy' | 'Sell';
  type: 'Market' | 'Limit';
  price: string;
  quantity: string;
};

export const CreateOrder: FunctionComponent = () => {
  const { register, handleSubmit, watch, control } = useForm<Inputs>({
    defaultValues: {
      direction: 'Buy',
      type: 'Market'
    }
  });
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

  return (
    <form
      className="flex flex-col gap-6 min-w-[16rem] max-w-[24rem]"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-1">
        <label
          className={`flex flex-items-center flex-justify-center py-1 bg-[var(--color-bg-green)] hover:bg-[var(--color-bg-green-hover)] font-bold border-rd-l-1 border-rd-r-0 w-[50%] ${watch('direction') === 'Buy' ? 'border-solid border-3 border-[var(--color-border-green)]' : ''}`}
        >
          <input type="radio" className="hidden" {...register('direction')} value="Buy" />
          Buy
        </label>
        <label
          className={`flex flex-items-center flex-justify-center py-1 bg-[var(--color-bg-red)] hover:bg-[var(--color-bg-red-hover)] font-bold border-rd-r-1 border-rd-l-0 w-[50%] ${watch('direction') === 'Sell' ? 'border-solid border-3 border-[var(--color-border-red)]' : ''}`}
        >
          <input type="radio" className="hidden" {...register('direction')} value="Sell" />
          Sell
        </label>
      </div>

      <select {...register('type')} className="flex flex-1 py-2 text-center font-bold">
        <option value="Market">Market</option>
        <option value="Limit">Limit</option>
      </select>

      <Controller
        name="price"
        control={control}
        render={({ field }) => <TokenInput decimals={6} placeholder="Price" {...field} />}
      />
      <Controller
        name="quantity"
        control={control}
        render={({ field }) => <TokenInput decimals={6} placeholder="Quantity" {...field} />}
      />

      <button
        type="submit"
        className="py-2 font-size-5 bg-[var(--accent-9)] hover:bg-[var(--accent-10)] border-rd-1 border-0"
      >
        Create Order
      </button>
    </form>
  );
};
