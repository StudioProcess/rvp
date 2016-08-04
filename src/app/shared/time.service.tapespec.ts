/* tslint:disable:no-unused-variable */

import { test } from 'tape';
import { TimeService } from './time.service';

// import { addProviders, async, inject } from '@angular/core/testing';
// test('injection', t => {
//   addProviders([TimeService]);
//   inject([TimeService], (service: TimeService) => {
//     t.true(service);
//     t.end();
//   });
// });


let timeService;

test('create instance', t => {
  t.false(timeService, 'empty variable');
  timeService = new TimeService();
  t.true(timeService instanceof TimeService, 'instance created');
  t.end();
});

test('initialization', t => {
  t.end();
});
