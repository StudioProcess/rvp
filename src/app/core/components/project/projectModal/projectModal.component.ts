import {
  Component, ChangeDetectionStrategy, ChangeDetectorRef, EventEmitter,
  Output, OnDestroy
} from '@angular/core'

import {
  VIDEO_TYPE_BLOB, VIDEO_TYPE_URL, VIDEO_URL_SOURCE_YT,
  VIDEO_URL_SOURCE_VIMEO, VIDEO_URL_SOURCE_CUSTOM
} from '../../../../persistence/model'
import { ImportVideoPayload } from '../../../../persistence/actions/project'
import { Store } from '@ngrx/store'
import * as fromProject from '../../../../persistence/reducers'

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

  videoName = ''
  videoSize = 0
  videoDuration = 0
  tracksCount = 0
  annotationsCount = 0

  constructor(
    private readonly _store: Store<fromProject.State>,
    private readonly _cdr: ChangeDetectorRef,
  ) { }

  ngAfterViewInit() {
    this._store.select(fromProject.getProjectMeta).subscribe(meta => {
      if (meta !== null) {

        let counter = new Date(0, 0, 0, 0, 0, 0)
        this.videoDuration = meta!.getIn(['timeline', 'duration'])!
        this.videoDuration = counter.setSeconds(this.videoDuration)

        const tracks = meta!.getIn(['timeline', 'tracks'])!
        this.tracksCount = tracks.size

        this.annotationsCount = 0
        tracks.forEach((track: any, trackIndex: number) => {
          const annotationStacks = track.get('annotationStacks', null)
          annotationStacks.forEach((annotationStack: any, annotationStackIndex: number) => {
            this.annotationsCount += annotationStack.size
          })
        })
        // console.log(this.videoDuration, this.tracksCount, this.annotationsCount)
        this._cdr.markForCheck()
      }
    })

    this._store.select(fromProject.getProjectVideoBlob).subscribe((videoBlob: any) => {
      if (videoBlob !== null) {
        this.videoName = videoBlob!.name!
        this.videoSize = parseFloat((videoBlob.size / (1024*1024)).toFixed(1))
        // console.log(videoBlob, this.videoName, this.videoSize)
        this._cdr.markForCheck()
      }
    })
  }

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
