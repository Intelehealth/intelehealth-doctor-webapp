import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserIdleService } from 'angular-user-idle';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  privatesubscription: Subscription;
  
  constructor(private userIdle: UserIdleService,
    private myRoute: Router) {
  }
  
  ngOnInit() {
    //Start watching for user inactivity.
    this.userIdle.startWatching();
    // Start watching when user idle is starting and reset if user action is there.
    this.userIdle.onTimerStart().subscribe(count => {
      var eventList = ["click", "mouseover", "keydown", "DOMMouseScroll", "mousewheel",
        "mousedown", "touchstart", "touchmove", "scroll", "keyup"];
      for (let event of eventList) {
        document.body.addEventListener(event, () => this.userIdle.resetTimer());
      }
    });
    // Start watch when time is up.
    this.userIdle.onTimeout().subscribe(() => {
      this.myRoute.navigateByUrl('/login');
    });
  }

}
