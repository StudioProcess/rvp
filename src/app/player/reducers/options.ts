import {PlayerOptions} from 'video.js'

import {_PLAYER_OPTIONS_} from '../../config/player'

export type State = PlayerOptions

const initialState: State = _PLAYER_OPTIONS_

export function reducer(state: State = initialState, action: any):State {
  switch(action.type) {
    default:
      return state
  }
}
