import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'app';
  
  ngOnInit() {
    log.debug('app init');
  }
  
  ngAfterViewInit() {
    log.debug("app after view init");
    $(document).foundation();
    this.hideLoadingOverlay();
  }
  
  // TODO: possibly put loading overlay functions in a service
  showLoadingOverlay() {
    document.querySelector('body').classList.add('loading');
  }

  hideLoadingOverlay() {
    document.querySelector('body').classList.remove('loading');
    document.querySelector('.pace').classList.add('pace-inactive');
  }
}
