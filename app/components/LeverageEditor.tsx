import { Slider } from '@radix-ui/themes';
import { FC, useMemo, useState } from 'react';

interface LeverageEditorProps {
  onSave?: (value: { leverage: number }) => Promise<void>;
  maxLeverage?: number;
  leverageLevers: number[];
}

export const LeverageEditor: FC<LeverageEditorProps> = (props) => {
  const { maxLeverage, leverageLevers, onSave } = props;

  const [leverage, setLeverage] = useState(() => maxLeverage ?? 0);

  const leverageValue = useMemo(() => {
    const index = leverageLevers.findIndex((item) => item === leverage);

    return index;
  }, [leverage, leverageLevers]);

  return (
    <Slider
      min={0}
      max={leverageLevers.length - 1}
      value={[leverageValue]}
      onValueChange={(value) => {
        const _value = leverageLevers[value[0]];
        setLeverage(_value);
      }}
      onValueCommit={(value) => {
        const _value = leverageLevers[value[0]];
        onSave?.({ leverage: _value }).catch(() => {
          setLeverage(maxLeverage ?? 1);
        });
      }}
    />
  );
};
