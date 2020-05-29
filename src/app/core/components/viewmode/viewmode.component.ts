import { Component /*, EventEmitter, Output*/ } from '@angular/core'
import { Store } from '@ngrx/store'
import * as project from '../../../persistence/actions/project'
import * as fromRoot from '../../reducers'
import { Globals } from '../../../common/globals'
// import { ofType, Actions } from '@ngrx/effects'

@Component({
  selector: 'rv-viewmode',
  template: `
    <div class="viewmode-wrapper" [ngClass]="{'active': viewmode_active}" (click)="toggleViewMode($event)">
      <i class="ion-md-eye"></i>
    </div>
  `,
  styles: [`
    .viewmode-wrapper {
      display: inline-block;
      position: relative;
      top: 4px;
      margin: 0 0 0 20px;

    }
    .viewmode-wrapper i {
      font-size: 28px;
      color: #ededed;
    }
    .viewmode-wrapper.active i {
      color: #000;
    }
  `]
})
export class ViewmodeComponent {

  viewmode_active: boolean = false
  // @Output() readonly onViewmodeUpdate = new EventEmitter<project.UpdateProjectViewmodePayload>()
  // readonly onViewmodeUpdate = new EventEmitter<project.UpdateProjectViewmodePayload>()

  constructor(
    // private _actions: Actions,
    private global: Globals,
    private _rootStore: Store<fromRoot.State>
  ) {
    this.global.getValue().subscribe((value) => {
      this.viewmode_active = value
    })
  }

  ngOnInit() {}

  toggleViewMode($event: MouseEvent) {
    this.viewmode_active = ((this.viewmode_active) ? false : true)
    this._rootStore.dispatch(new project.ProjectUpdateViewmode(this.viewmode_active))
    /*
    this._actions.pipe(ofType(project.PROJECT_UPDATE_VIEWMODE)).subscribe((data: any) => {
      window.location.reload()
    })
    */
  }
}
