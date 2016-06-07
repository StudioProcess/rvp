import test from 'tape';
import createBlobStore from '../../app/scripts/modules/blobStore.js';

test('test blob store', (t) => {
  let blobs = createBlobStore({dbName: 'test_blobs'});
  t.ok(true, "hello");
  t.end();
});
