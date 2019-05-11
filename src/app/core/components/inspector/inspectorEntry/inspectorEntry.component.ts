import {
  Component, Input, Output,
  OnInit, OnChanges, AfterViewInit,
  EventEmitter, ViewChild, ElementRef,
  ChangeDetectionStrategy, OnDestroy,
  SimpleChanges, HostBinding, HostListener,
  ViewEncapsulation,
  //ChangeDetectorRef
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

import {
  swapHashtag, removeHashTagPopupContainer, addHashTagPopupContainer,
  handleHashtagInput, encloseHashtags
} from '../../../../lib/hashtags'

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
  encapsulation: ViewEncapsulation.None,
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
  @Output() readonly onHashtagsUpdate = new EventEmitter<project.UpdateProjectHashtagsPayload>()

  @ViewChild('formWrapper') private readonly _formRef: ElementRef
  @ViewChild('start') private readonly _startInputRef: ElementRef
  @ViewChild('duration') private readonly _durationInputRef: ElementRef
  @ViewChild('descr') private readonly _descrInputRef: ElementRef

  @HostListener('click', ['$event', '$event.target'])
    onClick(event: MouseEvent, target: HTMLElement) {
      this.removeHashTag(target)
    }

  form: FormGroup|null = null

  private readonly _subs: Subscription[] = []

  // #Hashtags
  readonly tagContainerClass = 'hashtag'
  readonly tagContainerCloseClass = 'hashtag-close'
  readonly tagPopupContainerId = 'tag-container'
  hashtagContainer: HTMLElement|null = null
  taggingComponentRef: any|null = null
  isHashTagPopupContainerOpen: boolean = false

  constructor(
    readonly elem: ElementRef,
    private readonly _fb: FormBuilder,
    private readonly _domService: DomService,
    //private readonly _changeDetector: ChangeDetectorRef
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
        console.log('FOCUS', this.entry.get('annotation', null))
        encloseHashtags(ev)

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
        if(this.isHashTagPopupContainerOpen) {
          handleHashtagInput(this, ev)
        } else {
          //console.log(ev)
          if(ev.keyCode === 191 || ev.key === '#') {
            this.addHashTag(ev)
          }
          //if(hashTagActionsInputKeys(ev.keyCode)) {}
        }
      }))

    /*const hashTagActionsInputKeys = (keyCode: number) => {
      return keyCode === 32
    }*/

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


    this._subs.push(
      formBlur
        .subscribe((ev: any) => {
          /*ev.target.childNodes.forEach(function (item: HTMLElement) {
            if(item.nodeType != Node.TEXT_NODE) {
              console.log('remove no TEXT_NODE', item)
              item.remove()
            }
          })*/
          //removeHashTagPopupContainer(this)
        }))


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

          //description = this.htmlBr(description)
          description = this.removeDescriptionNodes(description)
          this.saveHashtags(description)
          //console.log('item', description_text)
          console.log('formBlur', description)
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

  saveHashtags(description: string) {
    const hashtags = description.match(/#\w+/g)
    this.onHashtagsUpdate.emit({
      hashtags
    })
  }

  removeDescriptionNodes(description: string) {
    //const description_node = document.createRange().createContextualFragment(description)
    // description_node.childNodes.forEach(function (item: HTMLElement) {
    const description_node = new DOMParser().parseFromString(description, 'text/html').body.childNodes
    //console.log('description_node', description_node)
    let description_text = ''
    description_node.forEach(function (item: HTMLElement) {
      if(item.nodeType == Node.TEXT_NODE) {
        description_text += item.textContent
      }
    })
    this.isHashTagPopupContainerOpen = false
    return description_text
  }

  addHashTag(ev: any) {
    if(! this.isHashTagPopupContainerOpen) {
      //this.addHashTagContainer()
      addHashTagPopupContainer(this)

      //let elem = ev.target as HTMLElement
      this.hashtagContainer = document.getElementById(this.tagPopupContainerId)! as HTMLElement

      //const componentRef = this._domService.instantiateComponent(TaggingComponent)
      this.taggingComponentRef = this._domService.instantiateComponent(TaggingComponent)

      // subscribe to tagging components onClickOutside event
      this.taggingComponentRef.instance.closeHashTagContainer.subscribe((ev: any) => {
        removeHashTagPopupContainer(this)
      })

      this.taggingComponentRef.instance.passHashTagToContent.subscribe((data: any) => {
        swapHashtag(this, data.hashtag)
      })

      this.taggingComponentRef.instance.passed_hashtag = '#'
      //const componentRefInstance = this._domService.getInstance(componentRef)
      this._domService.attachComponent(this.taggingComponentRef, this.hashtagContainer)

      this.isHashTagPopupContainerOpen = true
    }
  }

  removeHashTag(target: HTMLElement) {
    if(target.classList.contains(this.tagContainerCloseClass)) {
      const p = target.parentNode as HTMLElement
      if(p.classList.contains(this.tagContainerClass)) {
        p.parentNode!.removeChild(p)
        this.isHashTagPopupContainerOpen = false
      }
    }
  }

  addHashTagContainer() {
    /*
    let html = '<span class="'+this.tagContainerClass+'">'
    html += '</span>'
    let range = document.getSelection().getRangeAt(0)
    let fragment = document.createRange().createContextualFragment(html)
    range.insertNode(fragment)
    */
    //return new Promise(resolve => {
    let range = document.getSelection()!.getRangeAt(0)!
    if(!range.collapsed) {
      range.deleteContents()
    }
    let hashtag_span = document.createElement('span')
    hashtag_span.className = this.tagContainerClass
    hashtag_span.appendChild(document.createTextNode('#'))
    //hashtag_span.contentEditable = false
    //hashtag_span.style.display = 'inline-block'

    //let hashtag_span_text = document.createElement('span')
    //hashtag_span_text.className = 'hashtag-text'
    //hashtag_span_text.contentEditable = true

    // let hashtag_popup_container_span = document.createElement('span')
    // hashtag_popup_container_span.id = this.tagPopupContainerId
    // hashtag_popup_container_span.style.display = 'inline-block'
    //hashtag_popup_container_span.contentEditable = false

    //let hashtag_span_close = document.createElement('span')
    //hashtag_span_close.className = this.tagContainerCloseClass +' ion-ios-close-circle'
    //hashtag_span_close.style.display = 'inline-block'

    //hashtag_span.appendChild(document.createTextNode(''))
    //hashtag_span.appendChild(hashtag_popup_container_span)
    //hashtag_span.appendChild(hashtag_span_text)
    //hashtag_span_text.appendChild(document.createTextNode('#'))
    //hashtag_span.appendChild(hashtag_span_close)
    //hashtag_span.insertBefore(document.createTextNode('#'), hashtag_span_close)

    //console.log(hashtag_span)
    range.insertNode(hashtag_span)
    //range.surroundContents(hashtag_span)
    //range.insertNode(hashtag_popup_container_span)
    //range.insertNode(hashtag_span)


    // let sel = document.getSelection()
    // range.setStartBefore(hashtag_span.childNodes[0])
    // range.setEndAfter(hashtag_span.childNodes[0])
    // sel!.removeAllRanges()
    // sel!.addRange(range)

    let sel = document.getSelection()!
    range = range!.cloneRange()
    range!.setStartAfter(hashtag_span)
    range!.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)

    return true
      /*
      setTimeout(() => {
        resolve(true)
      }, 10)
    })*/
  }

  htmlBr(description: string) {
    const pat1 = new RegExp('<div>', 'g')
    const pat2 = new RegExp('</div>', 'g')
    return description.replace(pat1, '<br>').replace(pat2, '')
  }
}
