import { Project } from '../models';

export const getEmptyData = () => ({
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
});
