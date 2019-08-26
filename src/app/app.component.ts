import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { UserIdleService } from 'angular-user-idle';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(public authService: AuthService,
              private userIdle: UserIdleService) { }

  ngOnInit () {
    this.userIdle.startWatching();
    // Start watching when user idle is starting.
    this.userIdle.onTimerStart().subscribe(count => {
      if (count === 1) {
        this.authService.logout();
        this.userIdle.stopWatching();
      }
      });
  }
}
