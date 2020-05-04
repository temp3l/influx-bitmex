import { candler } from '../query';
//import { CrossUp } from 'technicalindicators/lib/Utils/CrossUp';
const _MA = require('moving-average');
const technicalIndicators = require('technicalindicators');

//const CrossUp = require('technicalindicators/lib/Utils/CrossUp').CrossUp;

const { EMA, SMA, ema, sma } = technicalIndicators; // reversedInput : true
technicalIndicators.setConfig('precision', 7);
const beep = require('beepbeep'); //screen: CTRL-A CTRL-G
import { exec } from 'child_process';

export const MA = (interval = 5) => {
  const _ma = _MA(interval * 60 * 1000); // track moving-average - default: 5m
  return {
    push: (value: number) => {
      _ma.push(Date.now(), value);
      return Math.round(_ma.movingAverage());
    },
    movingAverage: () => Math.round(_ma.movingAverage()),
    variance: () => Math.round(_ma.variance()),
    deviation: () => Math.round(_ma.deviation()),
    forecast: () => Math.round(_ma.forecast()),
    test: () => {
      setInterval(function () {
        _ma.push(Math.random() * 500);
        console.log('moving average now is', _ma.movingAverage());
        console.log('moving variance now is', _ma.variance());
        console.log('moving deviation now is', _ma.deviation());
        console.log('forecast is', _ma.forecast());
      }, 500);
    },
  };
};

export const MAs = (intervals: number[]) => {
  // track multiple moving averages - single push
  const _mas: any = {
    push: (value: number) =>
      intervals.map((interval) => {
        return _mas[String(interval)].push(value);
        //return _mas[String(interval)].movingAverage()
      }),
  };
  intervals.forEach((interval) => (_mas[String(interval)] = MA(interval))); // create {[i]:ma}
  return _mas;
};

// const intervals = [1, 3, 5]; // 1m, 3m, 5m
// const mas = MAs(intervals);
// setInterval(() => {
//   let stats = mas.push(Math.random() * 500); // sigle push
//   console.log(stats);
// }, 500);
export const alert = (type) => {
  if (type === 'SHORT') exec('beep -l 100 -f 999');
  else if (type === 'LONG') exec('beep -l 100 -f 200');
  else if (type === 'FLAT') exec('beep -l 100 -f 500');
};

// alertTerminal();
// process.stdout.write('\x07');
// setTimeout(() => console.log('\x07'), 1250);
// beep();
//beep([1000, 500, 2000]);
//beep(3, 1000);

const calcTrends = async ({ emas = [10, 20] }: { emas?: number[] }) => {
  const results = [];
  const ema_f = new EMA({ period: emas[0], values: [] });
  const ema_s = new EMA({ period: emas[1], values: [] });
  const ema_fast = [];
  const ema_slow = [];

  const rowHandler = ({ open, high, low, close, volume, trades, vwap, timestamp }) => {
    let f = ema_f.nextValue(close);
    let s = ema_s.nextValue(close);
    if (f) ema_fast.push(Math.round(f));
    if (s) ema_slow.push(Math.round(s));
  };
  let a = await candler({ symbol: 'XBTUSD', binSize: '1m', start: '-1h', rowHandler });
  console.log({ fast: ema_fast.slice(-10), slow: ema_slow.slice(-10) });
};
calcTrends({});
