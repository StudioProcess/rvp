/* tslint:disable:no-unused-variable */

import { test } from 'tape';
import { TimelineService } from './timeline.service';

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

let ts;
let values = {
  timelineDuration: 120,
  viewportWidth: 1000,
  zoom: 1,
  scroll: 0
};

let newValues = {
  timelineDuration: 60,
  viewportWidth: 500,
  zoom: 0.5,
  scroll: 0.5
};

test('create instance', t => {
  t.false(ts, 'empty variable');
  ts = new TimelineService();
  t.true(ts instanceof TimelineService, 'instance created');
  t.end();
});

test('initialize', t => {
  let returnValue = ts.init(values);
  t.false(returnValue);
  t.true(ts);
  t.end();
});

let checkOutputStreams = (t, values) => {
  ts.timelineDurationStream.first().subscribe(x => {
    t.equals(x, values.timelineDuration);
  });

  ts.viewportWidthStream.first().subscribe(x => {
    t.equals(x, values.viewportWidth);
  });

  ts.zoomStream.first().subscribe(x => {
    t.equals(x, values.zoom);
  });

  ts.scrollStream.first().subscribe(x => {
    t.equals(x, values.scroll);
  });

  ts.timelineWidthStream.first().subscribe(x => {
    t.equals(x, values.viewportWidth / values.zoom);
  });
};

test('check output streams', t => {
  checkOutputStreams(t, values);
  t.end();
});


test('set timelineDuration', t => {
  ts.timelineDuration = newValues.timelineDuration;
  values.timelineDuration = newValues.timelineDuration;
  checkOutputStreams(t, values);
  t.end();
});

test('set viewportWidth', t => {
  ts.viewportWidth = newValues.viewportWidth;
  values.viewportWidth = newValues.viewportWidth;
  checkOutputStreams(t, values);
  t.end();
});

test('set zoom', t => {
  ts.zoom = newValues.zoom;
  values.zoom = newValues.zoom;
  checkOutputStreams(t, values);
  t.end();
});

test('set scroll', t => {
  ts.scroll = newValues.scroll;
  values.scroll = newValues.scroll;
  checkOutputStreams(t, values);
  t.end();
});


let newValues2 = {
  timelineDuration: 120,
  viewportWidth: 1000,
  zoom: 0.5,
  scroll: 0.25
};

test('convertPixelsToSeconds', t => {
  ts.init(newValues);
  t.equals( ts.convertPixelsToSeconds(0), 0 );
  t.equals( ts.convertPixelsToSeconds(1000), 60 );
  t.equals( ts.convertPixelsToSeconds(500), 30 );
  t.equals( ts.convertPixelsToSeconds(250), 15 );
  ts.init(newValues2);
  t.equals( ts.convertPixelsToSeconds(0), 0 );
  t.equals( ts.convertPixelsToSeconds(2000), 120 );
  t.equals( ts.convertPixelsToSeconds(1000), 60 );
  t.equals( ts.convertPixelsToSeconds(500), 30 );
  t.end();
});

test('convertPercentToSeconds', t => {
  ts.init(newValues);
  t.equals( ts.convertPercentToSeconds(0), 0 );
  t.equals( ts.convertPercentToSeconds(1.00), 60 );
  t.equals( ts.convertPercentToSeconds(0.50), 30 );
  t.equals( ts.convertPercentToSeconds(0.25), 15 );
  ts.init(newValues2);
  t.equals( ts.convertPercentToSeconds(0), 0 );
  t.equals( ts.convertPercentToSeconds(1.00), 120 );
  t.equals( ts.convertPercentToSeconds(0.50), 60 );
  t.equals( ts.convertPercentToSeconds(0.25), 30 );
  t.end();
});
