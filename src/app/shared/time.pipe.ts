import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {

  transform(value: any, args?: any): string {
    return moment.unix(value).utc().format('HH:mm:ss.SSS');
  }

}
