import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

export interface FileUploadOptions {
  allowedFileTypes?: string[];
  maxFileSize?: number; // in bytes
  multiple?: boolean;
  accept?: string;
}

@Component({
  selector: 'app-common-file-upload',
  templateUrl: './common-file-upload.component.html',
  styleUrls: ['./common-file-upload.component.scss']
})
export class CommonFileUploadComponent {
  @Input() options: FileUploadOptions = {
    allowedFileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxFileSize: 5 * 1024 * 1024, // 5MB default
    multiple: false,
    accept: '.pdf,.jpg,.jpeg,.png'
  };

  @Input() isUploading: boolean = false;
  @Output() uploadError = new EventEmitter<string>();
  @Output() uploadClicked = new EventEmitter<{ base64: string; fileName: string; fileType: string; file: File }>();

  selectedFileName: string = '';
  private selectedFileData: { base64: string; fileName: string; fileType: string } | null = null;
  private selectedFile: File | null = null;

  constructor(
    private toastr: ToastrService,
    private translateService: TranslateService
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (this.options.allowedFileTypes && 
        !this.options.allowedFileTypes.some(type => 
          file.name.toLowerCase().endsWith(type.toLowerCase())
        )) {
      this.toastr.error(
        this.translateService.instant('Invalid file type. Allowed types: ') + 
        this.options.allowedFileTypes.join(', ')
      );
      return;
    }

    // Validate file size
    if (this.options.maxFileSize && file.size > this.options.maxFileSize) {
      this.toastr.error(
        this.translateService.instant('File size exceeds the maximum limit of ') + 
        (this.options.maxFileSize / (1024 * 1024)) + 'MB'
      );
      return;
    }

    this.selectedFileName = file.name;
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      this.selectedFileData = {
        base64: base64String,
        fileName: file.name,
        fileType: file.type
      };
    };

    reader.onerror = () => {
      this.uploadError.emit('Error reading file');
      this.toastr.error(this.translateService.instant('Error reading file'));
    };

    reader.readAsDataURL(file);
  }

  clearSelection(): void {
    this.selectedFileName = '';
    this.selectedFileData = null;
    this.selectedFile = null;
  }

  onUploadClick(): void {
    if (this.selectedFileData && this.selectedFile) {
      this.uploadClicked.emit({ ...this.selectedFileData, file: this.selectedFile });
    }
  }
} 