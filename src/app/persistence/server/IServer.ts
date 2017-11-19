import {InjectionToken} from '@angular/core'

import {Observable} from 'rxjs/Observable'

import * as project from '../actions/project'

export interface IServer {
  readonly fetch: Observable<project.ProjectFetchSuccess|project.ProjectFetchError>
}

export const SERVER = new InjectionToken<IServer>('server')
