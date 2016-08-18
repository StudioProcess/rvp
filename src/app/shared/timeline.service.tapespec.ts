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

let ts; // timeline service instance

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
Object.freeze(newValues);

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

let checkOutputStreams = (t, expected) => {
  ts.timelineDurationStream.first().subscribe(x => {
    t.equals(x, expected.timelineDuration);
  });

  ts.viewportWidthStream.first().subscribe(x => {
    t.equals(x, expected.viewportWidth);
  });

  ts.zoomStream.first().subscribe(x => {
    t.equals(x, expected.zoom);
  });

  ts.scrollStream.first().subscribe(x => {
    t.equals(x, expected.scroll);
  });

  ts.timelineWidthStream.first().subscribe(x => {
    t.equals(x, expected.viewportWidth / expected.zoom);
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
Object.freeze(newValues2);

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


test('convertViewportPixelsToSeconds', t => {
  ts.init({
    timelineDuration: 120,
    viewportWidth: 1000,
    zoom: 0.5,
    scroll: 0
  });
  t.equals( ts.convertViewportPixelsToSeconds(0), 0 );
  t.equals( ts.convertViewportPixelsToSeconds(500), 30 );
  t.equals( ts.convertViewportPixelsToSeconds(1000), 60 );
  ts.scroll = 0.5;
  t.equals( ts.convertViewportPixelsToSeconds(500), 60 );
  t.equals( ts.convertViewportPixelsToSeconds(0), 30 );
  t.equals( ts.convertViewportPixelsToSeconds(1000), 90 );
  ts.scroll = 1;
  t.equals( ts.convertViewportPixelsToSeconds(0), 60 );
  t.equals( ts.convertViewportPixelsToSeconds(1000), 120 );
  t.equals( ts.convertViewportPixelsToSeconds(500), 90 );
  ts.init({
    timelineDuration: 60,
    viewportWidth: 500,
    zoom: 0.25,
    scroll: 0
  });
  t.equals( ts.convertViewportPixelsToSeconds(0), 0 );
  t.equals( ts.convertViewportPixelsToSeconds(250), 7.5 );
  t.equals( ts.convertViewportPixelsToSeconds(500), 15 );
  ts.scroll = 0.5;
  t.equals( ts.convertViewportPixelsToSeconds(0), 22.5 );
  t.equals( ts.convertViewportPixelsToSeconds(250), 30 );
  t.equals( ts.convertViewportPixelsToSeconds(500), 37.5 );
  ts.scroll = 1;
  t.equals( ts.convertViewportPixelsToSeconds(0), 45 );
  t.equals( ts.convertViewportPixelsToSeconds(250), 52.5 );
  t.equals( ts.convertViewportPixelsToSeconds(500), 60 );
  t.end();
});
