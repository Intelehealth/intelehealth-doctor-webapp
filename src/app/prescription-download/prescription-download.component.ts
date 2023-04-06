import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, } from '@angular/router';
import * as html2pdf from 'html2pdf.js';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { LinkService } from 'src/app/services/link.service';
import { VisitService } from 'src/app/services/visit.service';
import { CoreService } from '../services/core/core.service';

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
  hash: any = null;
  accessToken: any = null;
  visit: any;
  prescriptionVerified: boolean = false;
  patient: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private linkSvc: LinkService,
    private toastr: ToastrService,
    private visitService: VisitService,
    private cs: CoreService
  ) { }

  ngOnInit(): void {
    this.hash = this.route.snapshot.paramMap.get("hash");
    this.getVisitFromHash();

    // const { accessToken, visitId } = window.history.state;
    // if (accessToken) {
    //   this.accessToken = accessToken;
    //   this.visitId = visitId;
    // }

    // if (!this.accessToken) {
    //   this.verifyMobileNumber();
    // } else {
    //   this.verifyToken();
    // }
  }

  getVisitFromHash() {
    this.linkSvc.getShortenedLink(this.hash).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.visitId = res.data.link.replace('/i/', '');
          this.fetchVisitPatient();
        } else {
          this.router.navigate(['/']);
        }
      },
      error: () => {
        this.router.navigate(['/']);
      }
    });
  }

  fetchVisitPatient(uuid: string = this.visitId) {
    this.visitService.fetchVisitPatient(uuid).subscribe({
      next: (visit: any) => {
        if (visit) {
          this.patient = visit.patient;
          this.cs.openConfirmOpenMrsIdModal(this.patient?.identifiers[0].identifier).subscribe(res => {
            if(res) {
              this.prescriptionVerified = true;
            }
          });
        }
      }
    });
  }

  // verifyMobileNumber() {
  //   this.linkSvc.getShortenedLink(this.hash).subscribe({
  //     next: (res: any) => {
  //       if (res.success) {
  //         this.visitId = res.data.link.replace('/i/', '');
  //         this.getVisit();
  //       } else {
  //         this.router.navigate(['/']);
  //       }
  //     },
  //     error: () => {
  //       this.router.navigate(['/']);
  //     }
  //   })
  // }

  // getVisit(uuid: string = this.visitId, skipOtpRequest = false) {
  //   this.visitService.fetchVisitDetails2(uuid).subscribe({
  //     next: (visit: any) => {
  //       if (visit) {
  //         this.visit = visit;
  //         if (!skipOtpRequest) {
  //           this.requestOtpForPrescroption();
  //         } else if (this.accessToken) {
  //           this.prescriptionVerified = true;
  //         }
  //       }
  //     }
  //   })
  // }


  // requestOtpForPrescroption() {
  //   const attrs = Array.isArray(this.visit?.patient?.attributes) ? this.visit?.patient?.attributes : []
  //   const patientPhoneNumber = attrs.find((attr: any) => attr?.attributeType?.display === 'Telephone Number');
  //   this.visit.patientPhoneNumber = patientPhoneNumber?.value;
  //   if (!this.visit.patientPhoneNumber) {
  //     this.toastr.warning('Mobile number is not updated, contact Health Worker!');
  //     this.router.navigate(['/']);
  //     return;
  //   }

  //   this.linkSvc.requestPresctionOtp(this.hash, this.visit.patientPhoneNumber).subscribe((res: any) => {
  //     if (res.success) {
  //       this.toastr.success(`OTP sent on ${this.authService.replaceWithStar(this.visit.patientPhoneNumber, 'phone')} successfully!`, "OTP Sent");
  //       this.router.navigate(['/session/verify-otp'], {
  //         state: {
  //           verificationFor: 'presctiption-verification',
  //           via: 'phone',
  //           val: this.visit.patientPhoneNumber,
  //           visitId: this.visitId
  //         },
  //         queryParams: {
  //           hash: this.hash
  //         }
  //       });
  //     } else {
  //       this.toastr.error(res.message, "Error");
  //     }
  //   });
  // }

  // verifyToken() {
  //   this.getVisit(this.visitId, true);
  // }

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