/* eslint-disable @typescript-eslint/no-explicit-any */
import { WS } from '@orderly.network/net';

const getKlineKey = (symbol: string, type: string) => `${symbol}kline_${type}`;

const getSymbolTopics = (symbol: string) => {
  const symbolTopics = ['trade'];
  return symbolTopics.map((topic) => `${symbol}@${topic}`);
};

export enum KlineResolution {
  RESOLUTION_1m = '1',
  RESOLUTION_3m = '3',
  RESOLUTION_5m = '5',
  RESOLUTION_15m = '15',
  RESOLUTION_30m = '30',
  RESOLUTION_60m = '60',
  RESOLUTION_120m = '120',
  RESOLUTION_240m = '240',
  RESOLUTION_480m = '480',
  RESOLUTION_720m = '720',
  RESOLUTION_D = 'D',
  RESOLUTION_1D = '1D',
  RESOLUTION_3D = '3D',
  RESOLUTION_1W = '1W',
  RESOLUTION_1M = '1M'
}

export const mapResolution = (resolution: any) => {
  let time = '1d';
  switch (resolution) {
    case KlineResolution.RESOLUTION_1m:
      time = '1m';
      break;
    case KlineResolution.RESOLUTION_3m:
      time = '3m';
      break;
    case KlineResolution.RESOLUTION_5m:
      time = '5m';
      break;
    case KlineResolution.RESOLUTION_15m:
      time = '15m';
      break;
    case KlineResolution.RESOLUTION_30m:
      time = '30m';
      break;
    case KlineResolution.RESOLUTION_60m:
      time = '1h';
      break;
    case KlineResolution.RESOLUTION_120m:
      time = '2h';
      break;
    case KlineResolution.RESOLUTION_240m:
      time = '4h';
      break;
    case KlineResolution.RESOLUTION_480m:
      time = '8h';
      break;
    case KlineResolution.RESOLUTION_720m:
      time = '12h';
      break;
    case KlineResolution.RESOLUTION_D:
    case KlineResolution.RESOLUTION_1D:
      time = '1d';
      break;
    case KlineResolution.RESOLUTION_3D:
      time = '3d';
      break;
    case KlineResolution.RESOLUTION_1W:
      time = '1w';
      break;
    case KlineResolution.RESOLUTION_1M:
      time = '1M ';
      break;
    default:
  }

  return time;
};

export class WebsocketService {
  static _created = false;
  static _instance: any = null;
  private klineSubscribeIdMap: Map<string, any> = new Map();
  private klineOnTickCallback = new Map();
  subscribeCachedTopics = new Map<string, any>();
  private wsInstance: WS | null = null;

  private klineData = new Map();

  constructor(ws: WS) {
    if (!WebsocketService._created) {
      this.wsInstance = ws;
      WebsocketService._instance = this;
      WebsocketService._created = true;
    }

    return WebsocketService._instance;
  }

  subscribeKline(subscribeId: string, symbol: any, resolution: any, onTickCallback: any) {
    const time = mapResolution(resolution);

    this.klineSubscribeIdMap.set(subscribeId, { symbol, resolution });

    const klineKey = getKlineKey(symbol, time);
    if (this.klineOnTickCallback.has(klineKey)) {
      const value = this.klineOnTickCallback.get(klineKey);
      value[subscribeId] = onTickCallback;
    } else {
      this.klineOnTickCallback.set(klineKey, {
        [subscribeId]: onTickCallback
      });
      const unsub = this.wsInstance?.subscribe(
        {
          event: 'subscribe',
          topic: `${symbol}@kline_${time}`,
          id: `${symbol}@kline_${time}`,
          ts: new Date().getTime()
        },
        {
          onMessage: (data) => {
            const { open, close, high, low, volume, startTime } = data;
            const key = getKlineKey(data.symbol, data.type);
            this.updateKline(key, {
              time: startTime,
              close,
              open,
              high,
              low,
              volume
            });
          }
        }
      );
      this.subscribeCachedTopics.set(`${symbol}@kline_${time}`, unsub);
    }
  }

  unsubscribeKline(subscribeId: string) {
    if (!this.klineSubscribeIdMap.has(subscribeId)) {
      return;
    }

    const { symbol, resolution } = this.klineSubscribeIdMap.get(subscribeId);
    const time = mapResolution(resolution);
    const klineKey = getKlineKey(symbol, time);
    if (this.klineOnTickCallback.has(klineKey)) {
      const value = this.klineOnTickCallback.get(klineKey);
      delete value[subscribeId];

      if (Object.keys(value).length === 0) {
        this.klineOnTickCallback.delete(klineKey);
        const unsub = this.subscribeCachedTopics.get(`${symbol}@kline_${time}`);
        unsub();
      }
    }

    // @ts-expect-error idk
    delete this.klineSubscribeIdMap.get[subscribeId];
  }

  subscribeSymbol(symbol: string) {
    const symbolTopics = getSymbolTopics(symbol);
    console.log('symbolTopics', symbolTopics);
    symbolTopics.forEach((topic) => {
      // check if subscribed
      if (!this.subscribeCachedTopics.has(topic)) {
        const unsub = this.wsInstance?.subscribe(
          {
            event: 'subscribe',
            topic: topic,
            id: topic,
            ts: new Date().getTime()
          },
          {
            onMessage: (data) => {
              console.log('data', data);
              this.updateKlineByLastPrice(data.symbol, data.price);
            }
          }
        );
        this.subscribeCachedTopics.set(topic, unsub);
      }
    });
  }

  updateKlineByLastPrice(symbol: string, lastPrice: number) {
    this.klineOnTickCallback.forEach((_, key) => {
      if (key.startsWith(symbol)) {
        const klineData = this.klineData.get(key);
        if (klineData) {
          this.updateKline(key, { ...klineData, close: lastPrice });
        }
      }
    });
  }

  updateKline(key: string, cbParams: any) {
    const onTickCbs = this.klineOnTickCallback.get(key);
    if (onTickCbs && cbParams) {
      this.klineData.set(key, cbParams);
      console.log('this.klineData', this.klineData);

      Object.keys(onTickCbs).forEach((key: any) => {
        const onTickCb = onTickCbs[key];
        if (onTickCb && typeof onTickCb === 'function') {
          onTickCb(cbParams);
        }
      });
    }
  }
}
