import { Project } from './shared/models';

export const stubReducer = (state, action) => {
  switch (action.type) {
    default:
      return state;
  }
}

export const annotationReducer = (state:Project, action) => {
  log.debug(action, state);

  switch (action.type) {
    case 'UPDATE_ANNOTATION':
      // TODO: optimize with immutable data structures
      state.timeline.tracks.forEach((track) => {
        let index = track.annotations.indexOf(action.payload.old);
        if (index >= 0) {
          track.annotations[index] = action.payload.new;
        }
      });
      return state;

    case 'ADD_ANNOTATION':
      return state;

    case 'DELETE_ANNOTATION':
      return state;

    default:
      return state;
  }
}

export const masterReducer = (state, action) => {
  return annotationReducer(state, action);
};
