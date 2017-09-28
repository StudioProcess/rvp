import * as project from '../actions/project'

export interface State {
  id: string|null,
  video: any
  timeline: any
  videoBlob: Blob|null
}

const initialState: State = {
  id: null,
  video: null,
  timeline: null,
  videoBlob: null
}

export function reducer(state: State = initialState, action: any): State {
  switch(action.type) {
    case project.PROJECT_FETCHED:
      return {
        ...action.payload.project,
        videoBlob: action.payload.videoBlob
      }
    default:
      return state
  }
}

export const getVideo = (state: State) => state.video

export const getVideoSrc = (state: State) => {
  return state.videoBlob !== null ? URL.createObjectURL(state.videoBlob) : null
}

export const getTimeline = (state: State) => state.timeline
