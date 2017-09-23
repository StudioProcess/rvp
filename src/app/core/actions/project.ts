import {Action} from '@ngrx/store'

export const PROJECT_FETCH = '[Project] Fetch'
export const PROJECT_FETCHED = '[Project] Fetched'

export class ProjectFetch implements Action {
  readonly type = PROJECT_FETCH
  constructor(readonly payload: {id: string}) {}
}

export class ProjectFetched implements Action {
  readonly type = PROJECT_FETCHED
  // TODO: adapt payload type
  constructor(readonly payload: any) {}
}

export type Actions = ProjectFetch|ProjectFetched
