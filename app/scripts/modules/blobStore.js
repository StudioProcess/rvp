/**
 * Blob Store module
 * @module modules/blobStore
 */

import uuid from 'node-uuid';
import docuri from 'docuri';

/**
 * factory function for blob store objects
 */
export default function createBlobStore() {
  /**
   * pouch db instance
   * @private
   */
  let db;

  /**
   * function to pack/unpack an object with id and rev properties into a single id string
   * @private
   */
  let route;

  init();

  /**
   * @private
   */
  function init() {
    db = new PouchDB('blobs'); // create or open db
    route = docuri.route('doc/:id/rev/:rev');
  }

  /**
   * create or update blobs
   * @param  {Blob} blob - data
   * @param  [id] - existing id to update, undefined to create
   * @return {Promise} resolves to an id with which to get() or del() the blob later
   */
  function put(blob, id) {
    let doc = route(id);

    if (doc) { // with docURI parameter (and valid)
      return db.putAttachment(doc.id, doc.id, doc.rev, blob, blob.type).then((result) => {
        return route(result); // result.id, result.rev => docURI
      });
    } else { // without docURI parameter -> new id
      let newId = uuid.v4(); // new random UUID
      return db.putAttachment(newId, newId, blob, blob.type).then((result) => {
        return route(result); // result.id, result.rev => docURI
      });
    }
  }

  /**
   * retrieve blob
   * @param  id - id of the blob
   * @return {Promise} resolves to blob data
   */
  function get(id) {
    let doc = route(id);
    return db.getAttachment(doc.id, doc.id);
  }

  /**
   * delete blob
   * @param  id - id of the blob
   * @return {Promise} resolves to an object with an 'ok' property of true
   */
  function del(id) {
    let doc = route(id);
    return db.removeAttachment(doc.id, doc.id, doc.rev);
  }

  return {
    put,
    get,
    del
  };
}
