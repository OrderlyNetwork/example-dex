import { TradingviewWidget } from '@orderly.network/ui-tradingview';
import { FC } from 'react';

import '@orderly.network/ui/dist/styles.css';

export const AdvancedChart: FC<{ symbol: string }> = ({ symbol }) => {
  return (
    <div className="w-full h-0 min-h-[35rem] [&_iframe]:min-h-[30rem]">
      <TradingviewWidget
        symbol={symbol}
        libraryPath={`${import.meta.env.VITE_BASE ? `${import.meta.env.VITE_BASE}/` : ''}tradingview/charting_library/bundles`}
        scriptSRC={`${import.meta.env.VITE_BASE ? `${import.meta.env.VITE_BASE}/` : ''}tradingview/charting_library/charting_library.js`}
        customCssUrl={`${import.meta.env.VITE_BASE ? `${import.meta.env.VITE_BASE}/` : ''}tradingview/chart.css`}
        overrides={{
          'mainSeriesProperties.candleStyle.borderDownColor': '#DC2140',
          'mainSeriesProperties.candleStyle.borderUpColor': '#1F8040',

          'mainSeriesProperties.candleStyle.downColor': '#DC2140',
          'mainSeriesProperties.candleStyle.upColor': '#1F8040',

          'mainSeriesProperties.candleStyle.wickDownColor': '#DC2140',
          'mainSeriesProperties.candleStyle.wickUpColor': '#1F8040',

          'paneProperties.background': '#101418',
          'paneProperties.backgroundType': 'solid',
          'paneProperties.separatorColor': '#164165',

          'paneProperties.horzGridProperties.color': '#161B22',
          'paneProperties.vertGridProperties.color': '#161B22',
          'paneProperties.legendProperties.showSeriesTitle': 'false'
        }}
      />
    </div>
  );
};
