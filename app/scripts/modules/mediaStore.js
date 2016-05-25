// FIXME

import docuri from 'docuri';

export default function createMediaStore() {
  var db;

  function init() {
    db = new PouchDB('media'); // create or open db
  }

  function packIdRev(doc) {
    return "doc/" + doc.id + "/rev/" + doc.rev;
  }

  function unpackIdRev(docURI) {
  }

  function put(blob) {
    // TODO: generate UUID
    // wait for success, return docURI for id/rev
    return db.putAttachment(id, id, blob, blob.type);
  }

  function get(id) {
    return db.getAttachment(id, id);
  }

  function del(id) {
    return db.removeAttachment();
  }

  return {
    init,
    put,
    get
  };
}
