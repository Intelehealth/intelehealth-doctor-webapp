import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DocImagesModel } from 'src/app/model/model';

@Component({
  selector: 'app-images-preview',
  templateUrl: './images-preview.component.html',
  styleUrls: ['./images-preview.component.scss']
})
export class ImagesPreviewComponent implements OnInit {

  imgUrl: string;
  source: DocImagesModel[] = [];
  startIndex: number;
  min: number = -1;
  max: number = -1;
  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<ImagesPreviewComponent>) { }

  ngOnInit(): void {
    this.source = this.data.source;
    this.startIndex = this.data.startIndex;
    if (this.source.length) this.min = 0;
    if (this.source.length) this.max = this.source.length - 1;
    if (this.source.length) this.imgUrl = this.data.source[this.data.startIndex].src;
  }

  close(val: boolean) {
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

  onImageError(event) {
    event.target.src = 'assets/svgs/image-placeholder.jpg';
  }

  isPDF(url: string) {
    return url.includes('.pdf');
  }

}
