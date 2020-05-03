import { Point } from '@influxdata/influxdb-client';
import nodeFetch from 'node-fetch';

export const trades2points = ({ binSize, data }) => {
  // prettier-ignore
  return data.map( trade =>
    new Point('candles')
      .timestamp(new Date(trade.timestamp))
      .tag('symbol', trade.symbol)
      .tag('binSize', binSize)
      .floatField('open', trade.open)
      .floatField('open', trade.open)
      .floatField('high', trade.high)
      .floatField('low', trade.low)
      .floatField('close', trade.close)
      .intField('trades', trade.trades)
      .floatField('volume', trade.volume)
      .floatField('vwap', trade.vwap)
      .floatField('lastSize', trade.lastSize)
      .floatField('turnover', trade.turnover)
      .floatField('homeNotional', trade.homeNotional)
      .floatField('foreignNotional', trade.foreignNotional)
  )

  // [{// tradeBin1m
  //   timestamp: '2020-05-03T08:05:00.000Z',
  //   symbol: 'XBTUSD',
  //   open: 8987,
  //   high: 9000,
  //   low: 8986.5,
  //   close: 9000,
  //   trades: 1550,
  //   volume: 2294374,
  //   vwap: 8993.6145,
  //   lastSize: 1,
  //   turnover: 25512061318,
  //   homeNotional: 255.12061318000002,
  //   foreignNotional: 2294374
  // }]
};

const getHistory = async ({ symbol, binSize }) => {
  return await nodeFetch(`https://www.bitmex.com/api/v1/trade/bucketed?binSize=${binSize}&partial=false&symbol=${symbol}&count=1000&reverse=true`, {}).then((res) => res.json());
};

export const fetchMex = async (writeApi) => {
  const symbol = 'XBTUSD';
  // prettier-ignore
  const trades = [
    await getHistory({ symbol, binSize: '1m' }),
    await getHistory({ symbol, binSize: '5m' }),
    await getHistory({ symbol, binSize: '1h' }),
    await getHistory({ symbol, binSize: '1d' })
  ];
  // prettier-ignore
  const points = [
   ...trades2points({ binSize: '1m', data: trades[0] }),
   ...trades2points({ binSize: '5m', data: trades[1] }),
   ...trades2points({ binSize: '1h', data: trades[2] }),
   ...trades2points({ binSize: '1d', data: trades[3] }),
  ]

  writeApi.writePoints(points);
  console.log(`added ${points.length} points`);

  //return points;
};
