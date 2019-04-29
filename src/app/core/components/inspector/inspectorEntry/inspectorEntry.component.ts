import {
  Component, Input, Output,
  OnInit, OnChanges, AfterViewInit,
  EventEmitter, ViewChild, ElementRef,
  ChangeDetectionStrategy, OnDestroy,
  SimpleChanges, HostBinding
} from '@angular/core'

import {
  FormGroup, FormBuilder, AbstractControl,
  Validators, ValidatorFn, ValidationErrors
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
  debounceTime
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
import {TaggingComponent} from '../../tagging/tagging.component'
import {DomService} from '../../../actions/dom.service'

function durationValidatorFactory(): ValidatorFn {
  const durationRegex = /^([0-9]*:){0,2}[0-9]*(\.[0-9]*)?$/

  return (control: AbstractControl): ValidationErrors|null => {
    const valid = durationRegex.test(control.value)
    return !valid ? {'duration': {value: control.value}} : null
  }
}

const durationValidator = Validators.compose([Validators.required, durationValidatorFactory()])

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-inspector-entry',
  templateUrl: 'inspectorEntry.component.html',
  styleUrls: ['inspectorEntry.component.scss']
})
export class InspectorEntryComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
  @Input() readonly entry: Record<AnnotationColorMap>
  @Input() @HostBinding('class.selected') readonly isSelected = false

  @Output() readonly onUpdate = new EventEmitter<project.UpdateAnnotationPayload>()
  @Output() readonly onSelectAnnotation = new EventEmitter<project.SelectAnnotationPayload>()
  @Output() readonly onFocusAnnotation = new EventEmitter<project.PlayerRequestCurrentTimePayload>()

  @ViewChild('formWrapper') private readonly _formRef: ElementRef
  @ViewChild('start') private readonly _startInputRef: ElementRef
  @ViewChild('duration') private readonly _durationInputRef: ElementRef
  @ViewChild('descr') private readonly _descrInputRef: ElementRef

  form: FormGroup|null = null
  isHashTagContainerOpen: boolean = false

  private readonly _subs: Subscription[] = []
  private readonly _tag_container_id = 'tag-container'
  private _hashtagContainer: HTMLElement|null = null
  private _taggingComponentRef: any|null = null

  constructor(
    readonly elem: ElementRef,
    private readonly _fb: FormBuilder,
    private readonly _domService: DomService
  ) {}

  private _mapModel(entry: Record<AnnotationColorMap>) {
    const utc_timestamp = entry.getIn(['annotation', 'utc_timestamp'])
    const duration = entry.getIn(['annotation', 'duration'])
    const description = entry.getIn(['annotation', 'fields', 'description'])

    return {
      utc_timestamp: formatDuration(utc_timestamp),
      duration: formatDuration(duration),
      description
    }
  }

  ngOnInit() {
    const {
      utc_timestamp,
      duration,
      description
    } = this._mapModel(this.entry)

    this.form = this._fb.group({
      utc_timestamp: [utc_timestamp, durationValidator],
      duration: [duration, durationValidator],
      description
    })
  }

  ngAfterViewInit() {

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
        //if(ev.key === '#') {}
      }))

    this._subs.push(
      formKeydown.subscribe((ev: KeyboardEvent) => {
        //if(ev.key === '#' && ! this.isHashTagContainerOpen) {
        if(ev.key === '#') {
          this.hashTag(ev, this._tag_container_id)
        }
        ev.stopPropagation()
      }))

    const validDurationInputKey = (keyCode: number) => {
      return (keyCode >= 48 && keyCode <= 57) || // 0-9
        keyCode === 8 ||                         // backspace
        keyCode === 186 ||                       // :
        keyCode === 190 ||                       // .
        keyCode === 37 ||                        // left arrow
        keyCode === 39                           // right arrow
    }

    this._subs.push(
      durationKeydown.pipe(filter((ev: KeyboardEvent) => !validDurationInputKey(ev.keyCode)))
        .subscribe((ev: KeyboardEvent) => {
          ev.preventDefault()
        }))

    this._subs.push(
      enterHotKey.subscribe((ev: any) => {
        //if(ev.target.nodeName !== 'TEXTAREA') {
        if(ev.target.classList.contains('contenteditable') !== true) {
          ev.target.blur()
        }
      }))

    /*this._subs.push(
      formBlur
        .subscribe((ev: any) => {
          this.removeHashTagContainer()
        }))*/

    this._subs.push(
      formBlur
        .pipe(
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
          const annotation = new AnnotationRecordFactory({
            id: this.entry.getIn(['annotation', 'id']),
            utc_timestamp: parseDuration(utc_timestamp),
            duration: parseDuration(duration),
            fields: new AnnotationFieldsRecordFactory({description})
          })

          this.onUpdate.emit({
            trackIndex: this.entry.get('trackIndex', null),
            annotationStackIndex: this.entry.get('annotationStackIndex', null),
            annotationIndex: this.entry.get('annotationIndex', null),
            annotation
          })
        }))
  }

  ngOnChanges(changes: SimpleChanges) {
    if(this.form !== null && changes.entry !== undefined && !changes.entry.firstChange) {
      const {previousValue, currentValue} = changes.entry
      if(previousValue === undefined || !previousValue.equals(currentValue)) {
        this.form.setValue(this._mapModel(currentValue))
      }
    }
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }

  hashTag(ev: any, tag_container_id: string) {

    if (this.addHashTagContainer(tag_container_id)) {
      //let elem = ev.target as HTMLElement
      this._hashtagContainer = document.getElementById(this._tag_container_id)! as HTMLElement

      //const componentRef = this._domService.instantiateComponent(TaggingComponent)
      this._taggingComponentRef = this._domService.instantiateComponent(TaggingComponent)
      //console.log(this._taggingComponentRef)
      this._taggingComponentRef.instance.closeHashTagContainer.subscribe((ev: any) => {
        this.closeHashTagContainer(ev)
      })
      //this._taggingComponentRef.instance.passed_hashtag = 'OK'

      //const componentRefInstance = this._domService.getInstance(componentRef)
      this._domService.attachComponent(this._taggingComponentRef, this._hashtagContainer)

      this.isHashTagContainerOpen = true
    }
  }

  removeHashTagContainer() {
    if(document.getElementById(this._tag_container_id)) {
      //var node = document.getSelection().anchorNode;
      //this._taggingComponentRef
      //return (node.nodeType == 3 ? node.parentNode : node);
      let elem = document.getElementById(this._tag_container_id)!
      //elem.parentNode.removeNode(true)
      if (elem.parentNode) {
        let parent = elem.parentNode!
        /*if(this._taggingComponentRef) {
          this._taggingComponentRef.destroy()
          console.log(this._taggingComponentRef)
          //parent.removeChild(this._taggingComponentRef.nativeElement)
        }*/
        /*if(this._hashtagContainer) {
          parent.removeChild(this._hashtagContainer)
        }*/
        //detachEvent(, 'blur', onblur)
        parent.removeChild(elem)
        //parent.innerText = ''
        console.log('REMOVE', elem)
        //console.log(this._taggingComponentRef.instance)

        this._hashtagContainer = null
        this.isHashTagContainerOpen = false
      }
    }
  }

  addHashTagContainer(tag_container_id: any) {

    let range = document.getSelection()!.getRangeAt(0)!
    console.log('addHashTagContainer')
    //let modifiers = [0,8] // List of keys to ignore (0 is arrows & 8 is delete in firefox)
    //console.log(range.startContainer.parentNode.className)
    //if(range.startContainer!.parentNode!.className! !== 'hashtag') {
      if(!range.collapsed) {
        range.deleteContents()
      }
      let hashtag_span =  document.createElement('span')
      hashtag_span.appendChild(document.createTextNode('A'))
      hashtag_span.className = 'hashtag'
      let hashtag_container_span = document.createElement('span')
      hashtag_container_span.id = tag_container_id
      hashtag_container_span.style.display = 'inline-block'
      hashtag_span.appendChild(hashtag_container_span)
      range.insertNode(hashtag_span)

      let sel = window.getSelection()
      range.setStartBefore(hashtag_span.childNodes[0])
      range.setEndAfter(hashtag_span.childNodes[0])
      sel.removeAllRanges()
      sel.addRange(range)
    //}

    return true

    /*
    if (document.getSelection) {
      const sel = document.getSelection()!
      if (sel.getRangeAt && sel.rangeCount) {
        let range = sel.getRangeAt(0)
        range.deleteContents()
        let el = document.createElement('div')
        el.innerHTML = '<span id="'+tag_container_id+'" style="display:inline-block;"></span>'

        let frag = document.createDocumentFragment(), node, lastNode
        while (node = el.firstChild) {
          lastNode = frag.appendChild(node)
        }
        range.insertNode(frag)

        // Preserve the selection
        if (lastNode) {
          range = range.cloneRange()
          range.setStartAfter(lastNode)
          range.collapse(true)
          sel.removeAllRanges()
          //console.log(range)
          sel.addRange(range)
        }
        return true
      }
    }
    return false*/
  }

  closeHashTagContainer(ev: any) {
    //console.log('closeHashTagContainer', ev)
    this.removeHashTagContainer()
  }

  htmlBr(description: string) {
    const pat1 = new RegExp('<div>', 'g')
    const pat2 = new RegExp('</div>', 'g')
    return description.replace(pat1, '<br>').replace(pat2, '')
  }
}
