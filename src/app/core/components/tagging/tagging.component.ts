import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  //ViewEncapsulation,
  //ChangeDetectorRef
} from '@angular/core'
import {FormControl} from '@angular/forms'
//import {MatAutocompleteModule} from '@angular/material/autocomplete'

import {MatInput} from '@angular/material'

@Component({
  selector: 'rv-tagging',
  /*template: `
    <span class="tagging-position">
      <div contenteditable="false" class="tagging-list">
      </div>
    </span>
  `,*/
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
    <div class="tagging-list" contenteditable="false">
      <span contenteditable="true" class="">#</span>
      <ul contenteditable="false">
        <li *ngFor="let option of options" [value]="option">
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

  @ViewChild('inputelem') nameInput: MatInput
  myControl = new FormControl()
  options: string[] = ['One', 'Two', 'Three']

  constructor(
    private element: ElementRef,
    //private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    //this.nameInput.focus()
    //this.cd.detectChanges()
  }

  ngAfterViewInit() {
    console.log(this.element.nativeElement)
    //this.element.nativeElement.querySelector('input').focus()
  }

  ngOnDestroy() {}
}
