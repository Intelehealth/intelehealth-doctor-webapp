import { Component, OnInit } from '@angular/core';
import { VisitService } from 'src/app/services/visit.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-current-visit',
  templateUrl: './current-visit.component.html',
  styleUrls: ['./current-visit.component.css']
})
export class CurrentVisitComponent implements OnInit {
visitDetail;
providerName: string;
clinicName: string;
  constructor(private route: ActivatedRoute,
              private visitService: VisitService) { }

  ngOnInit() {
    const visitId = this.route.snapshot.params['visit_id'];
    this.visitService.fetchVisitDetails(visitId)
    .subscribe(visitDetail => {
      this.visitDetail = visitDetail;
      this.clinicName = visitDetail.display.split('@ ')[1].split(' -')[0];
      visitDetail.encounters.forEach(encounter => {
        if (encounter.display.match('ADULTINITIAL') !== null) {
          this.providerName = encounter.encounterProviders[0].display;
        } else if (encounter.display.match('Vitals')) {
          this.providerName = encounter.encounterProviders[0].display;
        }
      });
    });
  }

}
