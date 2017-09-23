import {InjectionToken} from '@angular/core'

import {Observable} from 'rxjs/Observable'

import * as project from '../../core/actions/project'

export interface IServer {
  fetch: Observable<project.ProjectFetched>
}

export const SERVER = new InjectionToken<IServer>('server')