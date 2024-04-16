import { useConfig } from '@orderly.network/hooks';
import { API } from '@orderly.network/types';
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type SeriesDataItemTypeMap,
  type Time,
  type UTCTimestamp
} from 'lightweight-charts';
import { FC, useEffect, useRef, useState } from 'react';
import useResizeObserver from 'use-resize-observer';

type Klines = {
  a: number[];
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  t: number[];
  v: number[];
};
type Kline = {
  a: number;
  c: number;
  h: number;
  l: number;
  o: number;
  t: number;
  v: number;
};

export const LightweightChart: FC<{ symbol: API.Symbol }> = ({ symbol }) => {
  const [chartData, setChartData] = useState<[IChartApi, ISeriesApi<'Candlestick'>]>();
  const chartRef = useRef<HTMLDivElement>(null);
  const { width } = useResizeObserver<HTMLDivElement>({
    ref: chartRef
  });

  const apiBaseUrl = useConfig('apiBaseUrl');

  useEffect(() => {
    if (!chartData) return;
    const [_, candleStickSeries] = chartData;
    const resolution = '60';
    const from = Math.trunc((Date.now() - 1_000 * 60 * 60 * 24 * 7) / 1_000);
    const to = Math.trunc(Date.now() / 1_000);
    fetch(
      `${apiBaseUrl}/tv/history?symbol=${symbol.symbol}&resolution=${resolution}&from=${from}&to=${to}`
    )
      .then((res) => res.json() as Promise<Klines>)
      .then((klines) => {
        const candleStickData: SeriesDataItemTypeMap['Candlestick'][] = [];
        for (let i = 0; i < klines.a.length; i++) {
          const kline = {
            a: klines.a[i],
            c: klines.c[i],
            h: klines.h[i],
            l: klines.l[i],
            o: klines.o[i],
            t: klines.t[i],
            v: klines.v[i]
          };
          candleStickData.push(klineToCandlestick(kline));
        }
        candleStickSeries.setData(candleStickData);
      });
  }, [chartData, apiBaseUrl, symbol]);

  // useEffect(() => {
  //   if (!symbol) {
  //     return;
  //   }
  //   const service = new WebsocketService(ws);
  //   service.subscribeSymbol(symbol);
  //   return () => {
  //     service.unsubscribeKline(symbol);
  //   };
  // }, [symbol, ws]);

  useEffect(() => {
    if (chartRef.current == null || width == null) return;
    if (!chartData) {
      const chart = createChart(chartRef.current, {
        width,
        height: chartRef.current.clientHeight,
        layout: {
          background: {
            color: '#26272a'
          },
          textColor: '#fff',
          fontSize: 15
        },
        timeScale: {
          timeVisible: true
        },
        localization: {
          locale: navigator.language,
          timeFormatter: (time: Time) => new Date((time as number) * 1_000).toLocaleString()
        }
      });
      const candleStickSeries = chart.addCandlestickSeries();
      setChartData([chart, candleStickSeries]);
    } else {
      const [chart] = chartData;
      chart.applyOptions({
        width
      });
    }
  }, [chartData, chartRef, width]);

  return <div className="w-full min-h-[35rem]" ref={chartRef} />;
};

function klineToCandlestick(kline: Kline): SeriesDataItemTypeMap['Candlestick'] {
  return {
    time: kline.t as UTCTimestamp,
    open: kline.o,
    high: kline.h,
    low: kline.l,
    close: kline.c
  } satisfies SeriesDataItemTypeMap['Candlestick'];
}
