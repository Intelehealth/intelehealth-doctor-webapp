import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VisitService } from 'src/app/services/visit.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { doctorDetails } from 'src/config/constant';
import { ProviderAttributeModel } from 'src/app/model/model';

@Component({
  selector: 'app-share-prescription-success',
  templateUrl: './share-prescription-success.component.html',
})
export class SharePrescriptionSuccessComponent implements OnInit {

  // Visit count properties
  priorityVisitsCount: number = 0;
  awaitingVisitsCount: number = 0;
  inProgressVisitsCount: number = 0;

  // Loading state
  isLoadingCounts: boolean = true;

  // Specialization
  private specialization: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<SharePrescriptionSuccessComponent>,
  private visitService: VisitService) { }

  /**
  * Initialize component and load visit counts
  * @return {void}
  */
  ngOnInit(): void {
    this.loadVisitCounts();
  }

  /**
  * Load visit counts from API
  * @return {void}
  */
  private loadVisitCounts(): void {
    const provider = getCacheData(true, doctorDetails.PROVIDER);
    if (provider && provider.attributes) {
      this.specialization = this.getSpecialization(provider.attributes);

      // Fetch all three counts in parallel
      this.fetchPriorityVisits();
      this.fetchAwaitingVisits();
      this.fetchInProgressVisits();
    } else {
      this.isLoadingCounts = false;
    }
  }

  /**
  * Get specialization from provider attributes
  * @param {ProviderAttributeModel[]} attributes - Provider attributes
  * @return {string} Specialization value
  */
  private getSpecialization(attributes: ProviderAttributeModel[]): string {
    const attr = attributes.find(a =>
      a.attributeType.uuid === 'ed1715f5-93e2-404e-b3c9-2a2d9600f062' && !a.voided
    );
    return attr ? attr.value : '';
  }

  /**
  * Fetch priority visits count
  * @return {void}
  */
  private fetchPriorityVisits(): void {
    this.visitService.getPriorityVisits(this.specialization, 1).subscribe({
      next: (response) => {
        if (response.success) {
          this.priorityVisitsCount = response.totalCount || 0;
        }
        this.checkLoadingComplete();
      },
      error: () => {
        this.priorityVisitsCount = 0;
        this.checkLoadingComplete();
      }
    });
  }

  /**
  * Fetch awaiting visits count
  * @return {void}
  */
  private fetchAwaitingVisits(): void {
    this.visitService.getAwaitingVisits(this.specialization, 1).subscribe({
      next: (response) => {
        if (response.success) {
          this.awaitingVisitsCount = response.totalCount || 0;
        }
        this.checkLoadingComplete();
      },
      error: () => {
        this.awaitingVisitsCount = 0;
        this.checkLoadingComplete();
      }
    });
  }

  /**
  * Fetch in-progress visits count
  * @return {void}
  */
  private fetchInProgressVisits(): void {
    this.visitService.getInProgressVisits(this.specialization, 1).subscribe({
      next: (response) => {
        if (response.success) {
          this.inProgressVisitsCount = response.totalCount || 0;
        }
        this.checkLoadingComplete();
      },
      error: () => {
        this.inProgressVisitsCount = 0;
        this.checkLoadingComplete();
      }
    });
  }

  /**
  * Check if all counts are loaded and update loading state
  * @return {void}
  */
  private checkLoadingComplete(): void {
    this.isLoadingCounts = false;
  }

  /**
  * Close modal
  * @param {string|boolean} val - Dialog result
  * @return {void}
  */
  close(val: string|boolean) {
    this.dialogRef.close(val);
  }

}
