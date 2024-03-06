import { FunctionComponent } from 'react';

export const Spinner: FunctionComponent<{ overlay?: boolean }> = ({ overlay }) => {
  return (
    <div
      className={`flex flex-items-center ${overlay ? 'absolute p-1 h-full' : 'w-full'} max-h-full`}
    >
      <div
        className={`${overlay ? 'w-full h-full' : 'w-5 h-5'} max-w-full max-h-full b-rd-36 aspect-square b-dotted b-4 b-transparent b-t-white b-r-white`}
        style={{
          animation: 'rotate 1200ms linear infinite'
        }}
      />
    </div>
  );
};