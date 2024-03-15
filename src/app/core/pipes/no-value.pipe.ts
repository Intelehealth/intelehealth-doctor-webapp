import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'noValue'
})
export class NoValuePipe implements PipeTransform {

  transform(value: unknown, placeholder: string): unknown {
    if (value) {
      return value;
    }
    return placeholder;
  }

}
