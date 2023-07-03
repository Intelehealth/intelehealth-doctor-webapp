import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'comment'
})
export class CommentPipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    let comment = value.split('|');
    if (localStorage.getItem('selectedLanguage') === 'en') {
      return `DELETED BY ${comment[2].split(' ').map((o) => o[0]).join('')} | ${moment(comment[1]).format('DD-MM-YYYY hh:mm A')}`;
    } else {
      return `حذف بواسطة ${comment[2].split(' ').map((o) => o[0]).join('')} | ${moment(comment[1]).format('DD-MM-YYYY hh:mm A')} `;
    }
  }
}
