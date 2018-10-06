import {
  Component, Input, OnChanges, OnInit,
  Output, ChangeDetectionStrategy,
  SimpleChanges
} from '@angular/core'
import {FormControl} from '@angular/forms'

import {skip} from 'rxjs/operators'

@Component({
  selector: 'rv-toolbar',
  templateUrl: 'toolbar.component.html',
  styleUrls: ['toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent implements OnInit, OnChanges {
  @Input('inspectorMode') readonly inspectorModeIn: boolean

  inspectorMode = new FormControl(false)

  @Output() readonly onInspectorModeChange = this.inspectorMode.valueChanges.pipe(skip(1))

  ngOnInit() {
    this.inspectorMode.setValue(this.inspectorModeIn)
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.inspectorModeIn !== undefined && !changes.inspectorModeIn.firstChange) {
      const {previousValue, currentValue} = changes.inspectorModeIn
      if(previousValue === undefined || previousValue !== currentValue) {
        console.log('overwrite formcontrol')
        this.inspectorMode.setValue(currentValue)
      }
    }
  }
}
