import test from 'tape';
import createBlobStore from '../../app/scripts/modules/blobStore.js';

let blobs;
let testData = {hello: "world"};
let testBlob = new Blob([JSON.stringify(testData)]);
let id;

test('init blob store', (t) => {
  blobs = createBlobStore({name: 'test_blobs'});
  t.pass("factory function");
  blobs.reset().then(() => {
    t.pass("reset()");
    t.end()
  });
});

test('put()', (t) => {
  blobs.put(testBlob).then((result) => {
    id = result;
    t.assert(id, 'got id');
    t.end();
  }).catch((err) => {
    t.end(err);
  });
});

test('get()', (t) => {
  blobs.get(id).then((result) => {
    t.deepEqual(result, testBlob, 'got what was put in');
    t.end();
  }).catch((err) => {
    t.end(err);
  });
});
