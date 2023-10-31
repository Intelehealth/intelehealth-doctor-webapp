import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DocImagesModel } from 'src/app/model/model';
import { DocImagesModel } from 'src/app/model/model';

@Component({
  selector: 'app-images-preview',
  templateUrl: './images-preview.component.html',
  styleUrls: ['./images-preview.component.scss']
})
export class ImagesPreviewComponent implements OnInit {

  imgUrl: string;
  source: DocImagesModel[] = [];
  source: DocImagesModel[] = [];
  startIndex: number;
  min: number = -1;
  max: number = -1;
  constructor(@Inject(MAT_DIALOG_DATA) public data,
  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<ImagesPreviewComponent>) { }

  ngOnInit(): void {
    this.source = this.data.source;
    this.startIndex = this.data.startIndex;
    if (this.source.length) this.min = 0;
    if (this.source.length) this.max = this.source.length - 1;
    if (this.source.length) this.imgUrl = this.data.source[this.data.startIndex].src;
  }

  /**
  * Close modal
  * @param {boolean} val - Dialog result
  * @return {void}
  */
  close(val: boolean) {
    this.dialogRef.close(val);
  }

  /**
  * Move to next image
  * @return {void}
  */
  next() {
    this.startIndex++;
    this.imgUrl = this.source[this.startIndex].src;
  }

  /**
  * Move to previous image
  * @param {boolean} val - Dialog result
  * @return {void}
  */
  previous() {
    this.startIndex--;
    this.imgUrl = this.source[this.startIndex].src;
  }

  /**
  * Handle image not found error
  * @param {Event} event - onerror event
  * @return {void}
  */
  onImageError(event) {
    event.target.src = 'assets/svgs/image-placeholder.jpg';
  }

  /**
  * Check if attachement is pdf
  * @return {boolean} - True if pdf else false
  */
  isPDF(url: string) {
    return url.includes('.pdf');
  }

}
