import { VisitService } from "./../../services/visit.service";
import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Router } from "@angular/router";

@Component({
  selector: "app-find-patient",
  templateUrl: "./find-patient.component.html",
  styleUrls: ["./find-patient.component.css"],
})
export class FindPatientComponent implements OnInit {
  values: any;
  msg = "Sorry no Case Found..";
  gender: string;

  constructor(
    public dialog: MatDialogRef<FindPatientComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private service: VisitService,
    private router: Router
  ) {}

  ngOnInit() {
    if (typeof this.data.value === "string") {
      this.values = [];
      this.msg = this.data.value;
    } else {
      this.values = this.data.value;
      this.gender = this.getPatientInfo(this.values[0].person.gender);
    }
  }

  find(uuid) {
    this.service.recentVisits(uuid).subscribe((response) => {
      this.router.navigate([
        "/pastVisit",
        response.results[0].patient.uuid,
        // response.results[0].uuid,
      ]);
      this.dialog.close();
    });
  }

  getPatientInfo(attriValue) {
    let value;
    if (attriValue.toString().startsWith("{")) {
      let value1 = JSON.parse(attriValue.toString());
      value = value1["en"];
    } else {
      value = attriValue
    }
    return value;
  }
}
