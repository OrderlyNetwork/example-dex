import { Button } from '@radix-ui/themes';
import { FunctionComponent, MouseEventHandler, PropsWithChildren, useState } from 'react';

import { Spinner } from '.';

export const PendingButton: FunctionComponent<
  PropsWithChildren<{
    onClick: MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
  }>
> = ({ onClick, disabled, children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      className="relative"
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
