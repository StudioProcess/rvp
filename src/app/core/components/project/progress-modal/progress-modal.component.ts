import {
  Component,
  OnInit
} from '@angular/core';

@Component({
  selector: 'rv-progress-modal',
  templateUrl: './progress-modal.component.html',
  styleUrls: ['./progress-modal.component.scss']
})
export class ProgressModalComponent implements OnInit {

  value: number = 0

  constructor() { }

  ngOnInit() {
  }

  updateProgress(value: number) {
    this.value = value
  }
}
