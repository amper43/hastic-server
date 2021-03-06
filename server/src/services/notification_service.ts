import { Segment } from '../models/segment_model';
import { HASTIC_WEBHOOK_URL, HASTIC_WEBHOOK_TYPE, HASTIC_WEBHOOK_SECRET } from '../config';

import axios from 'axios';
import * as querystring from 'querystring';


// TODO: send webhook with payload without dep to AnalyticUnit
export async function sendWebhook(analyticUnitName: string, segment: Segment) {
  if(HASTIC_WEBHOOK_URL === null) {
    throw new Error(`Can't send alert, HASTIC_WEBHOOK_URL is undefined`);
  }

  const alert = {
    analyticUnitName,
    from: segment.from,
    to: segment.to 
  };

  console.log(`Sending alert: ${JSON.stringify(alert)}`);

  let payload;
  if(HASTIC_WEBHOOK_TYPE === 'application/json') {
    payload = JSON.stringify(alert);
  } else if(HASTIC_WEBHOOK_TYPE === 'application/x-www-form-urlencoded') {
    payload = querystring.stringify(alert);
  } else {
    throw new Error(`Unknown webhook type: ${HASTIC_WEBHOOK_TYPE}`);
  }

  // TODO: use HASTIC_WEBHOOK_SECRET
  const options = {
    method: 'POST',
    url: HASTIC_WEBHOOK_URL,
    data: payload,
    headers: { 'Content-Type': HASTIC_WEBHOOK_TYPE }
  };

  try {
    const response = await axios(options);
    console.log(response);
  } catch(err) {
    console.error(`Can't send alert to ${HASTIC_WEBHOOK_URL}. Error: ${err.message}`);
  }

}

