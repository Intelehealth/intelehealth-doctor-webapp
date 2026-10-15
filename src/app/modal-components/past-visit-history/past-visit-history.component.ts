import { Component, Inject, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import { VisitService } from 'src/app/services/visit.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface PastVisit {
  date: string;
  title: string;
  activeLabourDiagnosed: string;
  deliveryDate: string;
  riskFactors: string;
  parity: string;
  modeOfDelivery: string;
  babyStatus: string;
  motherStatus: string;
  reportUrl?: string;
  visitUuid?: string;
}

@Component({
  selector: 'app-past-visit-history',
  templateUrl: './past-visit-history.component.html',
  styleUrls: ['./past-visit-history.component.scss']
})
export class PastVisitHistoryComponent implements OnInit {
  patientName: string;
  visits: PastVisit[] = [];
  expandedIndex = 0;
  loading = false;
  error = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PastVisitHistoryComponent>,
    private visitService: VisitService,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.patientName = this.data?.patientName || '';
    this.loadVisits();
  }

  loadVisits() {
    if (!this.data?.patientUuid) return;
    this.loading = true;
    this.error = false;
    /* Nested obs only carry uuid/display in the default rep, so ask for concept and value explicitly */
    const rep = 'custom:(uuid,startDatetime,encounters:(uuid,encounterDatetime,encounterType:(display),obs:(uuid,value,concept:(uuid,display))))';
    this.visitService.recentVisits(this.data.patientUuid, rep).subscribe({
      next: (res: any) => {
        const results: any[] = Array.isArray(res?.results) ? res.results : [];
        this.visits = results
          .filter(v => v.uuid !== this.data?.currentVisitUuid)
          .sort((a, b) => new Date(b.startDatetime).getTime() - new Date(a.startDatetime).getTime())
          .map(v => this.mapVisit(v));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  private mapVisit(visit: any): PastVisit {
    const encounters: any[] = visit?.encounters || [];
    const admission = encounters.find(e => e?.encounterType?.display === 'Admission');
    const stage3 = encounters.find(e => e?.encounterType?.display === 'DELIVERY_OUTCOME_STAGE3');
    const complete = encounters.find(e => e?.encounterType?.display === 'Visit Complete');
    const outOfTime = this.obs(complete, ['OUT OF TIME']);
    const referType = this.obs(complete, ['Refer Type']);
    const deliveryMode = this.obs(stage3, ['Delivery Mode', 'Mode of Delivery', 'DELIVERY_MODE']);
    const deliveryDate = this.obs(stage3, ['Delivery Date', 'DATE OF DELIVERY', 'Birth Date', 'DELIVERY_DATE']);
    const deliveryTime = this.obs(stage3, ['Delivery Time', 'TIME OF DELIVERY', 'Birth Time', 'DELIVERY_TIME']);

    /* Same sources as the partogram: the outcome picked on Visit Complete, falling back to the stage 3 birth type */
    let birthOutcome = this.obs(complete, ['Birth Outcome']);
    if (birthOutcome.toUpperCase() === 'OTHER') {
      birthOutcome = this.obs(complete, ['Birth Outcome Other']) || birthOutcome;
    }
    const babyStatus = birthOutcome || this.obs(stage3, ['Baby status', 'Baby Status', 'BIRTH_TYPE']);

    /*
     * Mother status: for newborn outcomes it is Healthy/Death (flag is 'MOTHER DECEASED NEW' on the epartogram,
     * a recorded reason on the partogram); for visits ended in stage 1/2 it is the visit outcome, as on the mobile app.
     */
    const motherSource = complete || stage3;
    const motherDeceasedReason = this.obs(motherSource, ['MOTHER DECEASED REASON']);
    const motherDeceased = this.obs(motherSource, ['MOTHER DECEASED NEW']).toUpperCase() === 'YES' || !!motherDeceasedReason;
    let motherStatus = '-';
    if (outOfTime) {
      motherStatus = `Out Of Time (${outOfTime})`;
    } else if (referType) {
      const referOther = referType === 'Other' ? this.obs(complete, ['Refer Type Other']) : '';
      motherStatus = referOther ? `${referType} (${referOther})` : referType;
    } else if (motherSource) {
      motherStatus = motherDeceased ? `Death${motherDeceasedReason ? ` (${motherDeceasedReason})` : ''}` : 'Healthy';
    }

    /* Heading shows the admission date of the visit, not the visit record's start date */
    const admissionDate = this.obs(admission, ['Admission_Date']) || admission?.encounterDatetime;

    return {
      visitUuid: visit.uuid,
      date: this.fmt(admissionDate, 'DD MMMM YYYY'),
      title: deliveryMode || '-',
      activeLabourDiagnosed: this.fmt(this.obs(admission, ['Active Labor Diagnosed']), 'DD MMMM YYYY, hh:mm A'),
      /* Visits that ended in stage 1 or 2 have no delivery outcome encounter, so only that encounter decides */
      deliveryDate: !stage3
        ? '-'
        : this.fmt(deliveryDate ? (deliveryTime ? `${deliveryDate} ${deliveryTime}` : deliveryDate) : stage3.encounterDatetime, 'DD MMMM YYYY, hh:mm A'),
      riskFactors: this.obs(admission, ['Risk factors']) || '-',
      parity: this.obs(admission, ['Parity']) || '-',
      modeOfDelivery: deliveryMode || '-',
      babyStatus: babyStatus || '-',
      motherStatus,
      /* Same condition as the "View Stage 3" button on the partogram */
      reportUrl: environment.hasStage3 && stage3 ? `/dashboard/stage3/${visit.uuid}` : ''
    };
  }

  private obs(enc: any, concepts: string[]): string {
    for (const c of concepts) {
      const o = enc?.obs?.find((x: any) => x?.concept?.display === c);
      if (o && o.value !== null && o.value !== undefined && String(o.value).trim() !== '') {
        return typeof o.value === 'object' ? (o.value.display || '') : String(o.value).trim();
      }
    }
    return '';
  }

  private fmt(value: any, format: string): string {
    if (!value) return '-';
    const m = moment(String(value).trim(), [moment.ISO_8601, 'DD/MM/YYYY hh:mm A', 'DD/MM/YYYY HH:mm', 'DD/MM/YYYY'] as any, true);
    return m.isValid() ? m.format(format) : '-';
  }

  openReport(visit: PastVisit) {
    if (!visit.reportUrl) return;
    const url = this.router.serializeUrl(this.router.createUrlTree([visit.reportUrl]));
    globalThis.open(this.location.prepareExternalUrl(url), '_blank');
  }

  toggle(index: number) {
    this.expandedIndex = this.expandedIndex === index ? -1 : index;
  }

  close() {
    this.dialogRef.close();
  }
}
