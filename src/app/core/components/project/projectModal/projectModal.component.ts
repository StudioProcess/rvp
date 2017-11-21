import {
  Component, ChangeDetectionStrategy, EventEmitter,
  Output, OnDestroy
} from '@angular/core'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-projectmodal',
  templateUrl: 'projectModal.component.html',
  styleUrls: ['projectModal.component.scss']
})
export class ProjectModalComponent implements OnDestroy {
  @Output() readonly onExportProject = new EventEmitter()
  @Output() readonly onResetProject = new EventEmitter()

  exportProject() {
    this.onExportProject.emit()
  }

  resetProject() {
    this.onResetProject.emit()
  }

  ngOnDestroy() {
    this.onExportProject.complete()
  }
}
