import {
  Component,
  OnInit
} from '@angular/core'

import {Store} from '@ngrx/store'
import * as fromProject from '../../../../persistence/reducers'
import * as fromRoot from '../../../reducers'

@Component({
  selector: 'rv-tag-add-modal',
  templateUrl: './tag-add-modal.component.html',
  styleUrls: ['./tag-add-modal.component.scss']
})
export class TagAddModalComponent implements OnInit {

  private hashtags: string[] = []

  constructor(
    private readonly _rootStore: Store<fromRoot.State>,
  ) {
    this._rootStore.select(fromProject.getProjectMeta).subscribe(meta => {
      if(meta !== null) {
        const tags = meta!.getIn(['hashtags', 'list'])!
        this.hashtags = (tags) ? tags : []
        console.log(this.hashtags)
      }
    })
  }

  ngOnInit() {
  }
}
