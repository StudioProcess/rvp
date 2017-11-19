import * as loading from '../actions/loading'

export interface State {
  readonly loading: boolean
}

const initialState: State = {
  loading: false
}

export function reducer(state: State = initialState, action: loading.Actions): State {
  switch (action.type) {
    case loading.LOADING_START:
      return {loading: true}
    case loading.LOADING_FINISH:
      return {loading: false}
    default:
      return state;
  }
}

export const getIsAppLoading = (state: State) => state.loading
