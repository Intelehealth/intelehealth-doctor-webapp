import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-page404',
  template: `<div class="container">
              <div class="error">
                <section class="text">
                  <h1>404</h1>
                  <h2>{{msg}}</h2>
                </section>
              </div>
            </div>`,
  styles: [`.error {
            height: 78.5vh;
            background: #454c40;
            border-radius: 10px;
            color: #fff;
          }
          .text {
            text-align: center;
            position: relative;
            top:35%
          }`]
})
export class Page404Component {
  msg = this.translate.instant('Oops!! You are on a wrong page')
  constructor(
    private translate: TranslateService
  ) { }

}
