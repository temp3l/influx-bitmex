require('dotenv').config();
import { InfluxDB, Point, HttpError, WritePrecision } from '@influxdata/influxdb-client';
import { fetchMex } from './lib/bitmex-history';
import { handleLiveData } from './lib/bitmex-wss/example';

const { url, token, org, bucket } = process.env;
const writeApi = new InfluxDB({ url, token, writeOptions: { batchSize: 1500, flushInterval: 1000 * 3 } }).getWriteApi(org, bucket);
writeApi.useDefaultTags({ location: 'bitmex' }); //writeApi.close().then(() => console.log('Points flushed')).catch(console.log);

//const history = fetchMex(writeApi);

let foo = handleLiveData(writeApi);

// select sum(*) from XBTUSD_trade  WHERE time >= now()-1h  GROUP BY Time(5m) ORDER BY ASC LIMIT 4
// select moving_average(mean("price"), 20) from XBTUSD_trade  WHERE time >= now()-1h  GROUP BY time(20s)  ORDER BY ASC LIMIT 100
// select moving_average(sum("vol"), 20) from statsd  WHERE time >= now()-1h  GROUP BY time(20s)  ORDER BY ASC LIMIT 10

// let mavg1min = `select moving_average(mean("close"), 20) from XBTUSD_tradeBin1m WHERE time >= now()-2h GROUP BY time(5m) ORDER BY ASC`;
// let mavg5min = `select moving_average(mean("close"), 20) from XBTUSD_tradeBin5m WHERE time >= now()-12h GROUP BY time(15m) ORDER BY ASC`;
// let mavg1h = `select moving_average(mean("close"), 20) from XBTUSD_tradeBin1h WHERE time >= now()-120h GROUP BY time(4h) ORDER BY ASC`;
// let mavg1d = `select moving_average(mean("close"), 20) from XBTUSD_tradeBin1d WHERE time >= now()-90d GROUP BY time(2d) ORDER BY ASC`;

// let tradeAvg = `select moving_average(mean("price"), 20) from XBTUSD_trade WHERE time >= now()-4h GROUP BY time(10s) ORDER BY ASC`;
// let tradeVol1m = `select moving_average(sum("price"), 20) from XBTUSD_trade WHERE time >= now()-4h GROUP BY time(10s) ORDER BY ASC`;
// let statsd = `select moving_average(mean("vol"), 20) from statsd  WHERE time >= now()-4h  GROUP BY time(1m) ORDER BY "time"`;
// let statsd = `select median("vol") from statsd  WHERE time >= now()-4h  GROUP BY time(10s) ORDER BY "time"`;
