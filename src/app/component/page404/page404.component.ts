import { Component } from '@angular/core';

@Component({
  selector: 'app-page404',
  template: `<div class="container">
              <div class="error">
                <section class="text">
                  <h1>404</h1>
                  <h2>Oops!! You're on a wrong page</h2>
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

  constructor() { }

}
