import { Component, OnInit } from "@angular/core";
import { IDropdownSettings } from "ng-multiselect-dropdown";
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
  filteredVillagePatients = [];
  isDisabled: Boolean = false;
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
  ) {}

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
        console.log("visits", this.visits);
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
    }
  }

  onDistrictSelect(district: any) {
    if (district?.sanchs?.length) {
      this.sanchs = district.sanchs;
    }
  }

  onSanchSelect(sanch: any) {
    if (sanch?.villages?.length) {
      this.villages = sanch.villages;
    }
  }

  onVillageSelect(village: any) {
    this.filteredVillagePatients = this.visits.filter(
      (x) => x?.location?.display === village?.name
    );

    console.log("this.filteredVillagePatients: ", this.filteredVillagePatients);

    const villageList = this.filteredVillagePatients.map((object) => {
      return { ...object, isSelected: false };
    });
  }

  // findSevika(visits) {
  //   for (let index = 0; index < visits.length; index++) {
  //     const encounter = visits[index].encounters;
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
    if (patientsList?.length) {
      const payload = {
        sevikaName: this.sevikaName,
        sevikaMobNo: this.sevikaMobNo,
        message: this.templateSMS,
        patients: patientsList,
      };
      //    console.log("payload", payload);
      console.log("patientsList", patientsList);
    }
  }
}
