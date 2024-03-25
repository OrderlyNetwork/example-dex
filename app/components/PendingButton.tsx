import { Button } from '@radix-ui/themes';
import { FunctionComponent, MouseEventHandler, PropsWithChildren, useState } from 'react';

import { Spinner } from '.';

export const PendingButton: FunctionComponent<
  PropsWithChildren<{
    onClick: MouseEventHandler<HTMLButtonElement>;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
  }>
> = ({ onClick, className, type, disabled, children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      className={`relative ${className ?? ''}`}
      type={type}
      disabled={disabled || loading}
      onClick={async (event) => {
        setLoading(true);
        try {
          await onClick(event);
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading && <Spinner overlay={true} />} {children}
    </Button>
  );
};
