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


// Transform formatted (DD.HH:MM:SS.XXX) timestamp to unix (seconds) format
// Supports overflowing hours, minutes and seconds
// returns null if parsing fails
@Pipe({
  name: 'unixTime',
  pure: true // explicitly mark as pure (the default) i.e. only execute this pipe if input primitive or object reference changes
})
export class UnixTimePipe implements PipeTransform {

  transform(formattedTime: string, args?:any): number {
    let millis ='(?:\\.([0-9]*))?$';
    let seconds = '([0-9]*)';
    let minutesAndHours = '^(?:(?:([0-9]*):)|(?:([0-9]*):([0-9]*):))?'; // has 3 capturing parantheses. the 1st is defined when ONLY minutes are matched. the 2nd and 3rd are defined when hours (2nd) AND minutes (3rd) are matched.
    // let minutesAndHours = '^(?:([0-9]+):)?(?:([0-9]+):)?'; // has 2 capturing parantheses. if the 2nd is undefined the 1st represents minutes, else the 1st represents hours and the 2nd minutes

    let pattern = minutesAndHours + seconds + millis;
    let result = new RegExp(pattern).exec(formattedTime);
    if (result == null) return null;

    let m1 = result[1] ? parseInt(result[1], 10) : 0;
    let h = result[2] ? parseInt(result[2], 10) : 0;
    let m2 = result[3] ? parseInt(result[3], 10) : 0;
    let s = result[4] ? parseInt(result[4], 10) : 0;
    let sFract = result[5] ? parseFloat('.'+result[5]) : 0; // milliseconds, parsed as fractional seconds
    // log.debug( h + ':' + (m1+m2) + ':' + (s+sFract) );
    return h*3600 + m1*60 + m2*60 + s + sFract;
  }

}
