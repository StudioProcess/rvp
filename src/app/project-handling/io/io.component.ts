import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'app-io',
  templateUrl: 'io.component.html',
  styleUrls: ['io.component.css']
})
export class IoComponent implements OnInit {

  @Input() videoSrc:string;
  @Output() projectExport = new EventEmitter<void>();
  @Output() projectImport = new EventEmitter<File>();

  constructor() { }

  ngOnInit() {
  }

  importFileSelected(e) {
    let fileList = e.target.files;
    if (!fileList.length) return; // no file selected
    let file = fileList[0];
    this.projectImport.emit(file);
    e.preventDefault();
    log.debug('import file selected', file);
  }

  exportButtonClicked(e) {
    this.projectExport.emit(null);
    e.preventDefault();
    log.debug('export button clicked');
  }

}
