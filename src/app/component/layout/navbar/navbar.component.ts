import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ChangePasswordComponent } from '../../change-password/change-password.component';
import { EncounterService } from 'src/app/services/encounter.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FindPatientComponent } from '../../find-patient/find-patient.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  // baseURL = window.location.host;
  baseURL = '13.233.50.223:8080';
  systemAccess = false;
  reportAccess = false;
  values: any = [];

  searchForm = new FormGroup({
    findInput: new FormControl('', [Validators.required])
  });


  constructor(private authService: AuthService,
    private dialog: MatDialog,
    private service: EncounterService,
    private snackbar: MatSnackBar,
    private http: HttpClient) { }

  ngOnInit() {
    this.service.session()
      .subscribe(response => {
        const roles = response.user['roles'];
        roles.forEach(role => {
          if (role.uuid === 'f6de773b-277e-4ce2-9ee6-8622b8a293e8') {
            this.systemAccess = true;
          } if (role.uuid === 'f6de773b-277e-4ce2-9ee6-8622b8a293e8' || role.uuid === 'a5df6aa5-d6e5-4b56-b0e7-315ee0899f97') {
            this.reportAccess = true;
          }
        });
      });
  }

  logout() {
    this.authService.logout();
  }

  changePassword() {
    this.dialog.open(ChangePasswordComponent, { width: '500px' });
  }

  search() {
    const search = this.searchForm.value;
    if (search.findInput.length < 3) {
    this.dialog.open(FindPatientComponent, { width: '50%', data: { value: 'Please Enter min 3 characters' } });
    } else {
    // tslint:disable-next-line: max-line-length
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/patient?q=${search.findInput}&v=custom:(uuid,identifiers:(identifierType:(name),identifier),person)`;
    this.http.get(url)
      .subscribe(response => {
        this.values = response['results'];
        this.dialog.open(FindPatientComponent, { width: '90%', data: { value: this.values } });
      }, err => {
        if (err.error instanceof Error) {
          this.snackbar.open('Client-side error', null, { duration: 2000 });
        } else {
          this.snackbar.open('Server-side error', null, { duration: 2000 });
        }
      });
    }
    this.searchForm.reset();
  }

}
