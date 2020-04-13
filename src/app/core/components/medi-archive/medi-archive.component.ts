import { Component, OnInit, ChangeDetectorRef, EventEmitter, Output } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { FormGroup, FormControl } from '@angular/forms'
import { HttpClient/*, HttpHeaders*/ } from '@angular/common/http'
// import { Observable } from 'rxjs'

import { VIDEO_TYPE_URL, VIDEO_URL_SOURCE_CUSTOM } from '../../../persistence/model'
import { ImportVideoPayload } from '../../../persistence/actions/project'

// import { from } from 'rxjs'

import { MessageService } from '../../actions/message.service'

@Component({
  selector: 'rv-medi-archive',
  templateUrl: './medi-archive.component.html',
  styleUrls: ['./medi-archive.component.scss'],
  // encapsulation: ViewEncapsulation.Native
})
export class MediArchiveComponent implements OnInit {

  response_video: any
  response_annotations: any
  response_video_header: string
  response_annotations_header: string

  @Output() readonly onResetProject = new EventEmitter()
  @Output() readonly onImportProjectMeta = new EventEmitter()
  @Output() readonly onImportVideo = new EventEmitter<ImportVideoPayload>()

  mediArchiveModal = $('#medi-archive-modal') as any

  mediaArchiveForm = new FormGroup({
    video: new FormControl(),
    annotations: new FormControl()
  })

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private _msg: MessageService
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.hasOwnProperty('video') && params.hasOwnProperty('annotations')) {
        // console.log(params)
        this.mediaArchiveForm.setValue({
          video: params.video,
          annotations: params.annotations
        })

        this.loadProjectFromUrl()
      }
    })
  }

  /**
   *  CORS has to be set up on the server in order
   *  to get a response into the browser
   *
   *  testurls:
   *  https://docs.google.com/spreadsheets/d/1LhBoUU3YH7EPGdOI-4jv7BlkU9Fi8gvY-dmHgcooBbg/edit?usp=sharing
   */
  loadProjectFromUrl() {

    // Import Metadata frmo URL
    this.sendGetRequest(this.mediaArchiveForm.value.annotations).subscribe(
      (response: any) => {

        // complete project reset before
        this.onResetProject.emit(false)

        // after reset, load metada/video
        setTimeout(() => {
          const metaData = {
            meta: JSON.parse(response.body),
            video: null
          }
          this.onImportProjectMeta.emit(metaData)

          // Import Video from URL
          this.onImportVideo.emit({
            type: VIDEO_TYPE_URL,
            source: VIDEO_URL_SOURCE_CUSTOM,
            data: new URL(this.mediaArchiveForm.value.video)
          })

          this._msg.msgData.subscribe((res: any) => {
            // console.log('MSG', res)
            if (res.hasOwnProperty('videoImportSuccess')) {

              if (res.videoImportSuccess === true) {
                // this.response_annotations_header = 'METADATA LOAD SUCCESS'
                this.response_annotations = response
                // this.changeDetectorRef.detectChanges()
                this.response_video_header = 'VIDEO LOADED'
                this.mediArchiveModal.foundation('close')

                // Reload
                this.router.navigate(['/'])
              } else {
                // TODO : ERRORHANDLING
              }
            }
          })
        }, 1000)
      },
      error => {
        this.response_annotations_header = 'METADATA LOAD ERROR'
        this.response_annotations = error
        this.changeDetectorRef.detectChanges()
      })
  }

  protected sendGetRequest(url: string) {
    return this.http.get(url, {
      responseType: 'text',
      observe: 'response',
      withCredentials: true
    })
  }
}
