import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';


// Format unix timestamp to human readable HH:MM:SS.XXX format
@Pipe({
  name: 'time',
  pure: true // explicitly mark as pure (the default) i.e. only execute this pipe if input primitive or object reference changes
})
export class TimePipe implements PipeTransform {

  transform(unixTime: number, args?: any): string {
    return moment.unix(unixTime) // parse unix timestamp
      .utc()
      .format('HH:mm:ss.SSS');
  }

}


// Transform formatted (HH:MM:SS.XXX) timestamp to unix (seconds) format
@Pipe({
  name: 'unixTime',
  pure: true // explicitly mark as pure (the default) i.e. only execute this pipe if input primitive or object reference changes
})
export class UnixTimePipe implements PipeTransform {

  transform(formattedTime: string, args?: any): number {
    let unixMillis = moment.utc('1970-01-01 ' + formattedTime) // parse ISO 8601 time (HH:MM:SS.XXX) in UTC
      .valueOf(); // unix timestamp in milliseconds
    return unixMillis / 1000;
  }

}
