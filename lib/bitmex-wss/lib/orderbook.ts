import { Point } from '@influxdata/influxdb-client';
const _ = require('lodash');
const MA = require('moving-average');
const timeInterval = 5 * 60 * 1000; // 5 minutes
const maAskVol = MA(timeInterval);
const maBidVol = MA(timeInterval);

export const onBookReplace = ({ data, symbol, tableName, writeApi }: any) => {
  const bucketSize = 0.5;
  const book = { Buy: {}, Sell: {} };
  data.forEach((bet, i) => {
    const { side, size, price } = bet;
    const rate = Math.ceil(price / bucketSize) * bucketSize;
    if (!book[side][rate]) book[side][rate] = size;
    else book[side][rate] = book[side][rate] + size;
  });
  const asks = Object.keys(book.Buy).map((k) => [Number(k), book.Buy[k]]);
  //prettier-ignore
  const bids = Object.keys(book.Sell).map((k) => [Number(k), book.Sell[k]]).reverse();
  const min = Math.min(asks.length, bids.length);
  const hask = highestAsk(asks);
  const lbid = lowestBid(bids);
  const askVol = volReduce(asks, min);
  const bidVol = volReduce(bids, min);

  maAskVol.push(Date.now(), askVol);
  maBidVol.push(Date.now(), bidVol);
  const askVolAvg = Math.round(maAskVol.movingAverage());
  const bidVolAvg = Math.round(maBidVol.movingAverage());

  let stats = {
    data: { hask: hask[0], book: [asks.length, bids.length] },
    diffsss: { diff1: volReduce(asks, 1) - volReduce(bids, 1), diff3: volReduce(asks, 3) - volReduce(bids, 3), ['diff' + min]: askVol - bidVol },
    askAvgs: {
      askVol,
      askVolAvg,
      dev: askVol - askVolAvg,
    },
    bidAvgs: {
      bidVol,
      bidVolAvg,
      dev: bidVol - bidVolAvg,
    },
  };
  //console.log(stats);

  writeBookPoints(writeApi, {
    askVol,
    askVolAvg,
    bidVol,
    bidVolAvg,
    hask,
    lbid,
  });
};

const highestAsk = (asks) => asks.slice(-1)[0];
const lowestBid = (bids) => bids.slice(-1)[0];
const reducer = (accumulator, currentValue) => accumulator + currentValue;
// prettier-ignore
const volReduce = (book, volDepth) =>Math.round(book.slice(volDepth * -1).map((d) => d[1]).reduce(reducer, 0)/1000);

const writeBookPoints = (writeApi, stats) => {
  // prettier-ignore
  writeApi.writePoint(new Point('book')
      .timestamp(new Date())
      .tag('symbol', 'XBTUSD')
      .floatField('askVol', stats.askVol)
      .floatField('askVolAvg', stats.askVolAvg)
      .floatField('bidVol', stats.bidVol)
      .floatField('bidVolAvg', stats.bidVolAvg)
      .floatField('hask', stats.hask)
      .floatField('lbid', stats.lbid)
    )
};
