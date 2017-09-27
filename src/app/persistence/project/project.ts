import loadBinary from '../binary/loadBinary'
import {loadZip} from '../zip/zip'

import {Observable} from 'rxjs/Observable'

export function loadProject(path: Observable<string>): Observable<any> {
  return loadZip(loadBinary(path))
}

export function saveProject() {

}
