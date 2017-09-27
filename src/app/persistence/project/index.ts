import {Observable} from 'rxjs/Observable'

import loadBinary from '../binary'
import {loadZip} from '../zip'

export function loadProject(path: Observable<string>): Observable<any> {
  return loadZip(loadBinary(path))
}

export function saveProject() {
}
