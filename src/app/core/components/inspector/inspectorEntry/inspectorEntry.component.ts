import {
  Component, Input, Output,
  OnInit, OnChanges, AfterViewInit,
  EventEmitter, ViewChild, ElementRef,
  ChangeDetectionStrategy, OnDestroy,
  SimpleChanges, HostBinding, HostListener,
  ViewEncapsulation, ChangeDetectorRef,
  // ChangeDetectorRef
} from '@angular/core'

import {
  FormGroup, FormBuilder, FormControl
} from '@angular/forms'

const _VALID_ = 'VALID' // not exported by @angular/forms

import {Record} from 'immutable'

import {
  Subscription, combineLatest,
  merge, fromEvent
} from 'rxjs'

import {
  withLatestFrom, map, filter,
  distinctUntilChanged, buffer,
  debounceTime,
  // tap, delay
} from 'rxjs/operators'

import {formatDuration} from '../../../../lib/time'

import {
  AnnotationColorMap, AnnotationRecordFactory,
  AnnotationFieldsRecordFactory, SelectionSource,
  AnnotationSelectionRecordFactory
} from '../../../../persistence/model'

import {_MOUSE_DBLCLICK_DEBOUNCE_} from '../../../../config/form'

import * as project from '../../../../persistence/actions/project'
import {parseDuration} from '../../../../lib/time'
import {DomService} from '../../../actions/dom.service'
import {HashtagService} from '../../../actions/hashtag.service'
import {Store} from '@ngrx/store'
import * as fromRoot from '../../../reducers'
import * as fromProject from '../../../../persistence/reducers'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  selector: 'rv-inspector-entry',
  templateUrl: 'inspectorEntry.component.html',
  host: {'class': 'inspector-entry-host'},
  styleUrls: ['inspectorEntry.component.scss']
})
export class InspectorEntryComponent extends HashtagService implements OnChanges, OnInit, AfterViewInit, OnDestroy {

  form: FormGroup | null = null
  formatSecond = false
  lastFormatSecond = false
  private readonly _subs: Subscription[] = []

  @Input() readonly entry: Record<AnnotationColorMap>
  @Input() @HostBinding('class.selected') readonly isSelected = false

  @Output() readonly onUpdate = new EventEmitter<project.UpdateAnnotationPayload>()
  @Output() readonly onSelectAnnotation = new EventEmitter<project.SelectAnnotationPayload>()
  @Output() readonly onFocusAnnotation = new EventEmitter<project.PlayerRequestCurrentTimePayload>()
  @Output() readonly onHashtagsUpdate = new EventEmitter<project.UpdateProjectHashtagsPayload>()

  @ViewChild('formWrapper', {static: true}) private readonly _formRef: ElementRef
  @ViewChild('start', {static: true}) private readonly _startInputRef: ElementRef
  @ViewChild('duration', {static: true}) private readonly _durationInputRef: ElementRef
  @ViewChild('descr', {static: true}) readonly _descrInputRef: ElementRef

  @HostListener('click', ['$event', '$event.target'])
  onClick(event: MouseEvent, target: HTMLElement) {
    this.removeHashTag(target)
  }

  constructor(
    readonly elem: ElementRef,
    private readonly _fb: FormBuilder,
    private readonly _store: Store<fromRoot.State>,
    private readonly _cdr: ChangeDetectorRef,
    readonly _domService: DomService,
  ) {
    super(_domService)
  }

  private _mapModel(entry: Record<AnnotationColorMap>) {
    const utc_timestamp = entry.getIn(['annotation', 'utc_timestamp'])
    const duration = entry.getIn(['annotation', 'duration'])
    const description = entry.getIn(['annotation', 'fields', 'description'])

    return {
      utc_timestamp: formatDuration(utc_timestamp, this.formatSecond),
      duration: formatDuration(duration, this.formatSecond),
      description
    }
  }

  ngOnInit() {
    const {
      utc_timestamp,
      duration,
      description
    } = this._mapModel(this.entry)

    this._subs.push(
      this._store.select(fromProject.getProjectSettingsFormatSeconds)
        .subscribe(formatSecond => {
          this.formatSecond = formatSecond
          this._cdr.markForCheck()
        }))

    this.form = this._fb.group({
      utc_timestamp: [utc_timestamp, this.validateDuration.bind(this)],
      duration: [duration, this.validateDuration.bind(this)],
      description
    })
  }

