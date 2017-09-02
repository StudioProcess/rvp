export const getRulerData = () => ({

  video: {
    id: null,
    url: null
  },

  timeline: {
    duration: 210, // 3:30 min
    playhead: null,
    zoom: null,
    pan: null,
    tracks: [
      {
        color: '#333745', //'#f4bd28', // orange
        fields: {
          title: 'Ruler'
        },
        annotations: [
          {
            utc_timestamp: 0,
            duration: 10,
            fields: {
              title: 'Start',
              description: "Right at the beginning of the timeline, this annotation lasts 10 seconds"
            }
          },
          {
            utc_timestamp: 105,
            duration: 0,
            fields: {
              title: 'Midpoint',
              description: "Marks the Midpoint of the timeline at 1:45 min (105 sec)."
            }
          },
          {
            utc_timestamp: 200,
            duration: 10,
            fields: {
              title: 'End',
              description: "This annotation lasts from 3:20 min (200 sec) right till the end of the timeline."
            },
          }
        ]
      }
    ]
  }

});
