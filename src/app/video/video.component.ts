import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import 'video.js'; // creates global videojs() function

@Component({
  moduleId: module.id,
  selector: 'app-video',
  templateUrl: 'video.component.html',
  styleUrls: ['video.component.css']
})
export class VideoComponent implements OnInit, AfterViewInit {

  player; // VideoJS Player instance
  playerReady; // Promise. resolves when player is ready

  @Input()
  set videoSrc(src) {
    this.playerReady.then(() => {
      // console.log('player ready', this.player);
      this.player.src(src);
    });
  }

  get videoSrc() {
    if (this.player) {
      return this.player.currentSrc();
    }
    return null;
  }

  constructor() {
    let resolveFn;
    this.playerReady = new Promise(function(resolve) {
      resolveFn = resolve;
    });
    this.playerReady.resolve = resolveFn;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.player = videojs('videojs');
    this.player.fluid(true);
    this.playerReady.resolve();
  }

}
