export default function createPM() {
  var db;
  // var validateObjects = true;

  /**
   * [init description]
   * @return {[type]} [description]
   */
  function init() {
    db = new PouchDB('pm25'); // create or open db
    // console.log(db);

    var ddocs = [{
      _id: '_design/events',
      views: {
        by_group: {
          map: function (doc) {
            if (doc.type == 'group') {
              emit( [doc._id], 0 );
            } else if (doc.type == 'event') {
              emit( [doc.group], 1 );
            }
          }.toString()
        },
        all: {
          map: function (doc) {
            if (doc.type == 'event') {
              emit( doc._id );
            }
          }.toString()
        }
      }
    }, {
      _id: '_design/groups',
      views: {
        all: {
          map: function (doc) {
            if (doc.type == 'group') {
              emit( doc._id );
            }
          }.toString()
        }
      }
    }];

    return db.bulkDocs(ddocs).catch(function (err) {
      // TODO: expect this error
      // some error (maybe a 409, because it already exists?)
      console.log(err);
    }).then(function () {
      // build indices by querying
      return Promise.all([
        db.query( 'events/by_group', {limit:0} ),
        db.query( 'events/all', {limit:0} ),
        db.query( 'groups/all', {limit:0} )
      ]);
    });
  }

  /**
   * [groupSchema description]
   * @type {Object}
   */
  var groupSchema = {
    "$schema": "http://json-schema.org/schema#",
    "title": "Group",
    "description": "Piecemaker 2.5 Group Object",
    "type": "object",
    "properties": {
      "_id": {
        "type": "string"
      },
      "type": {
        "enum": ["group"]
      },
      "parent": {
        "type": ["string", "null"]
      },
      "fields": {
        "type": "object"
      }
    },
    "additionalProperties": false,
    "required": ["_id", "type"]
  };

  /**
   * [eventSchema description]
   * @type {Object}
   */
  var eventSchema = {
    "$schema": "http://json-schema.org/schema#",
    "title": "event",
    "description": "Piecemaker 2.5 Event Object",
    "type": "object",
    "properties": {
      "_id": {
        "type": "string"
      },
      "type": {
        "enum": ["event"]
      },
      "group": {
        "type": "string"
      },
      "utc_timestamp": {
        "type": "number"
      },
      "event_type": {
        "type": "string"
      },
      "fields": {
        "type": "string"
      }
    },
    "additionalProperties": false,
    "required": ["_id", "type", "group", "utc_timestamp"]
  };


  /**
   * createGroup()
   * createEvent()
   *
   * deleteGroup()
   * deleteEvent()
   *
   * allGroups()
   * allEvents()
   *
   * groupWithEvents()
   *
   */

  function createGroup(group) {
    // TODO: validate group
    return db.post(group);
  }

  function createEvent(event) {
    // TODO: validate event
    return db.post(event);
  }

  function updateGroup(group) {
    return db.put(group);
  }

  function updateEvent(event) {
    return db.put(event);
  }

  function deleteGroup(group) {
    return db.remove(group);
  }

  function deleteEvent(event) {
    return db.remove(event);
  }

  function allGroups() {
    return db.query('groups/all', {include_docs:true});
  }

  function allEvents() {
    return db.query('events/all', {include_docs:true});
  }

  function eventsInGroup(group) {
    return db.query('events/by_group', {
      include_docs:true,
      startkey: [group._id, 0],
      endkey: [group._id, 1, {}],
    });
  }

  // db API
  return {
    init,
    group: {
      create: createGroup,
      update: updateGroup,
      delete: deleteGroup
    },
    groups: {
      all: allGroups
    },
    event: {
      create: createEvent,
      update: updateEvent,
      delete: deleteEvent
    },
    events: {
      all: allEvents,
      in_group: eventsInGroup
    }
  };
};
