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
// Pass an argument of {moment:true} to get the raw moment instance after parsing
@Pipe({
  name: 'unixTime',
  pure: true // explicitly mark as pure (the default) i.e. only execute this pipe if input primitive or object reference changes
})
export class UnixTimePipe implements PipeTransform {

  transform(formattedTime: string, args?:any): any {
    let momentDuration = moment.duration(formattedTime); // parse moment duration: http://momentjs.com/docs/#/durations/creating/
    if (args && args.moment) return momentDuration;
    return momentDuration.asSeconds(); // return length of duration with fractional seconds
  }

}
