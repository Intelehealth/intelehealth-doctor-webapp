// import { Pipe, PipeTransform } from '@angular/core';

// @Pipe({
//   name: 'followUpDate'
// })
// export class FollowUpDatePipe implements PipeTransform {

//   transform(value: string, ...args: unknown[]): unknown {
//     const values = value.split(',');
//     return `${values?.[0]}${values?.[1].replace("Time:", "")}`;
//   }

// }

import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'followUpDate'
})
export class FollowUpDatePipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';

    // Set locale from localStorage
    moment.locale(localStorage.getItem('selectedLanguage') || 'en');

    // Extract date and time
    const [dateStr, timeStr] = value.split(',').map(part => part.trim().replace('Time:', ''));

    // Parse and format using Moment.js
    const formattedDate = moment(`${dateStr} ${timeStr}`, 'YYYY-MM-DD hh:mm A').format('YYYY-MM-DD hh:mm A');

    return formattedDate;
  }
}

