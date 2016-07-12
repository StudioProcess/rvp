import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'time',
  pure: true // explicitly mark as pure (the default) i.e. only execute this pipe if input primitive or object reference changes
})
export class TimePipe implements PipeTransform {

  transform(value: any, args?: any): string {
    return moment.unix(value).utc().format('HH:mm:ss.SSS');
  }

}
