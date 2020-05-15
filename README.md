# Fomo Bot

0. simple analysis of changes in the orderbook (compares current volumes and average-vol)

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

## Prequisits

1. download & install influxdb from https://v2.docs.influxdata.com/v2.0/get-started/#start-with-influxdb-oss
2. Set up InfluxDB through the UI: http://localhost:9999
  - create an organisation called "de"
  - create a  bucket called "bitmex"
  - see https://v2.docs.influxdata.com/v2.0/get-started/#set-up-influxdb
  

## Install

```bash

yarn
yarn start 

# optional install: typescript and ts-node globally

yarn global add typescript
yarn global add ts-node

```

- Setup influx 2.0 https://v2.docs.influxdata.com/v2.0/
- create `.env` file

```bash
url="http://localhost:9999"
token=".....=="
org="de"
bucket="bitmex"
```

## Influx Dasboards

- Data will be pumped to your influxdb

![img](/docs/bitmex.png)

## sample output 

![img](/docs/bmex_bot.jpg)



## Orderbot coming soon

![img](/docs/bmex_orders.png)



