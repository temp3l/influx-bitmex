require('dotenv').config();
import { InfluxDB } from '@influxdata/influxdb-client';
import { HealthAPI } from '@influxdata/influxdb-client-apis';
const { url, token, org, bucket, username, password } = process.env;

console.log('*** HEALTH CHECK ***');
const influxDB = new InfluxDB({ url, token });
const healthAPI = new HealthAPI(influxDB);

healthAPI
  .getHealth()
  .then((result /* : HealthCheck */) => {
    console.log(JSON.stringify(result, null, 2));
    console.log('\nFinished SUCCESS');
  })
  .catch((error) => {
    console.error(error);
    console.log('\nFinished ERROR');
  });
