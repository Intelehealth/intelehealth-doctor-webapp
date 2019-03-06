import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-find-patient',
  templateUrl: './find-patient.component.html',
  styleUrls: ['./find-patient.component.css']
})
export class FindPatientComponent implements OnInit {
result: any = [];
value: any = [];
form = new FormGroup ({
   find : new FormControl(''),
});
  constructor(private http: HttpClient) { }

  ngOnInit() {
  }
onSubmit () {
  const find = this.form.value;
  const url = `http://demo.intelehealth.io/openmrs/ws/rest/v1/patient?q=
  ${find.find}&v=custom:(uuid,identifiers:(identifierType:(name),identifier),person)`;
  this.http.get(url)
  .subscribe(response => {
    this.value = response;
    this.result = this.value.results;
  });
  }
}

