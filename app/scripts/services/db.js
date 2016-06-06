import createPM from '../modules/pm25';
import createBlobStore from '../modules/blobStore';

export default function dbFactory() {
  let blobs = createBlobStore();
  return createPM();
}
