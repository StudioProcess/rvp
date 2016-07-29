import { Project, Track, Annotation } from './shared/models';

// Utility function from Redux to combine reducers. Expects an object with state property keys mapped to reducer functions. See: http://redux.js.org/docs/api/combineReducers.html
const combineReducers = (reducers) => {
  return (state = {}, action) => {
    return Object.keys(reducers).reduce( (nextState, key) => {
      nextState[key] = reducers[key]( state[key], action );
      return nextState;
    }, {});
  };
};

export const stubReducer = (state, action) => {
  switch (action.type) {
    default:
      return state;
  }
}

export const annotationReducer = (state:Project, action) => {
  // log.debug(action, state);

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
      state.timeline.tracks.forEach((track) =>  {
        if (action.payload.track == track) {
          track.annotations.push(action.payload.annotation);
        }
      });
      return state;

    case 'DELETE_ANNOTATION':
      return state;

    case 'SELECT_ANNOTATION':
        state.timeline.tracks.forEach((track) => {
          track.annotations.forEach((annotation) => {
            // set annotation from payload as selected
            if (action.payload == annotation) {
              annotation.isSelected = true;
            } else { // deselect rest of annotations
              annotation.isSelected = false;
            }
          });
        });
        return state;

    case 'DESELECT_ANNOTATIONS':
      state.timeline.tracks.forEach((track) => {
        track.annotations.forEach((annotation) => {
          annotation.isSelected = false;
        });
      });
    return state;

    case 'DELETE_SELECTED_ANNOTATION':
      state.timeline.tracks.forEach((track) => {
        track.annotations.forEach((annotation) => {
          if(annotation.isSelected == true) {
            // delete annotation
            if(track.annotations.indexOf(annotation) >= 0){
              track.annotations.splice(track.annotations.indexOf(annotation), 1);
            }
          }
        });
      });
    return state;

    case 'ADD_TRACK':
      let newTrack:Track;
      newTrack.color = (Math.random()*0xFFFFFF<<0).toString(16);
      newTrack.fields = {
        title: 'New Track'
      }
      newTrack.annotations = [];

      state.timeline.tracks.push(newTrack);
    return state;

    case 'DELETE_TRACK':
    return state;

    default:
      return state;
  }
}

export const masterReducer = (state, action) => {
  return annotationReducer(state, action);
};
