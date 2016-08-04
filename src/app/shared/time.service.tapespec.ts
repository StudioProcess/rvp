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

window['log'] = {
  debug: function() {}
};

let timeService;

test('create instance', t => {
  t.false(timeService, 'empty variable');
  timeService = new TimeService();
  t.true(timeService instanceof TimeService, 'instance created');
  t.end();
});

test('run init()', t => {
  let returnValue = timeService.init({
    timelineDuration: 120,
    timelineViewportWidth: 1000,
    zoomLevel: 10,
    maxZoomLevel: 100,
    scrollPosition: 0
  });
  t.false(returnValue);
  t.true(timeService);
  t.end();
});

test('independent vars', t => {
  t.equals(timeService.timelineDuration, 120);
  t.equals(timeService.timelineViewportWidth, 1000);
  t.equals(timeService.zoomLevel, 10);
  t.equals(timeService.scrollPosition, 0);
  t.end();
});

test('dependent vars', t => {
  t.equals(timeService.timelineWidth, 1200, 'timelineWidth');
  t.equals(timeService._maxZoomLevel, 100, '_maxZoomLevel');
  t.equals(timeService._minZoomLevel, 1000/120, '_minZoomLevel');
  t.end();
});

test('public streams', t => {
  timeService.timelineDurationStream.first().subscribe(x => {
    t.equals(x, 120);
  });

  timeService.timelineViewportWidthStream.first().subscribe(x => {
    t.equals(x, 1000);
  });

  timeService.timelineWidthStream.first().subscribe(x => {
    t.equals(x, 1200);
  });

  timeService.zoomLevelStream.first().subscribe(x => {
    t.equals(x, 10);
  });

  timeService.scrollPositionStream.first().subscribe(x => {
    t.equals(x, 0);
  });

  t.end();
});




// viewport too big for desired zoom level
test('run init()', t => {
  let returnValue = timeService.init({
    timelineDuration: 60,
    timelineViewportWidth: 1000,
    zoomLevel: 10,
    maxZoomLevel: 100,
    scrollPosition: 0
  });
  t.false(returnValue);
  t.true(timeService);
  t.end();
});

test('independent vars', t => {
  t.equals(timeService.timelineDuration, 60);
  t.equals(timeService.timelineViewportWidth, 1000);
  t.equals(timeService.zoomLevel, 1000/60, 'zoomlevel adjusted');
  t.equals(timeService.scrollPosition, 0);
  t.end();
});

test('dependent vars', t => {
  t.equals(timeService.timelineWidth, 1000/60 * 60, 'timelineWidth');
  t.equals(timeService._maxZoomLevel, 100, '_maxZoomLevel');
  t.equals(timeService._minZoomLevel, 1000/60, '_minZoomLevel');
  t.end();
});

// TODO: test initial scroll position

// console.log(timeService);
