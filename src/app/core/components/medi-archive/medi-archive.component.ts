import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { FormGroup, FormControl } from '@angular/forms'
import { HttpClient, HttpHeaders } from '@angular/common/http'
// import { Observable } from 'rxjs'

import { from } from 'rxjs'

@Component({
  selector: 'rv-medi-archive',
  templateUrl: './medi-archive.component.html',
  styleUrls: ['./medi-archive.component.scss'],
  // encapsulation: ViewEncapsulation.Native
})
export class MediArchiveComponent implements OnInit {

  mediaArchiveForm = new FormGroup({
    video: new FormControl(),
    annotations: new FormControl()
  })

  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.hasOwnProperty('video') && params.hasOwnProperty('annotations')) {
        console.log(params)
        this.mediaArchiveForm.setValue({
          video: params.video,
          annotations: params.annotations
        })
      }
    })
  }

  loadProjectFromUrl() {
    console.log(this.mediaArchiveForm.value)

    /*this.http.jsonp(this.mediaArchiveForm.value.video, 'callback').pipe(
    )*/

    this.sendGetRequest(this.mediaArchiveForm.value.video).subscribe(data => {
      console.log(data)
    })

    /*this.fetchGetRequest(this.mediaArchiveForm.value.video).subscribe(data => {
      console.log(data)
    })*/
  }

  public sendGetRequest(url : string) {
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' })
    return this.http.get(url, { responseType: 'text', headers })
  }

  public fetchGetRequest(url : string) {
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
}
