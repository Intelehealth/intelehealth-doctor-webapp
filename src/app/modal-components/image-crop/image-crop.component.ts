import { Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-image-crop',
  templateUrl: './image-crop.component.html',
  styleUrls: ['./image-crop.component.scss']
})
export class ImageCropComponent {

  imageBase64: string = '';
  croppedImage: string = '';
  isError: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<ImageCropComponent>) {
    this.imageBase64 = this.data.base64;
  }

  /**
  * Close modal
  * @return {void}
  */
  closeDialog() {
    this.dialogRef.close();
  }

  /**
  * Save cropped image
  * @return {void}
  */
  cropImage(){
    this.dialogRef.close(this.croppedImage);
  }

  /**
  * Callback for image cropped event
  * @param {ImageCroppedEvent} event - Image cropped event
  * @return {void}
  */
  imageCropped(event: ImageCroppedEvent) {
      this.croppedImage = event.base64;
  }

  /**
  * Callback for image load failed
  * @return {void}
  */
  loadImageFailed() {
      this.isError = true;
  }

}
