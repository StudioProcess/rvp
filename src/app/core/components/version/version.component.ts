import {Component} from '@angular/core'
import {environment} from '../../../../environments/environment'

@Component({
  selector: 'rv-version',
  template: '<span class="rv-version">Version {{version}}_{{commit}}</span>',
  styles: [`
    .rv-version {
      font-weight: 500;
    }
  `]
})
export class VersionComponent {
  version=environment.version
  commit=environment.commit
}
