import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-prescription-container',
  templateUrl: './prescription-container.component.html',
  styleUrls: ['./prescription-container.component.scss']
})
export class PrescriptionContainerComponent implements OnInit, OnDestroy {

  subscription: Subscription;
  completedVisitsCount: number = 0;
  constructor(private visitService: VisitService) { }

  ngOnInit(): void {
    this.subscription = this.visitService.$presComplete.subscribe(val=>{
      this.completedVisitsCount = val;
    })
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
