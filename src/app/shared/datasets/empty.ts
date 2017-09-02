// NOTE: using a lambda here results in the following error:
// Error encountered resolving symbol values statically. Function calls are not supported. Consider replacing the function or lambda with a reference to an exported function
export function getEmptyData() {
  return {
    video: {
      id: null,
      url: null,
    },

    timeline: {
      duration: 60,
      playhead: null,
      zoom: null,
      pan: null,
      tracks: []
    }
  }
};
