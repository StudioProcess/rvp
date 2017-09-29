export interface State {
  isPaused: boolean
  currentTime: number
}

const initialState: State = {
  isPaused: true,
  currentTime: 0
}

export function reducer(state: State=initialState, action: any): State {
  switch(action.type) {
    default:
      return state
  }
}

export const getIsPaused = (state: State) => state.isPaused

export const getCurrentTime = (state: State) => state.currentTime
