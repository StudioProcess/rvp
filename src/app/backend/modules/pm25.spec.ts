import { test } from 'tape';
import createPM from './pm25';

test('test pm', (t) => {
  // let pm = createPM({dbName: 'test_pm25'});
  let pm = createPM();
  t.ok(true, "hello");
  t.end();
});
