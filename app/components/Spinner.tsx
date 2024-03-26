import { FunctionComponent } from 'react';

export const Spinner: FunctionComponent<{
  size?: string;
  overlay?: boolean;
  className?: string;
}> = ({ size, overlay, className }) => {
  return (
    <div
      className={`flex flex-items-center flex-justify-center w-full ${overlay ? 'absolute p-1 h-full top-0' : ''} max-h-full ${className ?? ''}`}
    >
      <div
        className={`${overlay ? 'h-full' : 'w-5 h-5'} aspect-square max-w-full max-h-full b-rd-36 aspect-square b-dotted b-4 b-transparent b-t-white b-r-white`}
        style={{
          width: size ?? undefined,
          height: size ?? undefined,
          animation: 'rotate 1200ms linear infinite'
        }}
      />
    </div>
  );
};
