import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { ChatService } from "src/app/services/chat.service";
import { VisitService } from "src/app/services/visit.service";

@Component({
  selector: "app-send-sms",
  templateUrl: "./send-sms.component.html",
  styleUrls: ["./send-sms.component.css"],
})
export class SendSmsComponent implements OnInit {
  states: any = [];
  districts: any = [];
  sanchs: any = [];
  villages: any = [];
  visits: any = [];
  info: any = {};
  patientsMobileNumbers: any[];
  filteredVillagePatients = [];
  isDisabled: Boolean = false;
  isShow: Boolean = false;
  isDistrict: Boolean = false;
  isSanch: Boolean = false;
  isVillage: Boolean = false;
  sevikaName: any = "";
  sevikaMobNo: any = "";
  templateSMS: any;
  selectedState: any;
  selectedDistrict: any;
  selectedSanch: any;
  selectedVillage: any;
  /* For State DropDown */
  stateDropDownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: "districts",
    textField: "name",
    // itemsShowLimit: 5,
    allowSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  /* For District DropDown */
  districtDropDownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: "sanchs",
    textField: "name",
    // itemsShowLimit: 5,
    allowSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  /* For Sanch DropDown */
  sanchDropDownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: "villages",
    textField: "name",
    // itemsShowLimit: 5,
    allowSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  /* For Village DropDown */
  villageDropDownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: "uuid",
    textField: "name",
    // itemsShowLimit: 5,
    allowSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  constructor(
    private visitService: VisitService,
    private chatService: ChatService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getLocationAndSetSanch();
    this.getVisits();
  }

  getLocationAndSetSanch() {
    this.visitService.getLocations().subscribe((res: any) => {
      this.states = res.states;
    });
  }

  getVisits() {
    this.visitService.getVisits().subscribe(
      (response) => {
        this.visits = response.results;
      },
      (err) => {
        if (err.error instanceof Error) {
        } else {
        }
      }
    );
  }

  get template() {
    this.templateSMS = `प्रिय बंधू/भगिनी, नमस्ते,आपके लिए खुश खबर/ नया वर्ष आपके लिए खुश खबर लेकर आया है/ बधाई हो! आपके गाँव में एकल आरोग्य टेलीमेडिसिन परियोजना की शुरुआत हो गई है,जिसके माध्यम से आपने गाँव से ही डॉक्टर की सेवाओं का लाभ ले सकते है| किसी भी प्रकार की डॉक्टर की सलाह और अधिक जानकरी के लिए आप अपने गाँव की सेविका से संपर्क कर सकते है| सेविका का नाम ${this.sevikaName} मोबाइल नंबर ${this.sevikaMobNo} धन्यवाद - एकल आरोग्य फाउंडेशन ऑफ़ इंडिया`;
    return this.templateSMS;
  }

  selectAllVisits(event) {
    const checked = event.target.checked;
    this.filteredVillagePatients.forEach((item) => (item.isSelected = checked));
  }

  selectIndividualVisit(event) {
    this.filteredVillagePatients.every(function (item: any) {
      return item.isSelected == true;
    });
  }

  onStateSelect(state: any) {
    if (state?.districts?.length) {
      this.districts = state.districts;
      this.isDistrict = true;
    }
  }

  onDistrictSelect(district: any) {
    if (district?.sanchs?.length) {
      this.sanchs = district.sanchs;
      this.isSanch = true;
    }
  }

  onSanchSelect(sanch: any) {
    if (sanch?.villages?.length) {
      this.villages = sanch.villages;
      this.isVillage = true;
    }
  }

  onVillageSelect(village: any) {
    this.filteredVillagePatients = this.visits.filter(
      (x) => x?.location?.display === village?.name
    );

    this.filteredVillagePatients.forEach((patient) => {
      patient.isSelected = true;
    });
    console.log('Patients', this.filteredVillagePatients);
    this.isShow = true;
  }

  toast({
    message,
    duration = 5000,
    horizontalPosition = "center",
    verticalPosition = "bottom",
  }) {
    const opts: any = {
      duration,
      horizontalPosition,
      verticalPosition,
    };
    this.snackbar.open(message, null, opts);
  }


  // findSevika(filteredPatients) {
  //   for (let index = 0; index < filteredPatients.length; index++) {
  //     const encounter = filteredPatients[index].encounters;
  //     if (encounter?.length) {
  //       for (let index = 0; index < encounter.length; index++) {
  //         const encounterProviders = encounter[index].encounterProviders;
  //         //this.sevikaId = encounterProviders[0]?.uuid;
  //         if (encounterProviders?.length) {
  //           const provider = encounterProviders[0].provider;
  //            this.sevikaId = provider?.uuid;
  //         }
  //       }
  //     }
  //   }
  //   if (this.sevikaId) {
  //     this.getSevikaDetails(this.sevikaId);
  //   }
  // }

  sendSMS() {
    const patientsList = this.filteredVillagePatients.filter(function (vil) {
      return vil.isSelected === true;
    });

    const patientsListPromises = patientsList.map((patient) =>
      this.visitService.patientInfo(patient?.patient?.uuid).toPromise()
    );
    Promise.all(patientsListPromises).then((results) => {
      this.patientsMobileNumbers = results
        .map((info) => {
          const personData: any = info.person;
          let phoneNo = null;
          let number = 91;
          personData.attributes.forEach((attri) => {
            if (attri.attributeType.display.match("Telephone Number")) {
              phoneNo = attri.value;
              if (phoneNo?.length === 10) {
                phoneNo = "91" + phoneNo;
              }
            }
          });

          return phoneNo;
        })
        .filter((mob) => mob);
      if (patientsList?.length) {
        const payload = {
          message: this.templateSMS,
          patients: this.patientsMobileNumbers,
        };
        this.chatService.sendSMS(payload).subscribe((res: any) => {
          if (res.status) {
            const message = res.message || "SMS sent successfully.";
            this.toast({ message });
          }
        });
      }
    });
  }

  get isAllSelected() {
    let allSelected = true;
    this.filteredVillagePatients.forEach((visit) => {
      if (!visit.isSelected) {
        allSelected = false;
      }
    });
    return allSelected;
  }

  get hasSevikaNameAndMobile() {
    return !!this.sevikaName && !!this.sevikaMobNo
  }
}
