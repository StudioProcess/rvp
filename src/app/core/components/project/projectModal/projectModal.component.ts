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
  @Output() readonly onImportProject = new EventEmitter()
  @Output() readonly onExportProject = new EventEmitter()
  @Output() readonly onResetProject = new EventEmitter()

  importProject(e: any) {
    if(e && e.target && e.target.files && e.target.files.length > 0) {
      this.onImportProject.emit(e.target.files[0])
    }
  }

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
