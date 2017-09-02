import { ActionReducerMap } from '@ngrx/store';
import { Project, Track } from './shared/models';
import * as actions from './actions'

export interface State {
  project: Project
}

export const reducers: ActionReducerMap<State> = {
  project: masterReducer
}

export function masterReducer(state:Project, action: actions.Actions):Project {
  // log.debug("reducing", action, state);

  switch (action.type) {
    case actions.HYDRATE: // TODO: probably needs a better name
      // TODO: can this be replaced by something @ngrx/store provides?
      if (action.payload) {
        // log.debug("video: "+action.payload.video); // reset video file
        return action.payload;
      }
      return state;

    case actions.SET_TIMELINE_DURATION:
      state.timeline.duration = action.payload;
      log.debug('setting timeline', action.payload, state);
      return state;

    case actions.UPDATE_ANNOTATION:
      // TODO: optimize with immutable data structures
      state.timeline.tracks.forEach((track) => {
        let index = track.annotations.indexOf(action.payload.old);
        if (index >= 0) {
          track.annotations[index] = action.payload.new;
        }
      });
      return state;

    case actions.ADD_ANNOTATION:
      state.timeline.tracks.forEach((track) =>  {
        if (action.payload.track == track) {
          track.annotations.push(action.payload.annotation);
        }
      });
      return state;

    case actions.SELECT_ANNOTATION:
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

    case actions.DESELECT_ANNOTATION:
      state.timeline.tracks.forEach((track) => {
        track.annotations.forEach((annotation) => {
          annotation.isSelected = false;
        });
      });
      return state;

    case actions.DELETE_SELECTED_ANNOTATION:
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

    case actions.ADD_TRACK:
      let newTrack:Track = {
        annotations: [],
        color: '#' + ('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6),
        fields: { title: '' }
      };
      state.timeline.tracks.push(newTrack);
      return state;

    case actions.DELETE_TRACK:
      state.timeline.tracks.forEach((track) => {
        if(track == action.payload.track) {
          state.timeline.tracks.splice(state.timeline.tracks.indexOf(track), 1);
        }
      });
      return state;

    case actions.SET_TRACK_TITLE:
      action.payload.track.fields.title = action.payload.title;
      return state;

    default:
      return state;
  }
}
