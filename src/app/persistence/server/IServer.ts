import {InjectionToken} from '@angular/core'

import {Observable} from 'rxjs/Observable'

import * as project from '../actions/project'

export interface IServer {
  fetch: Observable<project.ProjectFetched|project.ProjectFetchError>
}

export const SERVER = new InjectionToken<IServer>('server')
