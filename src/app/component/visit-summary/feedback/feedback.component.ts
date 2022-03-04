import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {
  feedback: string;
  rating: string;
  visitUuid: string;
  constructor(
    private route: ActivatedRoute,
    private visitService: VisitService,
  ) { }

  ngOnInit(): void {
    this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.visitService.fetchVisitDetails(this.visitUuid).subscribe((res) => {
      res.encounters.forEach((encounterType, index) => {
        if (encounterType?.display.includes('Patient Exit Survey')) {
          let comment = encounterType.obs.filter(a => a.display.startsWith('Comments'));
          let ratings = encounterType.obs.filter(a => a.display.startsWith('Patient Satisfaction'));

          this.feedback = comment[0]?.value
          this.rating = ratings[0]?.value
        }
      })
    })
  }

}


