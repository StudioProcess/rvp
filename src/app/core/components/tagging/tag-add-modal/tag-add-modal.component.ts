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
  selectedAnnotations: Set<Record<Annotation>>
  tracks: any

  constructor(
    private _rootStore: Store<fromRoot.State>
  ) {
    this._rootStore.select(fromProject.getProjectMeta).subscribe(meta => {
      if (meta !== null) {
        const tags = meta!.getIn(['hashtags', 'list'])!
        this.hashtags = (tags) ? tags : []
        this.tracks = meta!.getIn(['timeline', 'tracks'])
      }
    })

    this._rootStore.select(fromProject.getSelectedAnnotations)
      .subscribe(selAnnotations => {
        this.selectedAnnotations = selAnnotations
        //console.log('this.selectedAnnotations', this.selectedAnnotations)
      })
  }

  ngOnInit() {
  }

  /**
   *  prevent annotation from de-selecting
   */
  hashtagAddModalClick($event: MouseEvent) {
    $event.stopPropagation()
  }

  /**
   *  build complete path info in order to update annotation
   *  or respectively use ProjectUpdateAnnotation method
   */
  getAnotationStorePathById(search_id: number|null): any {
    let path = null
    this.tracks!.find((track: any, trackIndex: number) => {
      const annotationStacks = track.get('annotationStacks', null)
      annotationStacks.forEach((annotationStack: any, annotationStackIndex: number) => {
        annotationStack.forEach((annotation: any, annotationIndex: number) => {
          if(annotation.id === search_id) {
            path = {
              'trackIndex': trackIndex,
              'annotationStackIndex': annotationStackIndex,
              'annotationIndex': annotationIndex,
              'annotationId': annotation.id
            }
            return true
          }
        })
      })
      return false
    })
    return path
  }

  selectAddHashtag(event: any, hashtag: string) {
    /**
     *  - go through all selected annotations
     *  - find pathInfo in order to save (via ProjectUpdateAnnotation)
     *  - update annotaion text with selected hashtag
     *  - save (via ProjectUpdateAnnotation)
     */
    this.selectedAnnotations.find((sel) => {
      const annotationId = sel.get('id', null)
      //console.log('SEL', sel, 'ID', annotationId)
      const pathInfo = this.getAnotationStorePathById(annotationId!)
      if(pathInfo) {
        const annotation_duration = sel.get('duration', null)
        const annotation_timestamp = sel.get('utc_timestamp', null)
        const annotation_text = sel.getIn(['fields', 'description'])
        const annotation_text_new = annotation_text.trim() +' '+ hashtag

        const annotation = new AnnotationRecordFactory({
          id: annotationId,
          utc_timestamp: annotation_timestamp,
          duration: annotation_duration,
          fields: new AnnotationFieldsRecordFactory({description: annotation_text_new})
        })

        const updateAnnotation = {
          trackIndex: pathInfo!.trackIndex,
          annotationStackIndex: pathInfo!.annotationStackIndex,
          annotationIndex: pathInfo!.annotationIndex,
          annotation
        }
        //console.log('updateAnnotation', updateAnnotation)

        this._rootStore.dispatch(new project.ProjectUpdateAnnotation(updateAnnotation))
      }
      return false
    })
  }
}
