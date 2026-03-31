import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-view',
  templateUrl: './pdf-view.component.html',
  styleUrls: ['./pdf-view.component.scss']
})
export class PdfViewComponent implements OnInit, OnDestroy {
  pdfUrl: SafeResourceUrl = null;
  loading = true;
  error = false;
  private blobObjectUrl: string = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Read url param directly from window.location to avoid browser encoding (%2F etc.)
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const pdfFileUrl = urlParams.get('url');
    if (!pdfFileUrl) {
      this.error = true;
      this.loading = false;
      return;
    }
    this.fetchAndDisplay(pdfFileUrl);
  }

  private fetchAndDisplay(url: string): void {
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        this.blobObjectUrl = URL.createObjectURL(pdfBlob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.blobObjectUrl);
        this.loading = false;
      },
      error: () => {
        // Fallback: try rendering the URL directly in the iframe.
        // This may still download on some Samsung devices if CORS blocks the blob fetch,
        // but gives the best possible experience without a backend proxy.
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.blobObjectUrl) {
      URL.revokeObjectURL(this.blobObjectUrl);
    }
  }
}
