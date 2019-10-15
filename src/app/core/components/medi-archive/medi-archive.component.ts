import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { FormGroup, FormControl } from '@angular/forms'

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
    private activatedRoute: ActivatedRoute
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
}
