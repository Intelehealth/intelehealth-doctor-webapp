import { Component, OnInit } from '@angular/core';
import { ConfirmDialogService } from '../reassign-speciality/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-epartogram',
  templateUrl: './epartogram.component.html',
  styleUrls: ['./epartogram.component.css']
})
export class EpartogramComponent implements OnInit {
  timeSlots = [ 
    {id: 0, value: "5:00"},
    {id: 1, value: "6:00"},
    {id: 2, value: "7:00"},
    {id: 3, value: "8:00"},
    {id: 4, value: "9:00"},
    {id: 5, value: "10:00"},
    {id: 6, value: "11:00"},
    {id: 7, value: "12:00"},
    {id: 8, value: "13:00"},
    {id: 9, value: null},
    {id: 10, value: null},
    {id: 11, value: null },
    ] ;
  stag2TimeSlots = [
    {id: 1, value: "13:05"},
    {id: 2, value: "13:40"},
    {id: 3, value: null}
  ];

  supportiveCare = [ 
    {id: 1, value: "N"},
    {id: 2, value: "Y"},
    {id: 3, value: "N"},
    {id: 4, value: "N"},
    {id: 5, value: "Y"},
    {id: 6, value: "Y"},
    {id: 7, value: "Y"},
    {id: 8, value: "Y"},
    {id: 9, value: null},
    {id: 10, value: null},
    {id: 11, value: null },
    {id: 12, value: null},
    ] ;

  timeRows = [
    {"name" : "Time", 'value': "N"},
    {"name" : "Hours", 'value': "N"},
  ];

  titleRows = [
    {"name" : "Companion", 'value': "N"},
    {"name" : "Pain relief",'value': "N"},
    {"name" : "Oral fluid",'value': "N"},
    {"name" : "Posture",'value': "SP"}
  ]

  babyTitleRows = [
    {"name" : "Amniotic fluid",'value': "M+++, B"},
    {"name" : "Fetal position",'value': "P, T"},
    {"name" : "Caput",'value': "+++"},
    {"name" : "Moulding",'value': "+++"}
  ];

  babyStag2TimeSlots = [
    {id: 1, value: 145},
    {id: 2, value: 125},
    {id: 3, value: 130},
    {id: 4, value: 0},
    {id: 5, value: 0},
    {id: 6, value: 0}
  ];

  womanTitleRows = [
    {"name" : "Pulse", 'value': "<60, ≥120"},
    {"name" : "Systolic BP",'value': "<80, ≥140"},
    {"name" : "Diastolic BP",'value': "≥90"},
    {"name" : "Temperature ℃",'value': "<35.0,≥ 37.5"},
    {"name" : "Urine",'value': "P++, A++"}
  ];
  labourFirstRows = [
    {"name" : "Contractions per 10 min", 'value': "≤2, >5"},
    {"name" : "Duration of contractions",'value': "<20, >60"}
  ];
  labourSecondRows = [
    {"name" : 10, 'value': null},
    {"name" : 9,'value': "≥ 2h"},
    {"name" : 8,'value': "≥ 2.5h"},
    {"name" : 7,'value': "≥ 3h"},
    {"name" : 6,'value': "≥ 5h"},
    {"name" : 5,'value': "≥ 6h"},
  ];
  labourThirdRows = [
    {"name" : 5, 'value': null},
    {"name" : 4,'value': null},
    {"name" : 3,'value': null},
    {"name" : 2,'value': null},
    {"name" : 1,'value': null},
    {"name" : 0,'value': null},
  ];
  medicationRows = [
    {"name" : "Oxytocin (U/L, drops/min)", 'value': "≤2, >5"},
    {"name" : "Medicine", 'value': "≤2, >5"},
    {"name" : "IV fluids",'value': "<20, >60"}
  ];

  doubleColStage1 = [];
  doubleColStage2 = [];

  constructor(private dialogService: ConfirmDialogService ) { }

  ngOnInit(): void {
    this.doubleColStage1 = this.supportiveCare.concat(this.supportiveCare);
    this.doubleColStage2 = this.babyStag2TimeSlots.concat(this.babyStag2TimeSlots);
  }

  submit() {
    this.dialogService.openConfirmDialog("Save ASSESSMENT/PLAN")
    .afterClosed().subscribe(res => {
      if (res) {
      }
    });
  }
}
