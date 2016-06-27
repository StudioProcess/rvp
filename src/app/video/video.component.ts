import { Component, OnInit } from '@angular/core';

import * as videojs from 'video.js';

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
    console.log('videojs', videojs);
  }

}
