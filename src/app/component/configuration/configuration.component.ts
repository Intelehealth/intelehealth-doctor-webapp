import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MindmapService } from 'src/app/services/mindmap.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {
  data;
  oxytocinOptions = [
    { "id": 1, "name": "U/L", "selected": false },
    { "id": 2, "name": "drops/min", "selected": false }
  ];
  selectedOxytocin:string;
  constructor(private mindmapService: MindmapService,
    private snackbar: MatSnackBar) { }

  ngOnInit(): void {
    this.mindmapService.getConfiguration().subscribe(
      (response) => {
        this.data = response?.data;
        this.data.forEach((d1) => {
          if(d1.name === "Oxytocin") {
            this.selectedOxytocin = d1.value;
          }
        })
        this.oxytocinOptions.forEach((op) => {
          if(op.name === this.selectedOxytocin) {
            op.selected = true;
          }
        })
      },
      (err) => {
        const message =
          err?.error?.message || err?.message || "Something went wrong";
        this.snackbar.open(message, null, {
          duration: 4000,
        });
      }
    );
  }

  radioChange(event) {
    this.oxytocinOptions.forEach((op) => {
      if (op.id === event.value) {
        op.selected = true;
      } else {
        op.selected = false;
      }
    });
  }

  save() {
    let selectedValue = this.oxytocinOptions
      .filter((op) => op.selected);
    if (selectedValue.length > 0) {
      let body = {
        name: "Oxytocin",
        value: selectedValue[0].name
      }
      this.mindmapService.addUpdateConfiguration(body)
        .subscribe((res) => {
          this.snackbar.open(res.message, null, { duration: 4000 });
        },
          (error) => {
            this.snackbar.open(error.message, null, { duration: 4000 });
          });
    }
  }
}
