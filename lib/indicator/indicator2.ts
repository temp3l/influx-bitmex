import { candler } from '../query';
import { ADX, EMA, SMA, ema, sma, CrossDown, CrossUp } from 'technicalindicators'; //technicalIndicators.setConfig('precision', 7);
import { exec } from 'child_process'; //screen: CTRL-A CTRL-G
const _MA = require('moving-average');

type InputType = {
  close: number[];
  high: number[];
  low: number[];
  period: number;
};
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

export const alert = (type) => {
  if (type === 'SHORT') exec('beep -l 100 -f 999');
  else if (type === 'LONG') exec('beep -l 100 -f 200');
  else if (type === 'FLAT') exec('beep -l 100 -f 500');
};

const calcTrends = async ({ emas = [9, 20] }: { emas?: number[] }) => {
  const results = [];
  const ema_f = new EMA({ period: emas[0], values: [] });
  const ema_s = new EMA({ period: emas[1], values: [] });
  const ema_fast = [];
  const ema_slow = [];

  let input: InputType = {
    close: [],
    high: [],
    low: [],
    period: 14,
  };
  const rowHandler = ({ open, high, low, close, volume, trades, vwap, timestamp }) => {
    let f = ema_f.nextValue(close);
    let s = ema_s.nextValue(close);
    if (f) ema_fast.push(Math.round(f));
    if (s) ema_slow.push(Math.round(s));
    input.close.push(close);
    input.high.push(high);
    input.low.push(low);
  };
  let ca = await candler({ symbol: 'XBTUSD', binSize: '1m', start: '-1h', rowHandler });
  // console.log(CrossDown.calculate({ lineA: ema_fast, lineB: ema_slow }));
  // console.log(CrossUp.calculate({ lineA: ema_fast, lineB: ema_slow }));
  var adx = new ADX(input);
  let res = adx.getResult();
  console.log(res);
};
calcTrends({});

var input = {
  lineA: [7, 6, 5, 4, 3, 8, 3, 5, 3, 8, 5, 5, 3, 8, 5, 5, 8, 3],
  lineB: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
};

//var expectedResults = [false, false, false, true, false, false, true, false, false, false, false, false, true, false, false, false, false, true];

//var crossDown = new CrossDown({ lineA: [], lineB: [] });

const calcAdx = (data: any) => {
  var adx = new ADX({ period: 15, high: [], low: [], close: [] });
  var results = [];

  var input: InputType = {
    close: [29.87, 30.24, 30.1, 28.9, 28.92, 28.48, 28.56, 27.56, 28.47, 28.28, 27.49, 27.23, 26.35, 26.33, 27.03, 26.22, 26.01, 25.46, 27.03, 27.45, 28.36, 28.43, 27.95, 29.01, 29.38, 29.36, 28.91, 30.61, 30.05, 30.19, 31.12, 30.54, 29.78, 30.04, 30.49, 31.47, 32.05, 31.97, 31.13, 31.66, 32.64, 32.59, 32.19, 32.1, 32.93, 33.0, 31.94],
    high: [30.2, 30.28, 30.45, 29.35, 29.35, 29.29, 28.83, 28.73, 28.67, 28.85, 28.64, 27.68, 27.21, 26.87, 27.41, 26.94, 26.52, 26.52, 27.09, 27.69, 28.45, 28.53, 28.67, 29.01, 29.87, 29.8, 29.75, 30.65, 30.6, 30.76, 31.17, 30.89, 30.04, 30.66, 30.6, 31.97, 32.1, 32.03, 31.63, 31.85, 32.71, 32.76, 32.58, 32.13, 33.12, 33.19, 32.52],
    low: [29.41, 29.32, 29.96, 28.74, 28.56, 28.41, 28.08, 27.43, 27.66, 27.83, 27.4, 27.09, 26.18, 26.13, 26.63, 26.13, 25.43, 25.35, 25.88, 26.96, 27.14, 28.01, 27.88, 27.99, 28.76, 29.14, 28.71, 28.93, 30.03, 29.39, 30.14, 30.43, 29.35, 29.99, 29.52, 30.94, 31.54, 31.36, 30.92, 31.2, 32.13, 32.23, 31.97, 31.56, 32.21, 32.63, 31.76],
    period: 14,
  };
  var adx = new ADX(input);
  let res = adx.getResult();
  console.log(res);
};
