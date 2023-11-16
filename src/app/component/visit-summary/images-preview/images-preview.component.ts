import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-images-preview',
  templateUrl: './images-preview.component.html',
  styleUrls: ['./images-preview.component.css']
})
export class ImagesPreviewComponent implements OnInit {

  imgUrl: string;
  source: any = [];
  startIndex: number;
  min: number = -1;
  max: number = -1;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<ImagesPreviewComponent>) { }

  ngOnInit(): void {
    this.source = this.data.source;
    this.startIndex = this.data.startIndex;
    if (this.source.length) this.min = 0;
    if (this.source.length) this.max = this.source.length - 1;
    if (this.source.length) this.imgUrl = this.data.source[this.data.startIndex].src;
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

  next() {
    this.startIndex++;
    this.imgUrl = this.source[this.startIndex].src;
  }

  previous() {
    this.startIndex--;
    this.imgUrl = this.source[this.startIndex].src;
  }

  onImageError(event: any) {
    event.target.src = 'assets/svgs/image-placeholder.jpg';
  }

  isPDF(url) {
    return url.includes('.pdf');
  }

}
