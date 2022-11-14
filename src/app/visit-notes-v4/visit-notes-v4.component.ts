import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModalComponent } from '../modals/common-modal/common-modal.component';

@Component({
  selector: 'app-visit-notes-v4',
  templateUrl: './visit-notes-v4.component.html',
  styleUrls: ['./visit-notes-v4.component.scss']
})
export class VisitNotesV4Component implements OnInit {
  @ViewChild('sharePrescription') sharePrescription: CommonModalComponent;

  sharePrescModal: any = {
    mainText: 'Share prescription',
    subText: 'Are you sure you want to share this prescription?',
    leftBtnText: 'Go Back',
    leftBtnOnClick: () => {

    },
    rightBtnText: 'Confirm',
    rightBtnOnClick: () => {

    },
    circleIconPath: 'assets/svgs/prescription.svg',
    circleBgIconPath: 'assets/svgs/circle.svg'
  }

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.sharePrescription.openModal();
  }

}
