import { Component, OnInit } from '@angular/core'
import { Record, Set } from 'immutable'
import { Annotation } from '../../../../persistence/model'
import { Store } from '@ngrx/store'
import * as fromRoot from '../../../reducers'
import * as fromProject from '../../../../persistence/reducers'

@Component({
  selector: 'rv-tag-add-modal',
  host: {
    '(mousedown)': 'hashtagAddModalClick($event)',
  },
  templateUrl: './tag-add-modal.component.html',
  styleUrls: ['./tag-add-modal.component.scss']
})
export class TagAddModalComponent implements OnInit {

  hashtags: string[] = []
  //selectedAnnotations: any
  selectedAnnotations: Set<Record<Annotation>>
  getAnnotationsSelections: any

  constructor(
    private readonly _rootStore: Store<fromRoot.State>
  ) {
    this._rootStore.select(fromProject.getProjectMeta).subscribe(meta => {
      if (meta !== null) {
        const tags = meta!.getIn(['hashtags', 'list'])!
        this.hashtags = (tags) ? tags : []
      }
    })

    this._rootStore.select(fromProject.getSelectedAnnotations)
      .subscribe(selAnnotations => {
        this.selectedAnnotations = selAnnotations
      })

    this._rootStore.select(fromProject.getAnnotationsSelections)
      .subscribe(selAnnotations => {
        console.log(selAnnotations)
        this.getAnnotationsSelections = selAnnotations
      })
  }

  ngOnInit() {
  }

  /**
   *  prevent annotation from de-selecting
   */
  hashtagAddModalClick($event: MouseEvent) {
    console.log('MouseEvent', $event)
    $event.stopPropagation()
  }

  selectAddHashtag(event: any, hashtag: string) {
    //console.log('this.selectedAnnotations', this.selectedAnnotations)

    /*this.selectedAnnotations.find((sel) => {
      console.log('ID', sel, sel.get('id', null))
      const annotation_text = sel.getIn(['fields', 'description'])
      const annotation_text_new = annotation_text.trim() +' '+ hashtag
      console.log(annotation_text_new)
      let ret = sel.setIn(['fields', 'description'], annotation_text_new)
      console.log('ret', ret)
      //console.log('trackIndex', sel.get('trackIndex', null))
      //console.log('annotationStackIndex', sel.get('annotationStackIndex', null))
      return true
    })*/

    this.getAnnotationsSelections.find((sel: any) => {
      console.log(sel)
      console.log('ID', sel.getIn(['annotation', 'id']))
      console.log('annotationStackIndex', sel.get('annotationStackIndex', null))
      console.log('trackIndex', sel.getIn(['track', 'id']))
      //annotationIndex: this.entry.get('annotationIndex', null),
    })

  }
}
