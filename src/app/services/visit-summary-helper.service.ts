import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { environment } from "../../environments/environment";
import { HelperService } from "./helper.service";
import { doctorDetails, visitTypes } from 'src/config/constant';
import { VisitService } from 'src/app/services/visit.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';


@Injectable({
  providedIn: "root",
})
export class VisitSummaryHelperService {
  private baseURL = environment.baseURL;
  private baseURLMindmap = environment.mindmapURL;
  public isVisitSummaryShow: boolean = false;
  public isHelpButtonShow: boolean = false;
  public triggerAction: Subject<any> = new Subject();
  public chatVisitId: any;
  public hwPhoneNo: string;
  public patient: any;



  constructor(
    private http: HttpClient,
    private helper: HelperService,
    private visitService: VisitService,
    private translateService: TranslateService,
  ) {}

  getCheifComplaint(visit: any) {
    const recent: any = [];
    const encounters = visit.encounters;
    encounters.forEach(encounter => {
      const display = encounter.display;
      if (display.match(visitTypes.ADULTINITIAL) !== null) {
        const obs = encounter.obs;
        obs.forEach(currentObs => {
          if (currentObs.display.match(visitTypes.CURRENT_COMPLAINT) !== null) {
            const currentComplaint = this.visitService.getData(currentObs)?.value.replace(new RegExp('►', 'g'), '').split('<b>');
            for (let i = 1; i < currentComplaint.length; i++) {
              const obs1 = currentComplaint[i].split('<');
              if (!obs1[0].match(visitTypes.ASSOCIATED_SYMPTOMS)) {
                recent.push(obs1[0]);
              }
            }
          }
        });
      }
    });
    return recent;
  };

  checkIfEncounterExists(encounters: any, visitType: string) {
    return encounters.find(({ display = '' }) => display.includes(visitType));
  };

  checkIfAttributeExists(attrs: any) {
    let currentAttr;
    attrs.forEach((attr: any) => {
      if (attr.attributeType.display === 'Visit Speciality') {
        currentAttr = attr;
      }
    });
    return currentAttr;
  };

  get userId(): string {
    return getCacheData(true, doctorDetails.USER).uuid;
  };

  get username(): string {
    return getCacheData(true, doctorDetails.USER).username;
  };

  getHours(returnAll = true, date?: any) {
    const hours = Array.from(
      {
        length: 21,
      },
      (_, hour) =>
        moment({
          hour,
          minutes: 0,
        }).format('LT')
    );
    hours.splice(0, 9);
    if (this.isToday(date) && !returnAll) {
      const hrs = hours.filter((h) => moment(h, 'LT').isAfter(moment()));
      return hrs;
    } else {
      return hours;
    }
  };

  isToday(date: any) {
    const start = moment().startOf('day');
    const end = moment().endOf('day');
    return (
      moment().startOf('day').isSame(moment(date)) ||
      moment(date).isBetween(start, end)
    );
  };
}
