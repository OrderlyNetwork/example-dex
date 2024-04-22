import { FieldError } from 'react-hook-form';

export const renderFormError = (error?: FieldError) => {
  return (
    <span
      className={`${error == null ? 'h-0' : 'h-[1.3rem]'} overflow-hidden color-[var(--color-light-red)] transition-duration-300 transition-property-[height] transition-ease-out`}
    >
      {error?.message ?? ''}
    </span>
  );
};
