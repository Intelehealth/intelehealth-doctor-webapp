import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-ended-visits',
  templateUrl: './ended-visits.component.html',
  styleUrls: ['./ended-visits.component.css']
})
export class EndedVisitsComponent implements OnInit {
  endVisits = [];
  endedVisitNo = 0;
  setSpiner = true;
  data: any
  constructor(private service: VisitService,
    private cd: ChangeDetectorRef) {
     }

  ngOnInit(): void {
      this.service.getEndedVisits().subscribe((res)=>{
        this.data = res.results
         let visits =  this.data.filter(a=>a.stopDatetime != null);
         visits.forEach( a => {
           this.endVisits.push(this.assignValueToProperty(a));
           this.endedVisitNo += 1
           localStorage.setItem('endVisitCount', this.endedVisitNo.toString())
         });
         this.setSpiner = false;
      })
  }

  assignValueToProperty(active) {
    let value: any = {};
    value.visitId = active.uuid;
    value.patientId = active.patient.uuid;
    value.id = active.patient.identifiers[0].identifier;
    value.name = active.patient.person.display;
    value.gender = active.patient.person.gender;
    value.age = active.patient.person.age;
    value.location = active.location.display;
    value.status = active.encounters[0]?.encounterType.display;
    value.provider = active.encounters[0]?.encounterProviders[0]?.provider.display.split(
      "- "
    )[1];
    value.lastSeen = active.encounters[0]?.encounterDatetime;
    value.complaints = this.getComplaints(active);
    value.feedback = this.getComments(active)
    return value;
  }

  getComments(visit){
    let feedback = this.service.checkVisit(visit.encounters, "Patient Exit Survey");
    return feedback?.encounterType?.display;
  }

  getComplaints(visitDetails) {
    let recent: any =[];
    const encounters = visitDetails.encounters;
    encounters.forEach(encounter => {
    const display = encounter.display;
    if (display.match('ADULTINITIAL') !== null ) {
      const obs = encounter.obs;
      obs.forEach(currentObs => {
        if (currentObs.display.match('CURRENT COMPLAINT') !== null) {
          const currentComplaint = currentObs.display.split('<b>');
          for (let i = 1; i < currentComplaint.length; i++) {
            const obs1 = currentComplaint[i].split('<');
            if (!obs1[0].match('Associated symptoms')) {   
              recent.push(obs1[0]);
            }
          }
        }
      });
    }
   });
   return recent;
  }

}
