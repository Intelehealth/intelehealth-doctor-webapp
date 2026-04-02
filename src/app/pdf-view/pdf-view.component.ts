import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pdf-view',
  templateUrl: './pdf-view.component.html',
  styleUrls: ['./pdf-view.component.scss']
})
export class PdfViewComponent implements OnInit, OnDestroy {
  pdfSrc: string = null;
  iframeUrl: SafeResourceUrl = null;
  isMobile = false;
  loading = true;
  error = false;
  private blobObjectUrl: string = null;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const file = this.route.snapshot.paramMap.get('file');
    if (!file) {
      this.error = true;
      this.loading = false;
      return;
    }

    const pdfFileUrl = `${environment.mindmapURL.replace('/api', '')}/ncdinfo/${file}`;

    if (this.isMobile) {
      this.pdfSrc = pdfFileUrl;
    } else {
      this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfFileUrl);
      this.loading = false;
    }
  }

  onPdfLoaded(): void {
    this.loading = false;
  }

  onPdfError(): void {
    this.loading = false;
    this.error = true;
  }

  ngOnDestroy(): void {
    if (this.blobObjectUrl) {
      URL.revokeObjectURL(this.blobObjectUrl);
    }
  }
}
