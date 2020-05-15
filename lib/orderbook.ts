require('dotenv').config();
import { Point } from '@influxdata/influxdb-client';
import { MA, MAs, alert } from './indicator/indicator2';
const _ = require('lodash');
const maAskVol = MA(5); // 5 minutes
const maBidVol = MA(5); // 5 minutes
const MAS_ask_vol = MAs([5, 15, 60]); // 5m, 15m, 60m
const MAS_bid_vol = MAs([5, 15, 60]); // 5m, 15m, 60m
const { beep } = process.env;

export const onBookReplace = ({ data, symbol, tableName, writeApi }: any) => {
  const bucketSize = 2;
  const book = { Buy: {}, Sell: {} }; // unmodified values
  //prettier-ignore
  let askVol = 0, bidVol = 0, hAsk = 0, lBid = 9999999999;
  data.forEach((bet, i) => {
    const { side, size, price } = bet;
    const rate = Math.ceil(price / bucketSize) * bucketSize;
    if (!book[side][rate]) book[side][rate] = size;
    else book[side][rate] = book[side][rate] + size;
    if (side === 'Buy') {
      askVol += size;
      hAsk = Math.max(hAsk, price);
    } else {
      bidVol += size;
      lBid = Math.min(hAsk, price);
    }
  });
  const asks = Object.keys(book.Buy).map((k) => [Number(k), book.Buy[k]]);
  //prettier-ignore
  const bids = Object.keys(book.Sell).map((k) => [Number(k), book.Sell[k]]).reverse();
  const askVolAvg = maAskVol.push(askVol); // calc avg
  const bidVolAvg = maBidVol.push(bidVol); // calc avg

  const stats = {
    // MAS_ask_vol: MAS_ask_vol.push(askVol),
    // MAS_bid_vol: MAS_bid_vol.push(bidVol),
    askVol,
    askVolAvg,
    askVolDiff: askVol - askVolAvg,
    bidVolDiff: bidVol - bidVolAvg,
    bidVol,
    bidVolAvg,
    hAsk,
    lBid,
    diff3: volReduce(asks, 3) - volReduce(bids, 3),
    diffN: askVol - bidVol,
  };

  console.log({
    data: { hAsk, lBid, book: [asks.length, bids.length] },
    volDiffs: { diff3: stats.diff3, diffN: stats.diffN },
    askAvgs: {
      askVol,
      askVolAvg,
      diff: askVol - askVolAvg,
    },
    bidAvgs: {
      bidVol,
      bidVolAvg,
      diff: bidVol - bidVolAvg,
    },
    // MAS_ask_vol: stats.MAS_ask_vol,
    // MAS_bid_vol: stats.MAS_bid_vol,
    Guess: guess(stats),
  });

  writeBookPoints(writeApi, stats);
};

// data: { hAsk: undefined, book: [ 7, 7 ] },
// diffsss: { diff1: -1306, diff3: -1469, diffN: -3457516 },
// askAvgs: { askVol: 1553961, askVolAvg: 2875942, diff: -1321981 },
// bidAvgs: { bidVol: 5011477, bidVolAvg: 3034249, diff: 1977228 },

//

let signal;
const guess = ({ diff3, diffN, askVol, bidVol, askVolAvg, bidVolAvg }) => {
  let _signal = 'FLAT';
  if (diff3 < 0 && diffN < 0 && askVol < bidVol) _signal = 'SHORT';
  else if (diff3 > 0 && diffN > 0 && askVol > bidVol) _signal = 'LONG';
  if (_signal !== signal && beep !== '0') alert(_signal);
  signal = _signal;
  return _signal;
};

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
      .floatField('hAsk', stats.hAsk)
      .floatField('lBid', stats.lBid)
      .floatField('askVolDiff', stats.askVolDiff)
      .floatField('bidVolDiff', stats.bidVolDiff)
)
};
