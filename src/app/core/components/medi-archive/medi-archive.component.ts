import { Component, OnInit, ChangeDetectorRef, EventEmitter, Output } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { FormGroup, FormControl } from '@angular/forms'
import { HttpClient/*, HttpHeaders*/ } from '@angular/common/http'
// import { Observable } from 'rxjs'

import { VIDEO_TYPE_URL, VIDEO_URL_SOURCE_CUSTOM } from '../../../persistence/model'
import { ImportVideoPayload } from '../../../persistence/actions/project'

// import { from } from 'rxjs'

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

  @Output() readonly onImportVideo = new EventEmitter<ImportVideoPayload>()
  @Output() readonly onImportProjectMeta = new EventEmitter()

  mediArchiveModal = $('#medi-archive-modal') as any

  mediaArchiveForm = new FormGroup({
    video: new FormControl(),
    annotations: new FormControl()
  })

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient
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

        // console.log(response)
        const metaData = {
          meta: JSON.parse(response.body),
          video: null
        }
        // console.log(metaData)
        this.onImportProjectMeta.emit(metaData)

        // Import Video from URL
        this.onImportVideo.emit({
          type: VIDEO_TYPE_URL,
          source: VIDEO_URL_SOURCE_CUSTOM,
          data: new URL(this.mediaArchiveForm.value.video)
        })

        this.response_annotations_header = 'METADATA LOAD SUCCESS'
        this.response_video_header = 'VIDEO LOADED'

        // this.response_annotations = response
        this.changeDetectorRef.detectChanges()

        this.mediArchiveModal.foundation('close')

        // Reload
        this.router.navigate([''])
        // window.location.reload()

      },
      error => {
        this.response_annotations_header = 'METADATA LOAD ERROR'
        this.response_annotations = error
        this.changeDetectorRef.detectChanges()
      })

    /*this.fetchGetRequest(this.mediaArchiveForm.value.video).subscribe(data => {
      console.log(data)
    })*/
  }

  protected sendGetRequest(url: string) {
    return this.http.get(url, {
      responseType: 'text',
      observe: 'response'
    })
  }

  /*
  protected fetchGetRequest(url : string) {
    return from(
      fetch(
        url,
        {
          // body: JSON.stringify(data),
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
          },
          method: 'GET',
          mode: 'no-cors'
        }
      )
    )
  }
  */
}
