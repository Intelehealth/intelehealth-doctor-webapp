import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';


export interface AppointmentDatas {
  patientId: string;
  patientName: string;
  patientGender: string;
  patientAge: number;
  starts_in: string;
  visit: {
    location: {
      name: string;
    };
  };
  cheif_complaint: string;
  telephone: string | null;
  visitUuid: string;
}

const appointmentsList: AppointmentDatas[] = [
  {
    patientId: '12345',
    patientName: 'John Doe',
    patientGender: 'Male',
    patientAge: 35,
    starts_in: 'Due : 10 Sep, 2024 09:00 AM',
    visit: { location: { name: 'Telemedicine Clinic 1' } },
    cheif_complaint: 'Headache',
    telephone: '+1234567890',
    visitUuid: 'visit-uuid-001',
  },
  {
    patientId: '12346',
    patientName: 'Jane Smith',
    patientGender: 'Female',
    patientAge: 28,
    starts_in: 'Due : 10 Sep, 2024 09:00 AM',
    visit: { location: { name: 'Telemedicine Clinic 2' } },
    cheif_complaint: 'Fever',
    telephone: '+0987654321',
    visitUuid: 'visit-uuid-002',
  },
  {
    patientId: '12347',
    patientName: 'Alice Johnson',
    patientGender: 'Female',
    patientAge: 40,
    starts_in: 'Due : 10 Sep, 2024 09:00 AM',
    visit: { location: { name: 'Telemedicine Clinic 3' } },
    cheif_complaint: 'Cough',
    telephone: '+919582300883', // No contact
    visitUuid: 'visit-uuid-003',
  },
  {
    patientId: '12348',
    patientName: 'Bob Brown',
    patientGender: 'Male',
    patientAge: 55,
    starts_in: 'Due : 10 Sep, 2024 09:00 AM',
    visit: { location: { name: 'Telemedicine Clinic 4' } },
    cheif_complaint: 'Back Pain',
    telephone: '+1122334455',
    visitUuid: 'visit-uuid-004',
  },
  {
    patientId: '12348',
    patientName: 'Bob Brown',
    patientGender: 'Male',
    patientAge: 55,
    starts_in: 'Due : 10 Sep, 2024 09:00 AM',
    visit: { location: { name: 'Telemedicine Clinic 4' } },
    cheif_complaint: 'Back Pain',
    telephone: '+1122334455',
    visitUuid: 'visit-uuid-004',
  },
  {
    patientId: '12348',
    patientName: 'Bob Brown',
    patientGender: 'Male',
    patientAge: 55,
    starts_in: 'Due : 10 Sep, 2024 09:00 AM',
    visit: { location: { name: 'Telemedicine Clinic 4' } },
    cheif_complaint: 'Back Pain',
    telephone: '+1122334455',
    visitUuid: 'visit-uuid-004',
  },
  {
    patientId: '12348',
    patientName: 'Bob Brown',
    patientGender: 'Male',
    patientAge: 55,
    starts_in: 'Due : 10 Sep, 2024 09:00 AM',
    visit: { location: { name: 'Telemedicine Clinic 4' } },
    cheif_complaint: 'Back Pain',
    telephone: '+1122334455',
    visitUuid: 'visit-uuid-004',
  },
];


@Component({
  selector: 'lib-appointment-table',
  templateUrl: './appointment-table.component.html',
  styleUrls: ['./appointment-table.component.scss']
})
export class AppointmentTableComponent implements OnInit {
  items = ["Appointments"];
  expandedIndex = 0;
  displayedColumns: string[] = ['name', 'age', 'starts_in', 'location', 'cheif_complaint', 'telephone', 'actions'];
  dataSource = new MatTableDataSource<any>();
  isLoaded: boolean = false;
  appointments = appointmentsList;
  patientRegFields: string[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('searchInput', { static: true }) searchElement: ElementRef;

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
    this.dataSource = new MatTableDataSource(this.appointments);
    this.dataSource.paginator = this.paginator;
    console.log(this.dataSource.filteredData.length, 'dataSource');
  }

  constructor( 
   ) { 
      this.displayedColumns = this.displayedColumns.filter(col=>(col!=='age' || this.checkPatientRegField('Age')));
    }

  ngOnInit(): void {
  }

  /**
  * Apply filter on a datasource
  * @param {Event} event - Input's change event
  * @return {void}
  */
  applyFilter1(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
  * Clear filter from a datasource
  * @return {void}
  */
  clearFilter() {
    this.dataSource.filter = null;
    this.searchElement.nativeElement.value = "";
  }

  checkPatientRegField(fieldName): boolean{
    return this.patientRegFields.indexOf(fieldName) !== -1;
  }

}

