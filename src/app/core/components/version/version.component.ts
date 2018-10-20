import {Component} from '@angular/core'
import {environment} from '../../../../environments/environment'

@Component({
  selector: 'rv-version',
  template: '<span class="rv-version">Version {{version}} {{commit}}</span>',
  styles: [`
    .rv-version {
    }
  `]
})
export class VersionComponent {
  version=environment.version
  commit=environment.commit
}
