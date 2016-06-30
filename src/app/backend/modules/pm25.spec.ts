import { test } from 'tape';
import createPM from './pm25';



function fixture(groups, events) {
  let pm = createPM({name: 'test_pm25'});
  return pm.init().then(() => {
    return pm.reset();
  }).then(() => {
    return Promise.all(groups.map((group) => {
      return pm.group.create(group);
    }));
  }).then(() => {
    return Promise.all(events.map((event) => {
      return pm.event.create(event);
    }));
  }).then(() => {
    return pm;
  }).catch(err => {
    console.error(err);
  });
}



/**
 * [test description]
 *
 */
test('\n# BASICS', t => {

  let pm;
  t.test('factory function', t => {
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

  t.test('init()', t => {
    pm.init().then(result => {
      t.equal(result.ok, true);
      t.end();
    }).catch(err => {
      t.fail(err);
    });
  });

  t.test('reset()', t => {
    pm.reset().then(result => {
      t.equal(result.ok, true);
      t.end();
    }).catch(err => {
      t.fail(err);
    });
  });

});



/**
 * [test description]
 *
 */
test('\n# GROUPS', t => {
  fixture([], []).then(pm => {

    let group = {
      fields: {
        name: 'test',
        key: 'value'
      }
    };

    t.test('group.create()', t => {
      pm.group.create(group).then(result => {
        t.equals(result.ok, true);
        t.assert(result.id, 'got id ' + result.id);
        t.assert(result.rev, 'got rev ' + result.rev);

        group['_id'] = result.id;
        group['_rev'] = result.rev;
        group['type'] = 'group';
        t.deepEquals(result.group, group);

        t.end();
      }).catch(err => {
        console.error(err);
        t.fail(err.message);
      });
    });

    t.test('group.update()', t => {
      group.fields['foo'] = 'bar';

      pm.group.update(group).then(result => {
        t.equals(result.ok, true);
        t.equals(result.id, group['_id']);
        t.assert(result.rev, 'got rev ' + result.rev);

        group['_id'] = result.id;
        group['_rev'] = result.rev;
        t.deepEquals(result.group, group);

        t.end();
      }).catch(err => {
        console.error(err);
        t.fail(err.message);
      });
    });

    t.test('group.delete()', t => {
      pm.group.delete(group).then(result => {
        t.equals(result.ok, true);
        t.equals(result.id, group['_id']);
        t.assert(result.rev, 'got rev ' + result.rev);
        //
        // group['_id'] = result.id;
        // group['_rev'] = result.rev;
        // t.deepEquals(result.group, group);

        t.end();
      }).catch(err => {
        console.error(err);
        t.fail(err.message);
      });
    });

    t.test('groups.all()', t => {
      let group2 = {
        fields: {
          name2: 'test2',
          key2: 'value2'
        }
      };
      let saved1, saved2
      pm.groups.all().then(result => {
        t.equals(result.total_rows, 0);
        return Promise.all([
          pm.group.create(group),
          pm.group.create(group2)
        ]);
      }).then(result => {
        t.equals(result[0].ok, true);
        t.equals(result[1].ok, true);
        saved1 = result[0].group;
        saved2 = result[1].group;
        return pm.groups.all();
      }).then(result => {
        console.log(result);
        t.equals(result.total_rows, 2);
        // TODO: order of results is not defined
        // t.deepEquals(result.rows[0].doc, saved2);
        // t.deepEquals(result.rows[1].doc, saved1);
        t.end();
      }).catch(err => {
        console.error(err);
        t.fail(err.message);
      });
    });

  });
});


/**
 * [test description]
 *
 */
test('\n# EVENTS', t => {

  let g1 = {
    fields: {
      key11: 'value11',
      key12: 'value12',
      key13: 'value13'
    }
  };

  let g2 = {
    fields: {
      key21: 'value21',
      key22: 'value22',
      key23: 'value23'
    }
  };

  let g3 = {
    fields: {
      key31: 'value31',
      key32: 'value32',
      key33: 'value33'
    }
  };

  fixture([g1, g2, g3], []).then(pm => {
    pm.groups.all().then(result => {
      console.log(result);
      t.end();
    })
  });

});
