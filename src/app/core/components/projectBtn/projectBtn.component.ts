import {Component} from '@angular/core'

@Component({
  selector: 'rv-project-btn',
  template: `
    <a data-open="settings-reveal">
      <i class="ion-ios-folder" title="Project Settings"></i>
      Project
    </a>
    <div class="reveal" id="settings-reveal" data-reveal>
      Test
    </div>
  `,
  styleUrls: ['projectBtn.component.scss']
})
export class ProjectBtnComponent {}
