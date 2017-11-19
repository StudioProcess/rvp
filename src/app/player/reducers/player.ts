import * as player from '../actions'

export interface State {
  readonly isPaused: boolean
  readonly currentTime: number
  readonly dimensions: {
    readonly width: number
    readonly height: number
  }
}

const initialState: State = {
  isPaused: true,
  currentTime: 0,
  dimensions: {
    width: 0,
    height: 0
  }
}

export function reducer(state: State=initialState, action: player.PlayerActions): State {
  switch(action.type) {
    case player.PLAYER_CREATE_SUCCESS:
    case player.PLAYER_DESTROY_SUCCESS:
      return state
    case player.PLAYER_SET_CURRENT_TIME:
      return {...state, currentTime: action.payload.currentTime}
    case player.PLAYER_SET_DIMENSIONS_SUCCESS:
      return {...state, dimensions: {...action.payload}}
    default:
      return state
  }
}

export const getIsPaused = (state: State) => state.isPaused

export const getCurrentTime = (state: State) => {
  return state.currentTime
}

export const getDimensions = (state: State) => {
  return state.dimensions
}
