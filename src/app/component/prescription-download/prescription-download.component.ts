import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-prescription-download',
  templateUrl: './prescription-download.component.html',
  styleUrls: ['./prescription-download.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PrescriptionDownloadComponent implements OnInit {
  @ViewChild('prescription') prescription: ElementRef;
  opt = {
    margin: 1,
    filename: 'eprescription.pdf',
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
  };
  visitId: any = null;

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.visitId = this.route.snapshot.paramMap.get("visitId");
  }

  download() {
    this.opt.filename = `e-prescription-${Date.now()}.pdf`;
    html2pdf(this.prescription.nativeElement, this.opt).toPdf().get('pdf')
      .then(function (pdf) {
        pdf.deletePage(1);
        var totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.setTextColor(150);
          pdf.text(`Page ${i}/${totalPages}`, pdf.internal.pageSize.getWidth() - 100, pdf.internal.pageSize.getHeight() - 10);
        }
      }).save();
  }
}
