import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  SimpleChanges,
} from '@angular/core'

import {Store} from '@ngrx/store'
import * as fromProject from '../../../persistence/reducers'

@Component({
  selector: 'rv-tagging',
  host: {
    '(document:click)': 'onClickOutside($event)',
  },
  styleUrls: ['tagging.component.scss'],
  template: `
    <div class="tagging-list-container" contenteditable="false">
      <span #tag_editable contenteditable="false" id="tag-editable">{{passed_hashtag}}</span>
      <ul class="tagging-list" contenteditable="false">
        <li *ngFor="let option of options" [value]="option" [type]="option"
          (click)="selectHashtag($event, option)"
          contenteditable="false">
          {{option}}
        </li>
      </ul>
    </div>
  `,
})
export class TaggingComponent implements OnInit {

  options: string[] = []
  options_init: string[] = []

  @Input() passed_hashtag: string

  @Output() closeHashTagContainer: EventEmitter<any> = new EventEmitter()
  @Output() passHashTagToContent: EventEmitter<any> = new EventEmitter()

  constructor(
    private _eref: ElementRef,
    private readonly _store: Store<fromProject.State>,
  ) {
    this._store.select(fromProject.getProjectMeta).subscribe(meta => {
      const hashtags = meta!.getIn(['hashtags', 'list'])!
      this.options = (hashtags) ? hashtags : []
      this.options_init = this.options
    })
  }

  ngOnInit() {}

  ngAfterViewInit() {}

  ngOnChanges(changes: SimpleChanges) {}

  ngOnDestroy() {}

  onClickOutside(ev: any) {
    if (!this._eref.nativeElement.contains(ev.target)) {
      this.closeHashTagContainer.emit({close: true})
    }
  }

  updateHashtags(hashtag: string) {
    this.passed_hashtag = hashtag
    const filtered = this.options_init.filter((option) => {
      return ((option) ? option.includes(hashtag.substr(1)) : null)
    })
    this.options = filtered
  }

  selectHashtag(event: any, hashtag: string) {
    this.passHashTagToContent.emit({
      hashtag: hashtag,
      user_input: this.passed_hashtag,
      event: event
    })
  }
}
