import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'comment'
})
export class CommentPipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    const [type] = args;
    let regNo = null;
    if (typeof value === 'object') {
      if (type === 'Deleted by') {
        regNo = value.deletorRegNo;
        value = value.comment;
      } else if (!value?.comment) {
        value = value?.creator?.person?.display;
      } else if (type === 'addedBy-creator') {
        const comments = value?.comment.split('|');
        value = comments.length > 4 ?
          comments[4].split(':')[0] : value?.creator?.person?.display
      }
    }

    let comment = value.split('|');

    if (type === 'addedBy-regNo') {
      return comment[5] ? `(${comment[5]})` : '(-)';
    } else {
      return comment.includes('DELETED') ?
        this.getDeletedBy(comment, regNo) :
        this.getAddedBy(comment);
    }
  }

  get selectedLang() {
    return localStorage.getItem('selectedLanguage');
  }

  getAddedBy(comment) {
    const prefixTitle = this.selectedLang === 'en' ? "Added by : " : "أضيفت من قبل ";

    let name = comment[0].split(' ');

    return `${prefixTitle} ${name.length > 2 ? name[0][0] + ' ' + name[1][0] + ' ' + name[2] : name[0][0] + ' ' + name[1]}`;
  }

  getDeletedBy(comment, regNo) {
    if(!regNo)regNo = `(${comment[3]})`;
    const prefixTitle = this.selectedLang === 'en' ? "Deleted by : " : "حذف بواسطة ";

    const name = comment[2].split(' ');
    return `${prefixTitle}${name.length > 2 ? name[0][0] + ' ' + name[1][0] + ' ' + name[2] : name[0][0] + ' ' + name[1]} ${comment[3] ? regNo : ''} | ${moment(comment[1]).format('DD-MM-YYYY , hh:mm A')}`;
  }
}
