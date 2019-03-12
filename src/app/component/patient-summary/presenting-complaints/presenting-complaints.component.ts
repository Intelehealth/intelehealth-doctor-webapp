import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-presenting-complaints',
  templateUrl: './presenting-complaints.component.html',
  styleUrls: ['./presenting-complaints.component.css']
})
export class PresentingComplaintsComponent implements OnInit {
  encounter: any = [];
  result: any = [];
  complaint: any = [];

  constructor(private service: EncounterService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get('patient_id');
    this.service.adultInitial(uuid)
    .subscribe(response => {
      this.result = response;
      const encounterUuid = this.result.results[0].uuid;
      this.service.vitals(encounterUuid)
      .subscribe(response1 => {
        const obs = response1.obs;
        obs.forEach(element => {
          const display = element.display;
          if (display.match('CURRENT COMPLAINT') != null) {
            this.complaint = display.substring(19);
         }
       });
     });
   });
 }
}

