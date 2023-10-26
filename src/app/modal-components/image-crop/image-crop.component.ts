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

  closeDialog() {
    this.dialogRef.close();
  }

  cropImage(){
    this.dialogRef.close(this.croppedImage);
  }

  imageCropped(event: ImageCroppedEvent) {
      this.croppedImage = event.base64;
  }

  loadImageFailed() {
      this.isError = true;
  }

}
