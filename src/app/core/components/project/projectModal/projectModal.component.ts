import {
  Component, ChangeDetectionStrategy, EventEmitter,
  Output, OnDestroy
} from '@angular/core'

import {
  VIDEO_TYPE_BLOB, VIDEO_TYPE_URL, VIDEO_URL_SOURCE_YT,
  VIDEO_URL_SOURCE_VIMEO, VIDEO_URL_SOURCE_CUSTOM
} from '../../../../persistence/model'
import { ImportVideoPayload } from '../../../../persistence/actions/project'

function extractFile(e: any): File | null {
  if (e && e.target && e.target.files && e.target.files.length) {
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
  @Output() readonly onImportVideo = new EventEmitter<ImportVideoPayload>()
  @Output() readonly onExportProject = new EventEmitter()
  @Output() readonly onExportProjectAsText = new EventEmitter()
  @Output() readonly onResetProject = new EventEmitter()
  @Output() readonly onNewProject = new EventEmitter()

  youtubeURL = ''
  vimeoURL = ''
  customURL = ''

  importProject(e: any) {
    const file = extractFile(e)
    if (file !== null) {
      // console.log(file)
      this.onImportProject.emit(file)
      e.target.value = null
    }
  }

  importVideo(e: any) {
    const file = extractFile(e)
    if (file !== null) {
      this.onImportVideo.emit({
        type: VIDEO_TYPE_BLOB,
        data: file
      })
      e.target.value = null
    }
  }

  exportProject() {
    this.onExportProject.emit()
  }

  exportProjectAsText(type: string) {
    this.onExportProjectAsText.emit(type)
  }

  newProject() {
    this.onNewProject.emit()
  }

  resetProject() {
    this.onResetProject.emit()
  }

  openURL(src: string, url: string) {
    switch (src) {
      case VIDEO_URL_SOURCE_CUSTOM:
        this.onImportVideo.emit({
          type: VIDEO_TYPE_URL,
          source: VIDEO_URL_SOURCE_CUSTOM,
          data: new URL(url)
        })
        break
      case VIDEO_URL_SOURCE_YT:
        this.onImportVideo.emit({
          type: VIDEO_TYPE_URL,
          source: VIDEO_URL_SOURCE_YT,
          data: new URL(url)
        })
        break
      case VIDEO_URL_SOURCE_VIMEO:
        this.onImportVideo.emit({
          type: VIDEO_TYPE_URL,
          source: VIDEO_URL_SOURCE_VIMEO,
          data: new URL(url)
        })
        break
    }

    this.youtubeURL = ''
    this.vimeoURL = ''
    this.customURL = ''
  }

  ngOnDestroy() {
    this.onExportProject.complete()
  }
}
