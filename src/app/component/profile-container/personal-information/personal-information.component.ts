import { Component, ElementRef, ViewChild } from '@angular/core';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.scss']
})
export class PersonalInformationComponent{
  @ViewChild('canvas') canvasEl: ElementRef;
  signatureImg: string;
  signaturePad: SignaturePad;
  moveTo: boolean = false;
  
  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
  }

  startDrawing(event: Event) {
    console.log(event);
  }

  clearPad() {
    this.signaturePad.clear();
  }

  toggleCollapse(){
    this.moveTo = !this.moveTo;
  }

  onToggleBack(data:boolean){
    this.moveTo = data;
  }
}
