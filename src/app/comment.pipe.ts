import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'comment'
})
export class CommentPipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    const [type] = args;
    if (typeof value === 'object') {

      if (!value?.comment) {
        value = value?.creator?.person?.display;
      } else if (type === 'addedBy-creator') {
        const comments = value?.comment.split('|');
        value = comments.length > 4 ?
          comments[4].split(':')[0] : value?.creator?.person?.display
      }
    }

    let comment = value.split('|');

    return comment.includes('DELETED') ?
      this.getDeletedBy(comment) :
      this.getAddedBy(comment, type);
  }

  get selectedLang() {
    return localStorage.getItem('selectedLanguage');
  }

  getAddedBy(comment, type = "") {
    const prefixTitle = this.selectedLang === 'en' ? "Added by : " : "أضيفت من قبل ";

    let name = comment[0].split(' ');

    return `${prefixTitle} ${name.length > 2 ? name[0][0] + ' ' + name[1][0] + ' ' + name[2] : name[0][0] + ' ' + name[1]}`;
  }

  getDeletedBy(comment) {
    const prefixTitle = this.selectedLang === 'en' ? "Deleted by : " : "حذف بواسطة ";

    const name = comment[2].split(' ');
    return `${prefixTitle}${name.length > 2 ? name[0][0] + ' ' + name[1][0] + ' ' + name[2] : name[0][0] + ' ' + name[1]} ${comment[3] ? '(' + comment[3] + ')' : ''} | ${moment(comment[1]).format('DD-MM-YYYY hh:mm A')}`;
  }
}
