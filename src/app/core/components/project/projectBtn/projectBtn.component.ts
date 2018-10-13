import {Component} from '@angular/core'

@Component({
  selector: 'rv-projectbtn',
  template: `
    <a>
      <i class="ion-ios-folder" title="Project Settings"></i><span class="show-for-large"> Project</span>
    </a>
  `,
  styleUrls: ['projectBtn.component.scss']
})
export class ProjectBtnComponent {}
