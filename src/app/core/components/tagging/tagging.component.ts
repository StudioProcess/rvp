import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  //HostBinding,
  //ViewChild,
  //ChangeDetectorRef,
  ElementRef,
  SimpleChanges,
  //ViewEncapsulation,
  //ViewContainerRef,
} from '@angular/core'

import {Store} from '@ngrx/store'
import * as fromProject from '../../../persistence/reducers'

//import {FormControl} from '@angular/forms'
//import {MatAutocompleteModule} from '@angular/material/autocomplete'
//import {MatInput} from '@angular/material'

@Component({
  selector: 'rv-tagging',
  host: {
    '(document:click)': 'onClickOutside($event)',
  },
  template: `
    <div class="tagging-list-container" contenteditable="false">
      {{passed_hashtag_2}}
      <span #tag_editable contenteditable="false" id="tag_editable">{{passed_hashtag}}</span>
      <ul class="tagging-list" contenteditable="false">
        <li *ngFor="let option of options" [value]="option" [type]="option"
          (click)="selectHashtag($event, option)">
          {{option}}
        </li>
      </ul>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
    }
    .tagging-list-container {
      margin-top: -20px;
      margin-left: -10px;
      min-width: 100px;
      padding: 10px;
      background-color: rgba(255, 255, 255, 0.9);
      color: #000;

    }
    #tag_editable {
    }
    .tagging-list {
      padding: 0;
      margin: 5px 0 0 0;
      list-style: none;
    }
  `],
})
export class TaggingComponent implements OnInit {

  options: string[] = []
  options_init: string[] = []

  @Input() passed_hashtag: string

  @Output() closeHashTagContainer: EventEmitter<any> = new EventEmitter()

  constructor(
    private _eref: ElementRef,
    private readonly _store: Store<fromProject.State>,
    //private _changeDetector: ChangeDetectorRef
    //private _vcRef: ViewContainerRef,
  ) {
    this._store.select(fromProject.getProjectMeta).subscribe(meta => {
      const hashtags = meta!.getIn(['hashtags', 'list'])!
      this.options = (hashtags) ? hashtags : []
      this.options_init = this.options
    })
    console.log("HASHTAGS", this.options)
  }

  ngOnInit() {}

  ngAfterViewInit() {}

  //ngOnChanges(changes: { [passed_hashtag: string]: SimpleChange }) {
  ngOnChanges(changes: SimpleChanges) {
    //console.log("CHANGE", changes)
  }

  ngOnDestroy() {
    console.log("ngOnDestroy")
  }

  onClickOutside(ev: any) {
    if (!this._eref.nativeElement.contains(ev.target)) {
      this.closeHashTagContainer.emit({close: true})
    }
  }

  updateHashtags(hashtag: string) {
    this.passed_hashtag = hashtag
    const filtered = this.options_init.filter((option) => {
      return option.includes(hashtag.substr(1))
    })
    this.options = filtered
    //this._changeDetector.markForCheck()
  }

  selectHashtag(event: any, hashtag: string) {
    console.log(event, hashtag)
  }
}
