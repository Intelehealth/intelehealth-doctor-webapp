import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { notifications } from 'src/config/constant';
// import { CoreService } from 'src/app/services/core/core.service';

@Component({
  selector: 'app-get-started',
  templateUrl: './get-started.component.html',
  styleUrls: ['./get-started.component.scss']
})
export class GetStartedComponent implements OnInit {

  doctorName : string = '';
  greetingMsg: string = 'Hi';
  pc: boolean = true;
  sc: boolean = true;
  constructor(
    private pageTitleService: PageTitleService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService
    ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false,notifications.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: '', imgUrl: '' });
    this.doctorName = getCacheData(false,notifications.DOCTOR_NAME);
    let now = new Date();
    let hrs = now.getHours();
    if (hrs < 12)
      this.greetingMsg = 'Good Morning';
    else if (hrs >= 12 && hrs <= 17)
      this.greetingMsg = 'Good Afternoon';
    else if (hrs >= 17 && hrs <= 24)
      this.greetingMsg = 'Good Evening';


    if (this.route.snapshot.queryParamMap.get('pc') !=null && this.route.snapshot.queryParamMap.get('sc') != null) {
      this.pc = !JSON.parse(this.route.snapshot.queryParamMap.get('pc'));
      this.sc = !JSON.parse(this.route.snapshot.queryParamMap.get('sc'));
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  setupProfile() {
    this.router.navigate(['/dashboard/profile']);
  }

  setupCalendar() {
    this.router.navigate(['/calendar/setup-calendar']);
  }

}
