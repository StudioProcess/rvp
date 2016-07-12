import { Component, OnInit, AfterViewInit, Input, ElementRef } from '@angular/core';
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
  playerOptions = {

  };

  @Input()
  set videoSrc(src) {
    this.playerReady.then(() => {
      this.player.src(src);
    });
  }

  get videoSrc() {
    if (this.player) {
      return this.player.currentSrc();
    }
    return null;
  }

  constructor(public hostElement: ElementRef) {
    let resolveFn;
    this.playerReady = new Promise(function(resolve) {
      resolveFn = resolve;
    });
    this.playerReady.resolve = resolveFn;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.player = videojs('videojs', this.playerOptions, () => {
      // player ready
      this.playerReady.resolve();
      this.fitPlayer();
      window.addEventListener('resize', () => {
        this.fitPlayer();
      });
    });
  }

  fitPlayer() {
    let elementDim = this.hostElement.nativeElement.getBoundingClientRect();
    this.player.width(elementDim.width);
    this.player.height(elementDim.height);
  }

}
