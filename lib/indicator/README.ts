const technicalIndicators = require('technicalindicators');
technicalIndicators.setConfig('precision', 7);
const { EMA, SMA, ema, sma } = technicalIndicators; // reversedInput : true

let period = 8;
let prices = [10000.01, 19999.16, 19999.12, 19999.33, 19999.44, 19999.55, 12345.24];
let results = [];
for (var i = 0; i < 10 * 1000; i++) prices.push(Math.random() * 10 * 11234.88);

// var _ema = new EMA({ period: period, values: prices });
//  results = _ema.getResult();
//  _ema.nextValue(price);
// var _ema = EMA.calculate({ period: period, values: prices });
// var _ema = ema({ period: period, values: prices });

let now = Date.now();
var _ema = new SMA({ period: 8, values: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }); //var result = _ema.nextValue(price);
results.push(..._ema.getResult());
results.push(_ema.nextValue(1000));

console.log(results.join(', '));

//results.push(sma.nextValue(16)); // 10.1
//Note: Calling nextValue will not update getResult() value.
//sma.price = [2, 3];

// const technicalIndicators = require('technicalindicators');
// technicalIndicators.setConfig('precision', 7);
// const { EMA, SMA, ema, sma } = technicalIndicators; // reversedInput : true
// let _ema = new SMA({ period: 8, values: [] });
// let results = [];

// let result = _ema.nextValue(highestAsk(asks)[0]);
// if (result) results = [...results.slice(-3), result];

const MA = require('moving-average');
const timeInterval = 5 * 60 * 1000; // 5 minutes
const ma = MA(timeInterval);

setInterval(function () {
  ma.push(Date.now(), Math.random() * 500);
  // console.log('moving average now is', ma.movingAverage());
  // console.log('moving variance now is', ma.variance());
  // console.log('moving deviation now is', ma.deviation());
  ////let avg = [ma.movingAverage(), ma.variance(), ma.deviation(), ma.forecast()].map((a) => Math.round(a));
  // console.log('forecast is', ma.forecast());
  console.log(ma);
}, 500);

let saample = {
  data: { hask: 8852, book: [7, 7] },
  diffs: { diff1: 1479, diff3: 2470, diff7: 2652 },

  askAvgs: { curr: 4404, mavg: 2907, dev: 1317 }, // 1400
  bidAvgs: { curr: 1752, mavg: 4106, dev: 1487 }, // 2300
};
