/**
 * Blob Store module
 * @module modules/blobStore
 */
import _ from 'lodash';
import PouchDB from 'pouchdb';
import uuid from 'node-uuid';
import docuri from 'docuri';

/**
 * factory function for blob store objects
 * @return {BlobStore}
 */
export default function createBlobStore(options) {
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

  init(options);

  /**
   * @private
   */
  function init(opts) {
    options = _.defaults(opts, {
      'name': 'blobs'
    });
    db = new PouchDB(options.name); // create or open db
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

    if (id) { // with id parameter
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

  /**
   * reset database
   * @return {Promise} resolves to an object with an 'ok' property of true
   */
  function reset() {
    return db.destroy().then((result) => {
      db = new PouchDB(options.name);
      return {'ok':true};
    });
  }

  /**
   * BlobStore public API
   * @typedef BlobStore
   */
  return {
    put,
    get,
    del,
    reset
  };
}
