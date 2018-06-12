import {PlayerOptions} from 'video.js'

import {_DEFAULT_PLAYER_OPTIONS_} from '../../config/player'

export type State = PlayerOptions

const initialState: State = _DEFAULT_PLAYER_OPTIONS_

export function reducer(state: State = initialState, action: any):State {
  switch(action.type) {
    default:
      return state
  }
}
