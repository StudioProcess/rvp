import {Injectable} from '@angular/core'

import {Effect, Actions} from '@ngrx/effects'

import * as project from '../actions/project'

@Injectable()
export class ProjectEffects {

  // TODO:
  @Effect()
  load = this.actions
    .ofType<project.LoadProject>(project.LOAD_PROJECT)

  constructor(private readonly actions: Actions) {}
}
