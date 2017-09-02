export const getTutorialData = () => ({

  video: {
    id: null,
    url: '',
    meta: {
      filename: '',
      length: '',
      resolution: ''
    }
  },

  timeline: {
    duration: 120, // 2:00 min
    playhead: 1 * 60, // 1 min
    zoom: 1,
    pan: 0,
    tracks: [
      // 1st track
      {
        color: '#f6d751', // '#ff3d3d', // red
        fields: {
          title: 'Example Track'
        },
        annotations: [
          {
            utc_timestamp: 10,
            duration: 0,
            fields: {
              title: '10 seconds',
              description: 'Marks 10 seconds elapsed.'
            }
          },
          {
            utc_timestamp: 60,
            duration: 10,
            fields: {
              title: '1 min',
              description: 'Marks one minute elapsed. Duration is 10 seconds.'
            }
          },
          {
            utc_timestamp: 80,
            duration: 0,
            fields: {
              title: '80 seconds',
              description: 'Marks 1 minute 20 seconds elapsed'
            }
          }
        ]
      },

      // 2nd track
      {
        color: '#FE5F55', //'#2870f4', // blue
        fields: {
          title: 'Some durations'
        },
        annotations: [
          {
            utc_timestamp: 30,
            duration: 1,
            fields: {
              title: '1 sec',
              description: 'A one second long annotation at 30 seconds.'
            }
          },
          {
            utc_timestamp: 60,
            duration: 2,
            fields: {
              title: '2 secs',
              description: 'A two second long annotation'
            }
          },
          {
            utc_timestamp: 90,
            duration: 4,
            fields: {
              title: '4 secs',
              description: 'A four second long annotation'
            }
          },
          {
            utc_timestamp: 100,
            duration: 8,
            fields: {
              title: '8 secs',
              description: 'An eight second long annotation'
            }
          },
        ]
      },

      // 3nd track
      {
        color: '#5684e3', //'#f4bd28', // orange
        fields: {
          title: 'Mixed'
        },
        annotations: [
          {
            utc_timestamp: 15,
            duration: 0,
            fields: {
              title: 'A',
              description: "We call this annotation 'A'. It's a marker at 0:15 mins."
            }
          },
          {
            utc_timestamp: 30,
            duration: 10,
            fields: {
              title: 'B',
              description: "We call this annotation 'B'. It's at 0:30 mins and lasts 10 seconds."
            }
          },
          {
            utc_timestamp: 75,
            duration: 0,
            fields: {
              title: 'C',
              description: "We call this annotation 'C'. It's a marker at 1:15 mins."
            }
          },
          {
            utc_timestamp: 90,
            duration: 20,
            fields: {
              title: 'D',
              description: "We call this annotation 'D'. It's at 1:30 mins and lasts 20 seconds."
            }
          }
        ]
      }
    ]
  }

});
