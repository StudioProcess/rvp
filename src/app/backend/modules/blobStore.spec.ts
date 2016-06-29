import { test } from 'tape';
import createBlobStore from './blobStore';

let blobs;
let testData = {hello: "world"};
let testBlob = new Blob([JSON.stringify(testData)]);
let id;

test('init blob store', t => {
  blobs = createBlobStore({name: 'test_blobs'});
  t.equal(typeof blobs, 'object', 'got blob store');
  t.equal(typeof blobs.put, 'function');
  t.equal(typeof blobs.get, 'function');
  t.equal(typeof blobs.del, 'function');
  t.equal(typeof blobs.reset, 'function');
  t.end();
});

test('reset()', t => {
  blobs.reset().then((result) => {
    t.equal(result.ok, true); // result.ok === true;
    t.end();
  }).catch(err => {
    t.end(err);
  });
});

test('put()', t => {
  blobs.put(testBlob).then((result) => {
    id = result;
    t.assert(id, 'got id ' + id);
    t.end();
  }).catch(err => {
    t.end(err);
  });
});

test('get()', t => {
  blobs.get(id).then((result) => {
    t.deepEqual(result, testBlob, 'got what was put in');
    t.end();
  }).catch(err => {
    t.end(err);
  });
});

test('del()', t => {
  blobs.del(id).then((result) => {
    t.equal(result.ok, true);

    return blobs.get(id).then(result => {
      t.fail("shouldn't return result");
    }).catch(err => {
      t.equal(err.error, true);
      t.equal(err.status, 404);
      t.end();
    });

  }).catch(err => {
    t.end(err);
  });
});
