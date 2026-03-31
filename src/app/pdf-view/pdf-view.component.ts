import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

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
    const file = this.route.snapshot.paramMap.get('file');
    if (!file) {
      this.error = true;
      this.loading = false;
      return;
    }
    const pdfFileUrl = `${environment.mindmapURL.replace('/api', '')}/ncdinfo/${file}`;
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
