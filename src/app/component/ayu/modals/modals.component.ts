import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
  selector: "app-modals",
  templateUrl: "./modals.component.html",
  styleUrls: ["./modals.component.css"],
})
export class ModalsComponent implements OnInit {
  file: any;
  mindmapUploadJson: any;
  minDate = new Date();
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<ModalsComponent>,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {}

  close(): void {
    this.dialogRef.close();
  }
  PreviewVideo: any = false;
  fileHandler(event) {
    this.file = event.target.files[0];
    this.saveUpload();
  }

  previewVideo() {
    this.data.videoURL = this.getSafeUrl(this.data.videoId);
    this.PreviewVideo = false;
    setTimeout(() => {
      this.PreviewVideo = true;
    }, 500);
  }

  getSafeUrl(videoId: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}`
    );
  }

  uploadMindmap() {
    const mindmapUpload = document.getElementById(
      "mindmapUpload"
    ) as HTMLInputElement;
    mindmapUpload.click();
  }

  saveUpload() {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.mindmapUploadJson = fileReader.result;
      this.data.mindmapJson = fileReader.result;
      this.data.filename = this.file.name;
    };
    fileReader.readAsText(this.file);
  }
}
