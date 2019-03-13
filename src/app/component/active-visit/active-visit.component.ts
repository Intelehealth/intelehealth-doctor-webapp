import { Component, OnInit } from '@angular/core';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-active-visit',
  templateUrl: './active-visit.component.html',
  styleUrls: ['./active-visit.component.css']
})
export class ActiveVisitComponent implements OnInit {
  dataSource: any = [];
  constructor(private service: VisitService) { }

  ngOnInit() {
    this.service.getVisits()
    .subscribe(response => {
      this.dataSource = response.results;
    });
  }

}
