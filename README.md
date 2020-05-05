# Fomo Bot

0. simple tracking of changes in the bitmex orderbook

1. Fetches historic trade/candle data from REST-API and saves them in influx-database

- 1m,5m,1h,1d candles (1000 per interval)

2. Connects Orderbook via websocket

- tracks 5m,10m,15m moving-averages for the top25 orderbook entries (bids/asks)
- groups the orderbook into 2$-chunks (instead of 0.5$)

3. Outputs to console:

```js
{
  volDiffs: { diff3: 2429, diffN: 1628340 },
  askAvgs: { askVol: 4588606, askVolAvg: 4183006, diff: 405600 },
  bidAvgs: { bidVol: 2960266, bidVolAvg: 5148133, diff: -2187867 },
  Guess: 'LONG'
}
```

- vollDiffs: difference between low & ask -volume/1000
- askAvgs:
  - askVol: currentTotal askVolume
  - askVolAvg: average 5m volume
  - diff: difference between 5m-avg and current Volume
- biAvgs:
  - ...
- Guess: if all ask-values are below bid-values - it suggests: SHORT ...

## Install

```bash
yarn

ts-node index.ts

```

- Setup influx 2.0 https://v2.docs.influxdata.com/v2.0/
- create `.env` file

```bash
url="http://localhost:9999"
token=".....=="
org="de"
bucket="bitmex"
```
