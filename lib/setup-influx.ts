require('dotenv').config();
import { InfluxDB } from '@influxdata/influxdb-client';
import { SetupAPI } from '@influxdata/influxdb-client-apis';
const { url, token, org, bucket, username, password } = process.env;

console.log('*** ONBOARDING ***');
const setupApi = new SetupAPI(new InfluxDB({ url }));

setupApi
  .getSetup()
  .then(async ({ allowed }) => {
    if (allowed) {
      await setupApi.postSetup({
        body: {
          org,
          bucket,
          username,
          password,
          token,
        },
      });
      console.log(`InfluxDB '${url}' is now onboarded.`);
    } else {
      console.log(`InfluxDB '${url}' has been already onboarded.`);
    }
    console.log('\nFinished SUCCESS');
  })
  .catch((error) => {
    console.error(error);
    console.log('\nFinished ERROR');
  });
