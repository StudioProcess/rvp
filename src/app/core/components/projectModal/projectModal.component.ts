import {Component} from '@angular/core'

@Component({
  selector: 'rv-projectmodal',
  template: `
    <div>
      <h2><i class="ion-ios-folder icon-title" title="Project Settings"></i>Project</h2>
      <button class="close-button" data-close aria-label="Close modal" type="button">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `,
  styleUrls: ['projectModal.component.scss']
})
export class ProjectModalComponent {}
