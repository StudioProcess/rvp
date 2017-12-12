import {
  Component, ChangeDetectionStrategy, EventEmitter,
  Output, OnDestroy
} from '@angular/core'

function extractFile(e: any): File|null {
  if(e && e.target && e.target.files && e.target.files.length) {
    return e.target.files[0]
  } else {
    return null
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-projectmodal',
  templateUrl: 'projectModal.component.html',
  styleUrls: ['projectModal.component.scss']
})
export class ProjectModalComponent implements OnDestroy {
  @Output() readonly onImportProject = new EventEmitter()
  @Output() readonly onImportVideo = new EventEmitter()
  @Output() readonly onExportProject = new EventEmitter()
  @Output() readonly onResetProject = new EventEmitter()

  youtubeURL: string = ''

  importProject(e: any) {
    const file = extractFile(e)
    if(file !== null) {
      this.onImportProject.emit(file)
      e.target.value = null
    }
  }

  importVideo(e: any) {
    const file = extractFile(e)
    if(file !== null) {
      this.onImportVideo.emit(file)
      e.target.value = null
    }
  }

  exportProject() {
    this.onExportProject.emit()
  }

  resetProject() {
    this.onResetProject.emit()
  }

  openURL(src: string, url: URL) {
    switch(src) {
      case 'youtube':
      break;
      case 'vimeo':
      break;
    }
  }

  ngOnDestroy() {
    this.onExportProject.complete()
  }
}
