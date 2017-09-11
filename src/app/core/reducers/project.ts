
export interface State {
  video: any
  timeline: any
}

const initialState: State = {
  video: null,
  timeline: null
}

export function reducer(state: State = initialState, action: any): State {
  return state
}

export const getVideo = (state: State) => state.video

export const getTimeline = (state: State) => state.timeline

