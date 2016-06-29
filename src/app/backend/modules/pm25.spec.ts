import { test } from 'tape';
import createPM from './pm25';

let pm;

test('factory function', t => {
  pm = createPM({name: 'test_pm25'});
  t.equal(typeof pm.init, 'function');
  t.equal(typeof pm.reset, 'function');
  t.equal(typeof pm.group, 'object');
  t.equal(typeof pm.group.create, 'function');
  t.equal(typeof pm.group.update, 'function');
  t.equal(typeof pm.group.delete, 'function');
  t.equal(typeof pm.groups, 'object');
  t.equal(typeof pm.event, 'object');
  t.equal(typeof pm.events, 'object');
  t.end();
});

test('init()', t => {
  pm.init().then(result => {
    t.equal(result.ok, true);
    t.end();
  }).catch(err => {
    t.fail(err);
  });
});

test('reset()', t => {
  pm.reset().then(result => {
    t.equal(result.ok, true);
    t.end();
  }).catch(err => {
    t.fail(err);
  });
});

test('group.create()', t => {
  let group = {
    type: 'group',
    fields: {
      name: 'test'
    }
  };

  pm.group.create(group).then(result => {
    console.log(result);
    t.equal(result.ok, true);
    t.assert(result.id, 'got id ' + result.id);
    t.assert(result.rev, 'got rev ' + result.rev);
    t.end();
  }).catch(err => {
    t.fail(err);
  });
});
