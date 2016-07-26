import { Project } from './shared/models';

export const stubReducer = (state, action) => {
  switch (action.type) {
    default:
      return state;
  }
}

export const annotationReducer = (state, action) => {
  log.debug(action, state);

  switch (action.type) {
    case 'UPDATE_ANNOTATION':
      // newState = Object.assign({}, state, );
      // find track to change
      // let updateInfo = state.timeline.tracks.reduce( (acc, track) => {
      //   let oldAnnotationIndex = track.annotations.indexOf(action.payload.old);
      //   if (oldAnnotationIndex > 0) return {track, index:oldAnnotationIndex};
      // }, {});
      // log.debug('update', updateInfo);
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
