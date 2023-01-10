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
  info: any = {};
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
  ) { }

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
        }
      });
      this.patientInfo.push(this.info);
      this.getLocationAndSetSanch();
    });
  }

  getLocationAndSetSanch() {
    this.visitService.getLocations().subscribe((res: any) => {
      console.log('this.info: ', this.info);
      const state = res.states.find(state => state?.name === this.info?.preferredAddress?.stateProvince);
      if (state) {
        state.districts.forEach(district => {

          district.sanchs
            .forEach(sanch => {
              const village = sanch.villages.find(vilg => vilg.name === this.info?.preferredAddress?.cityVillage);
              if (village) {
                this.info.sanch = sanch.name;
              }
            });

        });
      }
    })
  }

  getAge(dateString) {
    //------sol 1 ---------------
    // var mydate = dateString.replace(
    //   /^(\d{2})\/(\d{2})\/(\d{4})$/,
    //   "$3, $2, $1"
    // );

    // var b = moment(mydate);
    // var diffDuration = moment.duration(moment().diff(b));
    var diffDuration = moment.duration(moment().diff(moment(dateString, 'DD/MM/YYYY')));
    var ageString =
      diffDuration.years() +
      " years - " +
      diffDuration.months() +
      " months - " +
      diffDuration.days() +
      " days";
    return ageString;
  }
}
