import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'comment'
})
export class CommentPipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    let comment = value.split('|');
    if (localStorage.getItem('selectedLanguage') === 'en') {
      if (comment.length == 1) {
        const name = comment[0].split(' ');
        return `Added by : ${name.length > 2 ? name[0][0] + ' ' + name[1][0] +  ' ' + name[2] : name[0][0] + ' ' + name[1]}`;
      } else {
        const name = comment[2].split(' ');
        return `Deleted by : ${name.length > 2 ? name[0][0] + ' ' + name[1][0] +  ' ' + name[2] : name[0][0] + ' ' + name[1]} ${comment[3] ? '('+comment[3] + ')' : ''} | ${moment(comment[1]).format('DD-MM-YYYY hh:mm A')}`;
      }

    } else {
      if (comment.length == 1) {
        const name = comment[0].split(' ');
        return `أضيفت من قبل ${name.length > 2 ? name[0][0] + ' ' + name[1][0] +  ' ' + name[2] : name[0][0] + ' ' + name[1]}`;
      } else {
        const name = comment[2].split(' ');
        return `حذف بواسطة ${name.length > 2 ? name[0][0] + ' ' + name[1][0] +  ' ' + name[2] : name[0][0] + ' ' + name[1]} ${comment[3] ? '('+comment[3] + ')' : ''} | ${moment(comment[1]).format('DD-MM-YYYY hh:mm A')}`;
      }
    }
  }
}
