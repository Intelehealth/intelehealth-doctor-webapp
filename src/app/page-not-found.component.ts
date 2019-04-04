import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-file-not-found',
  template: `<div class="error">
              <h1 style="text-align:center">404</h1>
              <h2>You're on a wrong page</h2>
            </div>`,
  styles: [`.error {
              background: #454c40;
              position:absolute;
              color:#fff;
              top:50%;
              left:50%;
              padding:15px;
              -ms-transform: translateX(-50%) translateY(-50%);
              -webkit-transform: translate(-50%,-50%);
              transform: translate(-50%,-50%);
              }`]
})
export class PageNotFoundComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}