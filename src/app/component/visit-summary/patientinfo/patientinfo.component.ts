import { Component, OnInit } from "@angular/core";
import { ImagesService } from "src/app/services/images.service";
import { ActivatedRoute } from "@angular/router";
import { VisitService } from "src/app/services/visit.service";
import { environment } from "../../../../environments/environment";
import * as moment from "moment";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-patientinfo",
  templateUrl: "./patientinfo.component.html",
  styleUrls: ["./patientinfo.component.css"],
  providers: [DatePipe],
})
export class PatientinfoComponent implements OnInit {
  baseURL = environment.baseURL;
  image: string;
  patientInfo = [];
  patientIdentifier: string;
  info = {};
  profileImagePresent = false;
  personAge: any;
  yearAge: any;
  age: any = {};
  now: any;
  a: any;

  constructor(
    private route: ActivatedRoute,
    private visitService: VisitService,
    private service: ImagesService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get("patient_id");
    this.service.fetchProfileImage(uuid).subscribe((response) => {
      this.profileImagePresent = true;
      this.image = `${this.baseURL}/personimage/${uuid}`;
    });
    this.visitService.patientInfo(uuid).subscribe((info) => {
      this.info = info.person;

      this.patientIdentifier = info.identifiers[0].identifier;
      this.info["attributes"].forEach((attri) => {
        if (attri.attributeType.display.match("Telephone Number")) {
          this.info["telephone"] = attri.value;
        } else if (attri.attributeType.display.match("occupation")) {
          this.info["occupation"] = attri.value;
        } else if (attri.attributeType.display.match("Health Scheme Card")) {
          this.info["medicalInsurance"] = attri.value;
        }
      });
      this.patientInfo.push(this.info);
    });
  }

  getAge(dateString) {
    //------sol 1 ---------------
    var mydate = dateString.replace(
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
      "$3, $2, $1"
    );

    this.now = new Date();
    var todayDate = this.datePipe.transform(this.now, "yyyy, MM, dd");

    var a = moment([todayDate]);
    var b = moment([mydate]);

    var diffDuration = moment.duration(a.diff(b));
    var ageString = diffDuration.years() + " years - " + diffDuration.months() + " months - " + diffDuration.days() + " days";
    return ageString;
    

    // console.log("year----",diffDuration.years()); // 8 years
    // console.log("months----",diffDuration.months()); // 5 months
    // console.log("days----", diffDuration.days()); // 2 days

    // var years = a.diff(b, 'year');
    // b.add(years, 'years');

    // var months = a.diff(b, 'months', true) % 12;
    // console.log('months: ', months);
    // b.add(months, 'months');

    // var days = a.diff(b, 'days', true);

    // ageString = years + " years " + months + " months " + days + " days";
    // return ageString;

    //----sol 3-----------
    //   var now = new Date();
    //   var today = new Date(now.getFullYear(),now.getMonth(),now.getDate());

    //   var yearNow = now.getFullYear();
    //   var monthNow = now.getMonth();
    //   var dateNow = now.getDate();

    //   var dob = new Date(dateString.substring(6,10),
    //                      dateString.substring(0,2)-1,
    //                      dateString.substring(3,5)
    //                      );

    //   var yearDob = dob.getFullYear();
    //   var monthDob = dob.getMonth();
    //   var dateDob = dob.getDate();
    //   var age = {};
    //   var ageString = "";
    //   var yearString = "";
    //   var monthString = "";
    //   var dayString = "";

    //   this.yearAge = yearNow - yearDob;

    //   if (monthNow >= monthDob)
    //     var monthAge = monthNow - monthDob;
    //   else {
    //     this.yearAge--;
    //     var monthAge = 12 + monthNow -monthDob;
    //   }

    //   if (dateNow >= dateDob)
    //     var dateAge = dateNow - dateDob;
    //   else {
    //     monthAge--;
    //     var dateAge = 31 + dateNow - dateDob;

    //     if (monthAge < 0) {
    //       monthAge = 11;
    //       this.yearAge--;
    //     }
    //   }

    //   age = {
    //     years: this.yearAge,
    //     months: monthAge,
    //     days: dateAge
    //   };

    //   if ( age['years'] > 0 ) yearString = " years";
    //   else yearString = " year";
    //   if ( age['months'] > 0 )monthString = " months";
    //   else monthString = " month";
    //   if (age['days'] > 0 ) dayString = " days";
    //   else dayString = " day";

    //   if ( (age['years'] > 0) && (age['months'] > 0) && (age['days'] > 0) )
    //     ageString = age['years'] + yearString + " - " + age['months'] + monthString  + " - " + age['days'] + dayString ;

    //   else if ( (age['years'] == 0) && (age['months'] == 0) && (age['days'] == 0) )
    //     ageString = age['years'] + yearString + " - " + age['months'] + monthString  + " - " + age['days'] + dayString ;

    //   else if ( (age['years'] == 0) && (age['months'] == 0) && (age['days'] > 0) )
    //     ageString = "Only " + age['days'] + dayString + " old!";

    //     else if ( (age['years'] > 0) && (age['months'] == 0) && (age['days'] == 0) )
    //     ageString = age['years'] + yearString + " old. Happy Birthday!!";

    //   else if ( (age['years'] > 0) && (age['months'] > 0) && (age['days'] == 0) )
    //     ageString = age['years'] + yearString + " - " + age['months'] + monthString ;

    //   else if ( (age['years'] == 0) && (age['months'] > 0) && (age['days'] > 0) )
    //     ageString = age['months'] + monthString + " - " + age['days'] + dayString ;

    //   else if ( (age['years'] > 0) && (age['months'] == 0) && (age['days'] > 0) )
    //     ageString = age['years'] + yearString + " - " + age['days'] + dayString ;

    //   else if ( (age['years'] == 0) && (age['months'] > 0) && (age['days'] == 0))
    //     ageString = age['months'] + monthString ;

    //   else
    //     ageString = "Oops! Could not calculate age!";

    //   return ageString;
  }
}
