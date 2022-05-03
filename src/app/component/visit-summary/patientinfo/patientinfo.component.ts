import { PersonService } from './../../../services/person.service';
import { Component, Input, OnInit } from '@angular/core';
import { ImagesService } from 'src/app/services/images.service';
import { ActivatedRoute } from '@angular/router';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from '../../../../environments/environment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
declare var getFromStorage: any;

@Component({
  selector: 'app-patientinfo',
  templateUrl: './patientinfo.component.html',
  styleUrls: ['./patientinfo.component.css']
})

export class PatientinfoComponent implements OnInit {
  baseURL = environment.baseURL;
  image: string;
  patientInfo: any;
  info = {};
  profileImagePresent = false;
  coordinator: Boolean = getFromStorage('coordinator') || false;
  editMobile: Boolean = false;
  newPhone = '';
  personId = '';
  contactUuid = '';
  @Input() showDetails;

  patientForm = new FormGroup({
    mobile: new FormControl('', [Validators.required])
  });

  constructor(private route: ActivatedRoute,
            private visitService: VisitService,
            private service: ImagesService,
            private personService: PersonService) { }

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get('patient_id');
    this.service.fetchProfileImage(uuid)
    .subscribe(response => {
      if (response) {
        this.profileImagePresent = true;
        this.image = `${this.baseURL}/personimage/${uuid}`;
      }
    });
    this.visitService.patientInfo(uuid)
    .subscribe(info => {
      this.info = info.person;
      this.personId = info.person.uuid;
      this.info['patientIdentifier'] = info.identifiers[0].identifier;
      this.info['attributes'].forEach(attri => {
        if (attri.attributeType.display.match('Telephone Number')) {
          this.info['telephone'] = attri.value;
          this.contactUuid = attri.uuid;
        } else if (attri.attributeType.display.match('occupation')) {
          this.info['occupation'] = attri.value;
        }
      });
      if (this.coordinator) {
        const visitProvider = getFromStorage('healthWorkerDetails');
        if (visitProvider && !this.info['healthWorker']) {
          this.info['healthWorker'] = visitProvider.encounterProviders[0].display.split(':')[0];
        }
      }
      this.patientInfo = {
        ...this.info,
        birthdate: this.getAge(this.info['birthdate'])
      };
    });
  }

  getAge (dateString: string) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  }

  onClick(type, value) {
    if (type === 'edit') {
      this.editMobile = true;
      this.newPhone = value;
    } else {
      this.editMobile = false;
      this.saveNewContact();
    }
  }

  onChange(value) {
    this.newPhone = value;
  }

  saveNewContact() {
    const json = {
      attributeType: '14d4f066-15f5-102d-96e4-000c29c2a5d7',
      value: this.newPhone,
    };
    this.personService.saveContact(this.personId, this.contactUuid, json)
    .subscribe(response => {
      if (response) {
        this.patientInfo.telephone = this.newPhone;
      }
    });
  }
}
