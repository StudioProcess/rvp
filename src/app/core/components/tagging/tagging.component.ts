import {
  Component,
  OnInit,
  //Input,
  Output,
  EventEmitter,
  //HostBinding,
  //ViewChild,
  //ChangeDetectorRef,
  ElementRef,
  //ViewContainerRef,
  //ViewEncapsulation,
} from '@angular/core'

//import {FormControl} from '@angular/forms'
//import {MatAutocompleteModule} from '@angular/material/autocomplete'
//import {MatInput} from '@angular/material'

@Component({
  selector: 'rv-tagging',
  host: {
    '(document:click)': 'onClickOutside($event)',
  },
  /*template: `
    <div class="tagging-list">
      <form class="">
        <mat-form-field class="">
          <input type="text" matInput placeholder="HASHTAG" #inputelem="matInput" [formControl]="myControl" [matAutocomplete]="auto">
          <mat-autocomplete #auto="matAutocomplete">
            <mat-option *ngFor="let option of options" [value]="option">
              {{option}}
            </mat-option>
          </mat-autocomplete>
        </mat-form-field>
      </form>
    </div>
  `,*/
  template: `
    <span class="hashtag">
      <span class="hashtag-close ion-ios-close-circle"></span>
      <span id="tag-container">
        <div class="tagging-list" contenteditable="false">
          <span #tag_editable contenteditable="false" id="tag_editable">{{passed_hashtag}}</span>
          <ul contenteditable="false">
            <li *ngFor="let option of options" [value]="option">
              {{option}}
            </li>
          </ul>
        </div>
      </span>
    </span>
  `,
  /*template: `
    <div class="tagging-list" contenteditable="false">
      <span #tag_editable contenteditable="false" id="tag_editable">{{passed_hashtag}}</span>
      <ul contenteditable="false">
        <li *ngFor="let option of options" [value]="option">
          {{option}}
        </li>
      </ul>
    </div>
  `,*/
  styles: [`
    :host {
      display: block;
      position: absolute;
    }
    .tagging-list {
      margin-top: -10px;
      min-width: 100px;
      padding: 10px;
      background-color: rgba(255, 255, 255, 0.9);
      color: #000;

      ul {
        list-style: none;
      }
    }
  `],
  //encapsulation: ViewEncapsulation.ShadowDom
})
export class TaggingComponent implements OnInit {

  //@ViewChild('inputelem') nameInput: MatInput
  //@ViewChild('tag_editable') private _tagEditable: any
  //myControl = new FormControl()
  //@Input() @HostBinding('hashTag') bindHashTag = ''
  options: string[] = ['One', 'Two', 'Three']
  passed_hashtag: string = ''

  @Output() closeHashTagContainer: EventEmitter<any> = new EventEmitter();

  constructor(
    private _eref: ElementRef,
    //private _vcRef: ViewContainerRef,
    //private _cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
  }

  ngAfterViewInit() {
    //this._tagEditable.nativeElement.focus()
    //this.cd.detectChanges()
    /*setTimeout(() => {
    }, 10)*/
  }

  ngOnDestroy() {}

  onClickOutside(ev: any) {
    if (!this._eref.nativeElement.contains(ev.target)) {
      this.closeHashTagContainer.emit({close: true})
    }
  }
}
