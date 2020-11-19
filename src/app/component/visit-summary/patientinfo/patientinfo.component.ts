import { Component, OnInit } from '@angular/core';
import { ImagesService } from 'src/app/services/images.service';
import { ActivatedRoute } from '@angular/router';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from '../../../../environments/environment';



@Component({
  selector: 'app-patientinfo',
  templateUrl: './patientinfo.component.html',
  styleUrls: ['./patientinfo.component.css']
})

export class PatientinfoComponent implements OnInit {
baseURL = environment.baseURL;
image: string;
patientInfo = [];
patientIdentifier: string;
info = {};
profileImagePresent = false;
personAge : any;
yearAge: any
age: any = {}
constructor(private route: ActivatedRoute,
            private visitService: VisitService,
            private service: ImagesService) { }


  ngOnInit() {
      const uuid = this.route.snapshot.paramMap.get('patient_id');
      this.service.fetchProfileImage(uuid)
      .subscribe(response => {
        this.profileImagePresent = true;
        this.image = `${this.baseURL}/personimage/${uuid}`;
      });
      this.visitService.patientInfo(uuid)
      .subscribe(info => {
        this.info = info.person;
       
        this.patientIdentifier = info.identifiers[0].identifier;
        this.info['attributes'].forEach(attri => {
          if (attri.attributeType.display.match('Telephone Number')) {
            this.info['telephone'] = attri.value;
          } else if (attri.attributeType.display.match('occupation')) {
            this.info['occupation'] = attri.value;
          } else if (attri.attributeType.display.match('Health Scheme Card')) {
            this.info['medicalInsurance'] = attri.value;
          }
        });
        this.patientInfo.push(this.info);
      });
    }

    getAge(dateString) {
      var now = new Date();
      var today = new Date(now.getFullYear(),now.getMonth(),now.getDate());
    
      var yearNow = now.getFullYear();
      var monthNow = now.getMonth();
      var dateNow = now.getDate();
    
      var dob = new Date(dateString.substring(6,10),
                         dateString.substring(0,2)-1,                   
                         dateString.substring(3,5)                  
                         );
    
      var yearDob = dob.getFullYear();
      var monthDob = dob.getMonth();
      var dateDob = dob.getDate();
      var age = {};
      var ageString = "";
      var yearString = "";
      var monthString = "";
      var dayString = "";
    
      this.yearAge = yearNow - yearDob;
    
      if (monthNow >= monthDob)
        var monthAge = monthNow - monthDob;
      else {
        this.yearAge--;
        var monthAge = 12 + monthNow -monthDob;
      }
    
      if (dateNow >= dateDob)
        var dateAge = dateNow - dateDob;
      else {
        monthAge--;
        var dateAge = 31 + dateNow - dateDob;
    
        if (monthAge < 0) {
          monthAge = 11;
          this.yearAge--;
        }
      }
      
      age = {
        years: this.yearAge,
        months: monthAge,
        days: dateAge
      };
    
      if ( age['years'] > 1 ) yearString = " years"; 
      else yearString = " year";
      if ( age['months']> 1 )monthString = " months";
      else monthString = " month";
      if (age['days'] > 1 ) dayString = " days";
      else dayString = " day";
    

      if ( (age['years'] > 0) && (age['months'] > 0) && (age['days'] > 0) )
        ageString = age['years'] + yearString + " " + age['months'] + monthString  + " " + age['days'] + dayString ;
      else if ( (age['years'] == 0) && (age['months'] == 0) && (age['days'] > 0) )
        ageString = "Only " + age['days'] + dayString + " old!";
      else if ( (age['years'] > 0) && (age['months'] == 0) && (age['days'] == 0) )
        ageString = age['years'] + yearString + " old. Happy Birthday!!";
   
      else if ( (age['years'] > 0) && (age['months'] > 0) && (age['days'] == 0) )
        ageString = age['years'] + yearString + " and " + age['months'] + monthString ;
     
      else if ( (age['years'] == 0) && (age['months'] > 0) && (age['days'] > 0) )
        ageString = age['months'] + monthString + " and " + age['days'] + dayString ;
     
      else if ( (age['years'] > 0) && (age['months'] == 0) && (age['days'] > 0) )
        ageString = age['years'] + yearString + " and " + age['days'] + dayString ;
     
      else if ( (age['years'] == 0) && (age['months'] > 0) && (age['days'] == 0))
        ageString = age['months'] + monthString ;
     
      else
        ageString = "Oops! Could not calculate age!";
     
    
      return ageString;
    }
    
}
