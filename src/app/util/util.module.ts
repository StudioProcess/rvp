import {NgModule} from '@angular/core'

import {BinaryDataLoader} from './BinaryDataLoader'
import {ZipHandler} from './ZipHandler'
import {ProjectLoader} from './ProjectLoader'

@NgModule({
  providers: [BinaryDataLoader, ZipHandler, ProjectLoader]
})
export class UtilModule {}
