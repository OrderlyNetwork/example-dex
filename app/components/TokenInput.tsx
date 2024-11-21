import { FixedNumber } from 'ethers';
import { FC, useEffect, useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';

import { filterAllowedCharacters, getFormattedNumber, getNumberAsUInt128 } from '~/utils';

export const TokenInput: FC<
  {
    decimals: number;
    id?: string;
    readonly?: boolean;
    placeholder?: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    afterInputChange?: Function;
    value?: string | number;
    onValueChange?: (value: FixedNumber) => void | Promise<void>;
    min?: FixedNumber;
    max?: FixedNumber;
    className?: string;
    hasError?: boolean;
  } & Partial<ControllerRenderProps>
> = ({
  id,
  readonly,
  placeholder,
  decimals,
  afterInputChange,
  value: outerValue,
  onValueChange,
  min,
  max,
  className,
  hasError,
  ...props
}) => {
  const [value, setValue] = useState(outerValue ? String(outerValue) : '');

  useEffect(() => {
    if (outerValue == null) return;
    let newValue = filterAllowedCharacters(String(outerValue));
    const quantity = getFormattedNumber(newValue, decimals);
    if (getFormattedNumber(value, decimals) !== quantity) {
      const [res] = getNumberAsUInt128(quantity, decimals);
      let fixedNumber = FixedNumber.fromValue(res, decimals).toFormat(decimals);
      if (min && fixedNumber.lt(min)) {
        fixedNumber = min;
        newValue = fixedNumber.toString();
      }
      if (max && fixedNumber.gt(max)) {
        fixedNumber = max;
        newValue = fixedNumber.toString();
      }
      setValue(newValue);
    }
  }, [decimals, max, min, outerValue, value]);

  const onInputChange = () => {
    if (afterInputChange) {
      afterInputChange();
    }
  };

  return (
    <input
      className={`${readonly ? 'cursor-default' : ''} ${className ?? ''} ${hasError ? 'error hover:border-[var(--color-light-red)]' : ''} line-height-10 font-size-5`}
      type="string"
      id={id}
      value={value}
      name={props.name}
      readOnly={readonly ?? false}
      placeholder={placeholder ?? '0.0'}
      onInput={onInputChange}
      onChange={(event) => {
        let newValue = filterAllowedCharacters(event.target.value);
        if (value !== newValue) {
          const quantity = getFormattedNumber(newValue, decimals);
          const [res] = getNumberAsUInt128(quantity, decimals);
          let fixedNumber = FixedNumber.fromValue(res, decimals).toFormat(decimals);
          if (min && fixedNumber.lt(min)) {
            fixedNumber = min;
            newValue = fixedNumber.toString();
          }
          if (max && fixedNumber.gt(max)) {
            fixedNumber = max;
            newValue = fixedNumber.toString();
          }
          if (onValueChange) {
            onValueChange(fixedNumber);
          }
          event.target.value = newValue;
          setValue(newValue);
        }
        if (props.onChange) props.onChange(event);
      }}
      onBlur={(event) => {
        const quantity = getFormattedNumber(event.target.value, decimals);
        setValue(quantity);
        if (props.onBlur) props.onBlur();
      }}
      autoComplete="off"
    />
  );
};
