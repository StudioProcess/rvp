import test from 'tape';
import createPM from '../../app/scripts/modules/pm25.js';

test('test pm', (t) => {
  let pm = createPM({dbName: 'test_pm25'});
  t.ok(true, "hello");
  t.end();
});
