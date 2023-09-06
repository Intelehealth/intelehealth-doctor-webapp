import { Component, OnInit, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-image-crop',
  templateUrl: './image-crop.component.html',
  styleUrls: ['./image-crop.component.scss']
})
export class ImageCropComponent implements OnInit {

  imageBase64: any = '';
  croppedImage: any = '';
  isError: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<ImageCropComponent>) { 
    this.imageBase64 = this.data.base64;
  }

  ngOnInit(): void {
    
  }

  closeDialog() {
    this.dialogRef.close();
  }
  
  cropImage(){
    this.dialogRef.close(this.croppedImage);
  }
  
  imageCropped(event: ImageCroppedEvent) {
      this.croppedImage = event.base64;
      console.log('image64',this.croppedImage);
  }
  loadImageFailed() {
      this.isError = true;
  }

}
