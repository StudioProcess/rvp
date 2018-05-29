import {Component} from '@angular/core'
import {environment} from '../../../../environments/environment'

@Component({
  selector: 'rv-version',
  template: '<span class="rv-version">rv v{{version}} {{commit}}</span>',
  styles: [`
    .rv-version {
      font-size: 9px;
      font-weight: bold;
    }
  `]
})
export class VersionComponent {
  version=environment.version
  commit=environment.commit
}
