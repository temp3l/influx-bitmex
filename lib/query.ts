require('dotenv').config();
import { InfluxDB, FluxTableMetaData } from '@influxdata/influxdb-client';
const { url, token, org, bucket } = process.env;

const queryApi = new InfluxDB({ url, token }).getQueryApi(org);
const fluxQuery = 'from(bucket:"bitmex") |> range(start: 0) |> filter(fn: (r) => r._measurement == "temperature")';

console.log('*** QUERY ROWS ***');
// performs query and receive line table metadata and rows
// https://v2.docs.influxdata.com/v2.0/reference/syntax/annotated-csv/
queryApi.queryRows(fluxQuery, {
  next(row: string[], tableMeta: FluxTableMetaData) {
    const o = tableMeta.toObject(row);
    // console.log(JSON.stringify(o, null, 2))
    console.log(`${o._time} ${o._measurement} in '${o.location}' (${o.example}): ${o._field}=${o._value}`);
  },
  error(error: Error) {
    console.error(error);
    console.log('\nFinished ERROR');
  },
  complete() {
    console.log('\nFinished SUCCESS');
  },
});

// performs query and receive line results in annotated csv format
// https://v2.docs.influxdata.com/v2.0/reference/syntax/annotated-csv/
// queryApi.queryLines(
//   fluxQuery,
//   {
//     error(error: Error) {
//       console.error(error)
//       console.log('\nFinished ERROR')
//     },
//     next(line: string) {
//       console.log(line)
//     },
//     complete() {
//       console.log('\nFinished SUCCESS')
//     },
//   }
// )
