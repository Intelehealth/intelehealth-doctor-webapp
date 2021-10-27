import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordComponent } from '../../change-password/change-password.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FindPatientComponent } from '../../find-patient/find-patient.component';
import { environment } from '../../../../environments/environment';
declare var getFromStorage: any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  baseURL = environment.baseURL;
  baseURLLegacy = environment.baseURLLegacy;
  systemAccess = false;
  reportAccess = false;
  values: any = [];

  searchForm = new FormGroup({
    findInput: new FormControl('', [Validators.required])
  });

  @Output() messageEvent = new EventEmitter<string>();


  constructor(private authService: AuthService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private http: HttpClient) { }

  ngOnInit() {
    const userDetails = getFromStorage('user');

    if (userDetails) {
      const roles = userDetails['roles'];
      roles.forEach(role => {
        if (role.display === "Organizational: System Administrator") {
          this.systemAccess = true;
        } if (role.display === "Project Manager" || role.display === "Reporting module" || role.display === "Organizational: System Administrator" ) {
          this.reportAccess = true;
        }
      });
    } else { this.authService.logout(); }
  }

  logout() {
    this.authService.logout();
  }

  changePassword() {
    this.dialog.open(ChangePasswordComponent, { width: '500px' });
  }

  search() {
    const search = this.searchForm.value;
    if (search.findInput === null || search.findInput.length < 3) {
      this.dialog.open(FindPatientComponent, { width: '50%', data: { value: 'Please enter min 3 characters' } });
    } else {
      // tslint:disable-next-line: max-line-length
      const url = `${this.baseURL}/patient?q=${search.findInput}&v=custom:(uuid,identifiers:(identifierType:(name),identifier),person)`;
      this.http.get(url)
        .subscribe(response => {
          this.values = [];
          response['results'].forEach(value => {
            if (value) {
              if (value.identifiers.length) {
                this.values.push(value);
              }
            }
          });
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

  callTour() {
    this.messageEvent.emit();
  }
}
