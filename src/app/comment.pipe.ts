import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'comment'
})
export class CommentPipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    let comment = value.split('|');
    const name = comment[2].split(' ');
    if (localStorage.getItem('selectedLanguage') === 'en') {
      return `DELETED BY ${name.length > 2 ? name[0][0] + ' ' + name[1][0] +  ' ' + name[2] : name[0][0] + ' ' + name[1]} ${comment[3] ? '('+comment[3] + ')' : ''} | ${moment(comment[1]).format('DD-MM-YYYY hh:mm A')}`;
    } else {
      return `حذف بواسطة ${name.length > 2 ? name[0][0] + ' ' + name[1][0] +  ' ' + name[2] : name[0][0] + ' ' + name[1]} ${comment[3] ? '('+comment[3] + ')' : ''} | ${moment(comment[1]).format('DD-MM-YYYY hh:mm A')}`;
    }
  }
}