  ngAfterViewInit() {

    // add span nodes around hashtags inside textnodes
    this.encloseHashtags()

    // make sure all hashtags are filtered/saved
    this.saveHashtags(this.entry.getIn(['annotation', 'fields', 'description']))

    const formClick = fromEvent(this._formRef.nativeElement, 'click')
      .pipe(filter((ev: MouseEvent) => ev.button === 0))

    const formDblClick = formClick
      .pipe(
        buffer(formClick.pipe(debounceTime(_MOUSE_DBLCLICK_DEBOUNCE_))),
        map(clicksInBuffer => clicksInBuffer.length),
        filter(clicksInBuffer => clicksInBuffer === 2))

    const formKeyUp = fromEvent(this._descrInputRef.nativeElement, 'keyup')

    const durationKeydown = merge(
      fromEvent(this._startInputRef.nativeElement, 'keydown'),
      fromEvent(this._durationInputRef.nativeElement, 'keydown'))

    const formKeydown = merge(
      durationKeydown,
      fromEvent(this._descrInputRef.nativeElement, 'keydown'))

    const enterHotKey = formKeydown.pipe(filter((ev: KeyboardEvent) => ev.keyCode === 13))

    const formBlur = merge(
      this._store.select(fromProject.getProjectSettingsFormatSeconds),
      fromEvent(this._startInputRef.nativeElement, 'blur'),
      fromEvent(this._durationInputRef.nativeElement, 'blur'),
      fromEvent(this._descrInputRef.nativeElement, 'blur'))

    // Select annotation
    this._subs.push(
      formClick.subscribe((ev: MouseEvent) => {
        this.onSelectAnnotation.emit({
          type: project.AnnotationSelectionType.Default,
          selection: AnnotationSelectionRecordFactory({
            track: this.entry.get('track', null),
            annotationStackIndex: this.entry.get('annotationStackIndex', null),
            annotation: this.entry.get('annotation', null),
            source: SelectionSource.Inspector
          })
        })
        this.encloseHashtags({'replace': true})
      }))

    // Focus annotation
    this._subs.push(
      formDblClick.subscribe(() => {
        this.onFocusAnnotation.emit({
          currentTime: this.entry.get('annotation', null).get('utc_timestamp', null)
        })
      }))

    this._subs.push(
      formKeyUp.subscribe((ev: KeyboardEvent) => {
      }))

    this._subs.push(
      formKeydown.subscribe((ev: KeyboardEvent) => {
        ev.stopPropagation()
        if (this.isHashTagPopupContainerOpen) {
          this.handleHashtagInput(ev)
        } else {
          if (ev.keyCode === 191 || ev.key === '#') {
            this.handleHashTag(ev)
          }
        }
      }))

    const validDurationInputKey = (keyCode: number) => {
      return (keyCode >= 48 && keyCode <= 57) || // 0-9
        keyCode === 8 ||                         // backspace
        keyCode === 186 ||                       // :
        keyCode === 190 ||                       // .
        keyCode === 37 ||                        // left arrow
        keyCode === 39 ||                        // right arrow
        (this.formatSecond && keyCode === 32)   // space
    }

    this._subs.push(
      durationKeydown.pipe(filter((ev: KeyboardEvent) => !validDurationInputKey(ev.keyCode)))
        .subscribe((ev: KeyboardEvent) => {
          ev.preventDefault()
        }))

    this._subs.push(
      enterHotKey.subscribe((ev: any) => {
        // if(ev.target.nodeName !== 'TEXTAREA') {
        if (ev.target.classList.contains('contenteditable') !== true) {
          ev.target.blur()
        }
      }))

    this._subs.push(
      formBlur
        .pipe(
          // delay(100),
          // tap((ev) => {}),
          withLatestFrom(combineLatest(this.form!.valueChanges, this.form!.statusChanges), (_, [form, status]) => {
            return [form, status]
          }),
          filter(([_, status]) => status === _VALID_),
          map(([form]) => form),
          distinctUntilChanged((prev, cur) => {
            return prev.title === cur.title && prev.description === cur.description &&
              prev.utc_timestamp === cur.utc_timestamp && prev.duration === cur.duration
          }))
        .subscribe(({description, utc_timestamp, duration}) => {

          description = this.htmlBr(description)
          description = this.removeNodesFromText(description)
          this.saveHashtags(description)

          const annotation = new AnnotationRecordFactory({
            id: this.entry.getIn(['annotation', 'id']),
            utc_timestamp: parseDuration(utc_timestamp, this.lastFormatSecond),
            duration: parseDuration(duration, this.lastFormatSecond),
            fields: new AnnotationFieldsRecordFactory({description})
          })

          this.onUpdate.emit({
            trackIndex: this.entry.get('trackIndex', null),
            annotationStackIndex: this.entry.get('annotationStackIndex', null),
            annotationIndex: this.entry.get('annotationIndex', null),
            annotation
          })

          setTimeout(() => {
            this.encloseHashtags()
          }, 50)
        }))
  }

  validateDuration(control: FormControl) {
    const durationRegex = /^([0-9]*:){0,2}[0-9]*(\.[0-9]*)?$/
    const secondsRegex = /^([0-9]+)?$/
    const valid = this.formatSecond && secondsRegex.test(control.value) || durationRegex.test(control.value)
    return !valid ? {'duration': {value: control.value}} : null
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.form !== null && changes.entry !== undefined && !changes.entry.firstChange) {
      const {previousValue, currentValue} = changes.entry
      if (previousValue === undefined || !previousValue.equals(currentValue) || this.formatSecond !== this.lastFormatSecond) {
        // console.log(previousValue, currentValue)
        this.form.setValue(this._mapModel(currentValue))
        this.lastFormatSecond = this.formatSecond
      }
    }
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
