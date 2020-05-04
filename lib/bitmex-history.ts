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
      .floatField('trades', trade.trades)
      .floatField('volume', trade.volume)
      .floatField('vwap', trade.vwap)
      .floatField('lastSize', trade.lastSize)
      .floatField('turnover', trade.turnover)
      .floatField('homeNotional', trade.homeNotional)
      .floatField('foreignNotional', trade.foreignNotional)
  )
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
