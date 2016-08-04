import { Project } from '../models';

export const getEmptyData = () => ({
  video: {
    id: null,
    url: '',
  },

  timeline: {
    duration: 150, // 3:30 min
    playhead: 1 * 60, // 1 min
    zoom: 1,
    pan: 0,
    tracks: []
  }
});
