import { InfluxDB, Point, HttpError, WritePrecision } from '@influxdata/influxdb-client';
import { onBookReplace } from './lib/orderbook';
const BitMEXClient = require('./index');

export const handleLiveData = async (writeApi) => {
  const client = new BitMEXClient({ testnet: false });
  client.on('error', console.error);
  client.on('open', () => console.log('Connection opened.'));
  client.on('close', () => console.log('Connection closed.'));
  client.on('initialize', () => console.log('Client initialized, data is flowing.'));
  // "orderBookL2_25",      // Top 25 levels of level 2 order book
  // "orderBookL2",         // Full level 2 order book
  // "orderBook10",         // Top 10 levels using traditional full book push

  // stream of every single trade
  client.addStream('XBTUSD', 'trade', (data, symbol, tableName) => {
    onTrade({ data: data[data.length - 1] });
  });

  // Top 25 levels of level 2 order book => orderBookL2_25
  client.addStream('XBTUSD', 'orderBookL2_25', (data, symbol, tableName) => {
    onBookReplace({ data, symbol, tableName, writeApi });
  });

  // Full level 2 order book
  // client.addStream('XBTUSD', 'orderBookL2', (data, symbol, tableName) => {
  //   console.log(data[data.length - 1]);
  // });

  // Top 10 levels using traditional full book push
  // client.addStream('XBTUSD', 'orderBook10', (data, symbol, tableName) => {
  //   onBookReplace({ data, symbol, tableName, writeApi });
  // });

  // Top level of the book
  // client.addStream('XBTUSD', 'quote', (data, symbol, tableName) => {
  //   console.log(data[data.length-1]);
  // });

  //stream of quotes: {askPrice askSize bidPrice bidSize} // has no history
  client.addStream('XBTUSD', 'quoteBin1m', (data, symbol, tableName) => onQuoteBin({ binSize: '1m', data: data[data.length - 1] }));
  client.addStream('XBTUSD', 'quoteBin1m', (data, symbol, tableName) => onQuoteBin({ binSize: '5m', data: data[data.length - 1] }));
  client.addStream('XBTUSD', 'quoteBin1m', (data, symbol, tableName) => onQuoteBin({ binSize: '1h', data: data[data.length - 1] }));
  client.addStream('XBTUSD', 'quoteBin1m', (data, symbol, tableName) => onQuoteBin({ binSize: '1d', data: data[data.length - 1] }));
  // regular candle data stream
  client.addStream('XBTUSD', 'tradeBin1m', (data) => onTradeBin({ binSize: '1m', data: data[data.length - 1] }));
  client.addStream('XBTUSD', 'tradeBin5m', (data) => onTradeBin({ binSize: '5m', data: data[data.length - 1] }));
  client.addStream('XBTUSD', 'tradeBin1h', (data) => onTradeBin({ binSize: '1h', data: data[data.length - 1] }));
  client.addStream('XBTUSD', 'tradeBin1d', (data) => onTradeBin({ binSize: '1d', data: data[data.length - 1] }));

  const onQuoteBin = ({ binSize, data: quote }) => {
    if (!quote || !quote.timestamp) return console.log(quote);
    //prettier-ignore
    writeApi.writePoint(new Point('quote')
      .timestamp(new Date(quote.timestamp))
      .tag('symbol', quote.symbol)
      .tag('binSize', binSize)
      .floatField('bidSize', quote.bidSize)
      .floatField('bidPrice', quote.bidPrice)
      .floatField('askPrice', quote.askPrice)
      .floatField('askSize', quote.askSize))
  };

  const onTradeBin = ({ binSize, data: quote }) => {
    if (!quote || !quote.timestamp) return console.log(quote);
    // prettier-ignore
    console.log(new Date(quote.timestamp));

    writeApi.writePoint(new Point('candles').timestamp(new Date(quote.timestamp)).tag('symbol', quote.symbol).tag('binSize', binSize).floatField('open', quote.open).floatField('open', quote.open).floatField('high', quote.high).floatField('low', quote.low).floatField('close', quote.close).floatField('trades', quote.trades).floatField('volume', quote.volume).floatField('vwap', quote.vwap).floatField('lastSize', quote.lastSize).floatField('turnover', quote.turnover).floatField('homeNotional', quote.homeNotional).floatField('foreignNotional', quote.foreignNotional));

    //console.log(`added ${points.length} points to ${binSize} ticks`);
  };

  const onTrade = ({ data: trade }) => {
    if (!trade || !trade.timestamp) return console.log(trade);
    // prettier-ignore
    writeApi.writePoint(new Point('trades')
      .timestamp(new Date(trade.timestamp))
      .tag('symbol', trade.symbol)
      .tag('side', trade.side)
      .tag('tickDirection', trade.tickDirection)
      .stringField('side', trade.side)
      .floatField('size', trade.size)
      .floatField('price', trade.price)
      .stringField('tickDirection', trade.tickDirection)
      //.floatField('trdMatchID', trade.trdMatchID)
      .floatField('size', trade.size)
      .floatField('grossValue', trade.grossValue)
      .intField('homeNotional', trade.homeNotional)
      .floatField('foreignNotional', trade.foreignNotional)
    )
    //console.log(`added ${points.length} points to trades, ${data[0].side} : ${data[0].price}`);
  };
};

let sampleTrade = {
  timestamp: '2020-05-03T09:03:00.960Z',
  symbol: 'XBTUSD',
  side: 'Buy',
  size: 50000,
  price: 9048,
  tickDirection: 'ZeroPlusTick',
  trdMatchID: 'cae15b7e-a4cc-7d25-4309-8cf7256f915d',
  grossValue: 552600000,
  homeNotional: 5.526,
  foreignNotional: 50000,
};
