import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { LinkService } from 'src/app/services/link.service';
import { VisitService } from 'src/app/services/visit.service';
import { CoreService } from '../services/core/core.service';
import { Meta } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { doctorDetails } from 'src/config/constant';

@Component({
  selector: 'app-prescription-download',
  templateUrl: './prescription-download.component.html',
  styleUrls: ['./prescription-download.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PrescriptionDownloadComponent implements OnInit, OnDestroy {
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
  prescriptionVerified = false;
  patient: any;
  eventsSubject: Subject<any> = new Subject<any>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private linkSvc: LinkService,
    private toastr: ToastrService,
    private visitService: VisitService,
    private cs: CoreService,
    private meta: Meta
  ) { }

  ngOnInit(): void {
    this.hash = this.route.snapshot.paramMap.get('hash');

    const { accessToken, visitId } = window.history.state;
    if (accessToken) {
      this.accessToken = accessToken;
      this.visitId = visitId;
    }

    if (!this.accessToken) {
      this.getVisitFromHash();
    } else {
      this.prescriptionVerified = true;
      this.meta.updateTag({ name: 'viewport', content: 'width=1024' });
    }
  }

  emitEventToChild(val: boolean) {
    this.eventsSubject.next(val);
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
          const attrs = Array.isArray(this.patient?.attributes) ? this.patient?.attributes : [];
          const patientPhoneNumber = attrs.find((attr: any) => attr?.attributeType?.display === doctorDetails.TELEPHONE_NUMBER);
          if (patientPhoneNumber && patientPhoneNumber?.value.length > 3) {
            this.linkSvc.requestPresctionOtp(this.hash, patientPhoneNumber?.value).subscribe((res: any) => {
              if (res.success) {
                this.toastr.success(`OTP sent on ${this.authService.replaceWithStar(patientPhoneNumber?.value, 'phone')} successfully!`, 'OTP Sent');
                this.router.navigate(['/session/verify-otp'], {
                  state: {
                    verificationFor: 'presctiption-verification',
                    via: 'phone',
                    val: patientPhoneNumber?.value,
                    visitId: this.visitId
                  },
                  queryParams: {
                    hash: this.hash
                  }
                });
              } else {
                this.toastr.error(res.message, 'Error');
              }
            });
          } else {
            this.cs.openConfirmOpenMrsIdModal(this.patient?.identifiers[0].identifier).subscribe(res => {
              if (res) {
                this.prescriptionVerified = true;
                this.meta.updateTag({ name: 'viewport', content: 'width=1024' });
              }
            });
          }
        }
      }
    });
  }

  async download() {
    this.emitEventToChild(true);
  }

  ngOnDestroy(): void {
    this.meta.updateTag({ name: 'viewport', content: 'width=device-width, initial-scale=1' });
  }
}
