import * as project from '../actions/project'
import {Timeline} from '../model'

import {getPartitionResult} from '../../lib/array'

export interface State {
  id: string|null
  video: any
  timeline: Timeline|null
  videoBlob: Blob|null
}

const initialState: State = {
  id: null,
  video: null,
  timeline: null,
  videoBlob: null
}

export function reducer(state: State = initialState, action: project.Actions): State {
  switch(action.type) {
    case project.PROJECT_FETCH_SUCCESS:
      return {
        ...action.payload.project,
        videoBlob: action.payload.videoBlob
      }
    case project.PROJECT_UPDATE_ANNOTATION:
      const {trackIndex, annotationIndex, annotation} = action.payload

      if(state.timeline !== null) {
        const track = state.timeline.tracks[trackIndex]
        const {annotations} = track

        const {before, after} = getPartitionResult(annotations, annotationIndex)
        const newAnnotations = before.concat(annotation).concat(after)

        track.annotations = newAnnotations

        return state
      } else {
        return state
      }
    default:
      return state
  }
}

export const getVideo = (state: State) => state.video

export const getVideoObjectURL = (state: State) => {
  return state.videoBlob !== null ? URL.createObjectURL(state.videoBlob) : null
}

export const getTimeline = (state: State) => state.timeline
