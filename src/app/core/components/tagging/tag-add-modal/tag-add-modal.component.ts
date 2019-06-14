import { Component, OnInit } from '@angular/core'
import { Record, Set } from 'immutable'
import { Annotation } from '../../../../persistence/model'
import { Store } from '@ngrx/store'
import * as fromRoot from '../../../reducers'
import * as fromProject from '../../../../persistence/reducers'
import * as project from '../../../../persistence/actions/project'
import { AnnotationRecordFactory, AnnotationFieldsRecordFactory } from '../../../../persistence/model'

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
  //const initialState = new ProjectRecordFactory()
  //export type State = Record<Project>
  //@Output() readonly onUpdate = new EventEmitter<project.UpdateAnnotationPayload>()

  constructor(
    private _rootStore: Store<fromRoot.State>
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
    //console.log('MouseEvent', $event)
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
      console.log('track', sel.getIn(['track']))
      console.log('annotationStacks', sel.getIn(['track', 'annotationStacks']))
      const annotation_id = sel.getIn(['annotation', 'id'])
      const annotation_duration = sel.getIn(['annotation', 'duration'])
      const annotation_timestamp = sel.getIn(['annotation', 'utc_timestamp'])
      const annotationStackIndex = sel.get('annotationStackIndex', null)
      const trackIndex = sel.getIn(['track', 'id'])
      //console.log('ID', annotation_id, annotation_duration, annotation_timestamp, annotationStackIndex, trackIndex)

      const annotation_text = sel.getIn(['annotation', 'fields', 'description'])
      const annotation_text_new = annotation_text.trim() + ' ' + hashtag

      const annotation = new AnnotationRecordFactory({
        id: annotation_id,
        utc_timestamp: annotation_timestamp,
        duration: annotation_duration,
        fields: new AnnotationFieldsRecordFactory({description: annotation_text_new})
      })

      const updateAnnotation = {
        trackIndex: trackIndex,
        annotationStackIndex: annotationStackIndex,
        annotationIndex: 0, // TODO :
        annotation
      }

      this._rootStore.dispatch(new project.ProjectUpdateAnnotation(updateAnnotation))
    })
  }
}
