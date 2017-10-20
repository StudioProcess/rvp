import * as player from '../actions'

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
    case player.PLAYER_CREATE_SUCCESS:
    case player.PLAYER_DESTROY_SUCCESS:
      return initialState
    case player.PLAYER_SET_CURRENT_TIME:
      return {...state, currentTime: action.payload.currentTime}
    default:
      return state
  }
}

export const getIsPaused = (state: State) => state.isPaused

export const getCurrentTime = (state: State) => {
  return state.currentTime
}
