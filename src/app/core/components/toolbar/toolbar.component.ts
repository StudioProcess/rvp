import {
  Component, Input, OnChanges, OnInit,
  Output, ChangeDetectionStrategy,
  SimpleChanges
} from '@angular/core'
import {FormControl} from '@angular/forms'

import {skip, debounceTime} from 'rxjs/operators'

import {_FORM_INPUT_DEBOUNCE_} from '../../../config/form'

@Component({
  selector: 'rv-toolbar',
  templateUrl: 'toolbar.component.html',
  styleUrls: ['toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent implements OnInit, OnChanges {
  @Input('inspectorMode') readonly inspectorModeIn: boolean
  @Input('search') readonly searchIn: string
  @Input('applyToTimeline') readonly applyToTimelineIn: boolean

  inspectorMode = new FormControl(false)
  search = new FormControl(null)
  applyToTimeline = new FormControl(false)

  @Output() readonly onInspectorModeChange = this.inspectorMode.valueChanges.pipe(skip(1))
  @Output() readonly onSearchChange = this.search.valueChanges.pipe(skip(1), debounceTime(_FORM_INPUT_DEBOUNCE_))
  @Output() readonly onApplyToTimelineChange = this.applyToTimeline.valueChanges.pipe(skip(1))

  ngOnInit() {
    this.inspectorMode.setValue(this.inspectorModeIn)
    this.search.setValue(this.searchIn)
    this.applyToTimeline.setValue(this.applyToTimelineIn)
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.inspectorModeIn !== undefined && !changes.inspectorModeIn.firstChange) {
      const {previousValue, currentValue} = changes.inspectorModeIn
      if(previousValue === undefined || previousValue !== currentValue) {
        this.inspectorMode.setValue(currentValue)
      }
    }

    if(changes.applyToTimelineIn !== undefined && !changes.applyToTimelineIn.firstChange) {
      const {previousValue, currentValue} = changes.applyToTimelineIn
      if(previousValue === undefined || previousValue !== currentValue) {
        this.applyToTimeline.setValue(currentValue)
      }
    }

    if(changes.searchIn !== undefined && !changes.searchIn.firstChange) {
      const {previousValue, currentValue} = changes.searchIn
      if(previousValue === undefined || previousValue !== currentValue) {
        this.search.setValue(currentValue)
      }
    }
  }
}
