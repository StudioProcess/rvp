import { Component, OnInit, ChangeDetectorRef, EventEmitter, Output } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { FormGroup, FormControl } from '@angular/forms'
import { HttpClient/*, HttpHeaders*/ } from '@angular/common/http'
// import { Observable } from 'rxjs'

import { VIDEO_TYPE_URL, VIDEO_URL_SOURCE_CUSTOM } from '../../../persistence/model'
import { ImportVideoPayload } from '../../../persistence/actions/project'

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

  mediaArchiveForm = new FormGroup({
    video: new FormControl(),
    annotations: new FormControl()
  })

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
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
      }
    })
  }

  /**
   *  CORS has to be set up on the server in order
   *  to get a response into the browser
   *
   *  testurls:
   *  http://localhost:4200/?video=https:%2F%2Fshowcase.rocks%2Fcors%2Fvideo&annotations=https:%2F%2Fshowcase.rocks%2Fcors%2Fjson
   *  https://showcase.rocks/cors/video
   *  https://showcase.rocks/cors/json
   *
   *  http://localhost:4200/?video=https:%2F%2Fmedienarchiv.zhdk.ch%2Fapi%2Fmedia-entries%2Ff5b78e56-a229-4295-a4cc-0311e6534207%2Fmedia-file%2Fdata-stream&annotations=https:%2F%2Fmedienarchiv.zhdk.ch%2Fapi%2Fmedia-entries%2Ff5b78e56-a229-4295-a4cc-0311e6534207%2Fmeta-data%2Fresearch_video:rv_annotations%2Fdata-stream
   */
  loadProjectFromUrl() {
    // console.log(this.mediaArchiveForm.value)

    this.onImportVideo.emit({
      type: VIDEO_TYPE_URL,
      source: VIDEO_URL_SOURCE_CUSTOM,
      data: new URL(this.mediaArchiveForm.value.video)
    })

    /*
    this.sendGetRequest(this.mediaArchiveForm.value.video)
      .subscribe(
        response => {
          // console.log(response)
          this.response_video_header= 'SUCCESS'
          this.response_video = response
          this.changeDetectorRef.detectChanges()
        },
        error => {
          this.response_video_header = 'ERROR'
          this.response_video = error
          this.changeDetectorRef.detectChanges()
        })
    */

    this.sendGetRequest(this.mediaArchiveForm.value.annotations)
    .subscribe(
      (response: any) => {
        //  console.log(response)
        console.log(JSON.parse(response.body))

        this.response_annotations_header = 'SUCCESS'
        this.response_annotations = response
        this.changeDetectorRef.detectChanges()
      },
      error => {
        this.response_annotations_header = 'ERROR'
        this.response_annotations = error
        this.changeDetectorRef.detectChanges()
      })

    /*this.fetchGetRequest(this.mediaArchiveForm.value.video).subscribe(data => {
      console.log(data)
    })*/
  }

  protected sendGetRequest(url : string) {
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
