import { Component, ChangeDetectorRef } from '@angular/core'
import { Globals } from '../../../../common/globals'

@Component({
  selector: 'rv-projectbtn',
  template: `
    <button [disabled]="viewmode_active">
      <i class="ion-ios-folder" title="Project Settings"></i><span class="show-for-medium"> Project</span>
    </button>
  `,
  styleUrls: ['projectBtn.component.scss']
})
export class ProjectBtnComponent {

  viewmode_active: boolean = false

  constructor(
    private global: Globals,
    private readonly _cdr: ChangeDetectorRef
  ) { }


  ngOnInit() {
    this.global.getValue().subscribe((value) => {
      this.viewmode_active = value
      this._cdr.detectChanges()
    })
  }
}
