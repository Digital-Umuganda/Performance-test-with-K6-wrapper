import http from 'k6/http';
import { check, sleep } from 'k6';

// A test to see how the system would respond to spike in the app usage.
// The following test simulates a thousand users using the application simulaneously for 5 minutes.
// Let suppose that a typical user spends 5 seconds on a single screen display
// this would result in 60 total interactions with the USSD application in 5 minutes for each user
// and 60 000 interactions if we are to consider a thousand users using the app simultaneously for 5 minutes.

const reqData = {  
  host: '10.10.77.252',
  port: '8088',
  path: '/mbazaussd/ussd', //make sure the path doesn't end with a '/'
}

export default function () {
  var phoneNumber = '07' + ((Math.random() + 8) * 10000000).toFixed(0)
  var path = reqData.path +  '?msisdn=' + phoneNumber + '&input=114&newRequest=1'
  var url = 'http://' + reqData.host + ':' + reqData.port + path;
  let res = http.get(url);
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}