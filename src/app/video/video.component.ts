import { Component, OnInit } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'app-video',
  templateUrl: 'video.component.html',
  styleUrls: ['video.component.css']
})


// IMPORT FILEDRAGGER.JS

export class VideoComponent implements OnInit {

  title = 'video works!';

  constructor() {}

  ngOnInit() {
  }

}
