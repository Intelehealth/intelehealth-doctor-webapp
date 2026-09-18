import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from '../../core/page-title/page-title.service';
import { getCacheData } from '../../utils/utility-functions';
import { languages } from 'src/config/constant';
import * as moment from 'moment';
import { ReoportService } from 'src/app/services/report.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {

  active: number = 1;
  callData: any[];
  // Turn calls are direct patient<->doctor, so there's no Sevika/CHW; the backend
  // sends block/village/state instead of district/state for those rows.
  callDataColumns: any = environment.isTurnServer ? [
    { label: "Patient Id", key: "patientId" },
    { label: "Patient Name", key: "patientName" },
    { label: "City", key: "city" },
    { label: "Block", key: "block" },
    { label: "Village", key: "village" },
    { label: "Doctor Name", key: "doctorName" },
    { label: "Start Time", key: "start_time" },
    { label: "End Time", key: "end_time" },
    { label: "Call Duration(In second)", key: "call_duration" },
    { label: "Call Status", key: "call_status" },
    { label: "Reason for call failure", key: "reason" },
  ] : [
    { label: "Patient Id", key: "patientId" },
    { label: "Patient Name", key: "patientName" },
    { label: "State", key: "state" },
    { label: "District", key: "district" },
    { label: "Village", key: "location" },
    { label: "Doctor Name", key: "doctorName" },
    { label: "Sevika Name", key: "sevikaName" },
    { label: "Start Time", key: "start_time" },
    { label: "End Time", key: "end_time" },
    { label: "Call Duration(In second)", key: "call_duration" },
    { label: "Call Status", key: "call_status" },
    { label: "Reason for call failure", key: "reason" },
  ];
  constructor(private pageTitleService: PageTitleService,
    private translateService: TranslateService, private reportService: ReoportService) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Report", imgUrl: "assets/svgs/menu-treatment-circle.svg" });
    this.getWebrtcStatus();
  }
  
  // patientId falls back to a UUID room_id when there's no matching OpenMRS patient identifier; drop those rows.
  private isUuid(value: any): boolean {
    return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }

  getWebrtcStatus() {
    this.reportService.geWebrtcStatus().subscribe({
      next: (res: any) => {
        let data = res?.data?.callData || [];
        data = data.filter(item => !this.isUuid(item.patientId));
        this.callData = data.map(item => {
          let tableCol: any = {}
          this.callDataColumns.forEach(col => {
            if (["start_time", "end_time"].includes(col.key)) {
              tableCol[col.key] = item[col.key] === null ? 'NA' : item[col.key];
              col.key === 'start_time' ? tableCol['start_timeD'] = item[col.key] === null ? 'NA' : this.formatMixedDate(item[col.key]) :
                tableCol['end_timeD'] = item[col.key] === null ? 'NA' : this.formatMixedDate(item[col.key]);
            } else {
              tableCol[col.key] = item[col.key] === null ? 'NA' : item[col.key];
            }
          });
          return tableCol;
        });
        this.callData.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
      },
    });
  }

  formatMixedDate(dateStr: string): string {
    let m = moment(dateStr);
     m = m.utc();
    return m.format('DD MMM, YYYY, h:mm a');
  }

  exportCallData() {
    if (!this.callData || this.callData.length === 0) {
      return;
    }
    let newCallData = JSON.parse(JSON.stringify(this.callData));
    newCallData = newCallData.map(call => {
      return {
        ...call,
        start_time: call.start_timeD,
        end_time: call.end_timeD
      };
    });
    const csv = newCallData.map((row) =>
      this.callDataColumns
        .map((col) => JSON.stringify(row[col.key]))
        .join(',')
    );
    const headers = this.callDataColumns.map(col => col.label);
    csv.unshift(headers.join(','));
    const csvArray = csv.join('\r\n');

    const a = document.createElement('a');
    const blob = new Blob([csvArray], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = 'Webrtc Log.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
}
