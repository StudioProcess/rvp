import {Component} from '@angular/core'

@Component({
  selector: 'rv-project-btn',
  template: `
    <span data-open="settings-reveal"><i class="ion-ios-folder settings-icon" title="Project Settings"></i>Project</span>
    <div class="reveal" id="settings-reveal" data-reveal>
      Test
    </div>
  `,
  styles: [`
    .settings-icon {
      padding-right: 0.5em;
    }
  `]
})
export class ProjectBtnComponent {}
