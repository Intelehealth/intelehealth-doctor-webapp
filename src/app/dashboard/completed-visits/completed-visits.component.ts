import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { MatMenuTrigger } from '@angular/material/menu';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { formatDate } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';


export const PICK_FORMATS = {
  parse: { dateInput: { month: 'short', year: 'numeric', day: 'numeric' } },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' }
  }
};

class PickDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      return formatDate(date, 'dd MMM yyyy', this.locale);
    } else {
      return formatDate(date.toDateString(), 'EEE MMM dd yyyy', this.locale);
    }
  }
};

@Component({
  selector: 'app-completed-visits',
  templateUrl: './completed-visits.component.html',
  styleUrls: ['./completed-visits.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: localStorage.getItem("selectedLanguage") || 'en-US' }
  ]
})
export class CompletedVisitsComponent {
  @Input() completedVisitsCount: number = 0;
  @Input() patientRegFields: string[] = [];
  @ViewChild('ipSearchInput', { static: true }) public ipSearchElement: ElementRef;

  @ViewChild('tempPaginator') public paginator: MatPaginator;

  baseUrl: string = environment.baseURL;
  displayedColumns: string[] = ['name', 'age', 'location', 'cheif_complaint', 'visit_completed'];
  tblDataSource: any = new MatTableDataSource<any>([]);

  panelExpanded: boolean = true;
  mode: 'date' | 'range' = 'date';
  maxDate: Date = new Date();

  filteredDateAndRangeForm: FormGroup;
  
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;
  isFilterApplied: boolean = false;
  
  constructor(
    private translateService: TranslateService,
  ){
    this.filteredDateAndRangeForm = new FormGroup({
      date: new FormControl('', [Validators.required]),
      startDate: new FormControl(null, Validators.required),
      endDate: new FormControl(null, Validators.required),
    });
    if(environment.brandName === 'KCDO'){
      this.displayedColumns = ['TMH_patient_id', 'name', 'age', 'visit_completed'];
    }
    console.log(this.tblDataSource, "COMPLETED VISITS");
    
  }

  checkPatientRegField(fieldName): boolean {
    return this.patientRegFields.indexOf(fieldName) !== -1;
  }

  /**
  * Clear filter from a datasource
  * @return {void}
  */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tblDataSource.filter = filterValue.trim().toLowerCase();
    this.paginator.firstPage();
    this.isFilterApplied = true;
  }

  /**
  * Clear filter from a given datasource
  * @return {void}
  */
  clearFilter() {
    this.tblDataSource.filter = null;
    this.ipSearchElement.nativeElement.value = "";
    this.isFilterApplied = false;
  }
  
  closeMenu() {
    if (this.menuTrigger) {
      this.menuTrigger.closeMenu();
    }
  }

  setMode(mode: 'date' | 'range') {
    this.mode = mode;
  }

  formatDate(date: any): string {
    const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  convertToDate(relativeTime: string): string {
    const now = new Date();
    const [value, unit] = relativeTime.split(' ');
    const amount = parseInt(value, 10);
  
    if (['hour', 'hours'].includes(unit.toLowerCase())) now.setHours(now.getHours() - amount);
    else if (['minute', 'minutes'].includes(unit.toLowerCase())) now.setMinutes(now.getMinutes() - amount);
    else if (['day', 'days'].includes(unit.toLowerCase())) now.setDate(now.getDate() - amount);
    else throw new Error('Invalid time unit. Only "hours", "minutes", or "days" are supported.');
  
    return now.toISOString().split('T')[0];
  }

  applyDateOrRangeFilter() {
    const selectedDate = this.filteredDateAndRangeForm.get('date')?.value;
    const startDate = this.filteredDateAndRangeForm.get('startDate')?.value;
    const endDate = this.filteredDateAndRangeForm.get('endDate')?.value;
  
    if (selectedDate) {
      // Single-date filter logic
      const formattedDate = this.formatDate(selectedDate);

      this.tblDataSource.filterPredicate = (data: any, filter: string) => {
        const itemDate = data.completed.includes(',') ? this.formatDate(data.completed) : this.convertToDate(data.completed);
        return itemDate === filter;
      };
      this.tblDataSource.filter = formattedDate;
    } else if (startDate && endDate) {
      // Date-range filter logic
      const formattedStartDate = this.formatDate(startDate);
      const formattedEndDate = this.formatDate(endDate);
  
      this.tblDataSource.filterPredicate = (data: any, filter: string) => {
        const itemDate = data.completed.includes(',') ? this.formatDate(data.completed) : this.convertToDate(data.completed);
        return itemDate >= formattedStartDate && itemDate <= formattedEndDate;
      };
      this.tblDataSource.filter = `${formattedStartDate}:${formattedEndDate}`;
    } else {
      this.tblDataSource.filter = '';
    }
    this.paginator.firstPage();
    this.closeMenu();
  }
  
  resetDate(flag: boolean = false) {
    this.filteredDateAndRangeForm.reset();
    this.tblDataSource.filter = '';
    this.tblDataSource.filterPredicate = (data: any, filter: string) => true;
    this.paginator.firstPage();
    if(!flag){
      this.closeMenu();
    }
  }

  translateArray(complaints: any): string {  
    if (complaints.length === 1 && typeof complaints[0] === 'string' && complaints[0].includes(',')) {
      complaints = complaints[0].split(',').map(item => item.trim());
    }
    return complaints.map(complaint => this.translateService.instant(String(complaint))).join(', ');
  }
}
