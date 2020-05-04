require('dotenv').config();
import { InfluxDB, FluxTableMetaData } from '@influxdata/influxdb-client'; // https://v2.docs.influxdata.com/v2.0/reference/syntax/annotated-csv/
const { url, token, org, bucket } = process.env;
const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

export const candler = async ({ binSize, symbol, start = '-4h', rowHandler }) => {
  const query = `
    from(bucket: "bitmex")
    |> range(start: ${start})
    |> filter(fn: (r) => r["_measurement"] == "candles")
    |> filter(fn: (r) => r["binSize"] == "${binSize}")
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
  `;
  // const rowHandler = ({ open, high, low, close, volume, trades, vwap, timestamp }) => {}
  return await fluxQL(query, rowHandler);
};

export const fluxQL = async (query: string, rowHandler?: Function) => {
  const results: any = []; // to be avoided - stream it!
  return new Promise((resolve, reject) => {
    queryApi.queryRows(query, {
      next(row: string[], tableMeta: FluxTableMetaData) {
        if (typeof rowHandler === 'function') {
          rowHandler(tableMeta.toObject(row));
        } else {
          results.push(tableMeta.toObject(row)); //console.log(`${o._time} ${o._measurement} in '${o.location}'  ${o._field}=${o._value}`);
        }
      },
      error(error: Error) {
        console.error(error);
        reject(error);
      },
      complete() {
        console.log(`Query returned ${results.length} rows.`);
        resolve(results);
      },
    });
  });
};

// let qq = `
// from(bucket: "bitmex")
// |> range(start: -5h)
// |> filter(fn: (r) =>
//   r["_measurement"] == "candles" and
//   r["binSize"] == "1m"
// )
// |> window(every: 5m)
// |> sum()
// //|> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
// `;
// const main = async () => {
//   let ers = await fluxQL(qq);
//   console.log(ers);
// };
//main();
