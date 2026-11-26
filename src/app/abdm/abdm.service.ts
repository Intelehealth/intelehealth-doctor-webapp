import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AppConfigService } from '../services/app-config.service';
import { VisitService } from '../services/visit.service';
import { PatientModel, VisitAttributeModel } from '../model/model';
import {
  ABDM_API,
  ABDM_VISIT_ATTRIBUTE_TYPES,
  ABHA_IDENTIFIER_TYPES,
  DEFAULT_ABHA_ADDRESS_SUFFIX,
} from './abdm.constants';
import { AbdmCareContextData, AbdmLinkVisitParams } from './abdm.models';
import { VisitCareContextComponent } from './visit-care-context/visit-care-context.component';

/**
 * Single entry point for ABDM M2 (care-context linking / HI types) in the doctor webapp.
 *
 * Usage from a page:
 *  1. resolveAbhaDetails(patient, visit.attributes)   - after the patient is loaded
 *  2. selectHiTypes(careContextData)                  - before the share-prescription confirm
 *  3. linkVisitToABDM({ visit, patient, encounterUuid, hiTypes }) - after the visit-complete encounter
 */
@Injectable({
  providedIn: 'root'
})
export class AbdmService {
  private readonly baseURLAbha: string = environment.abhaURL;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private appConfigService: AppConfigService,
    private visitService: VisitService
  ) { }

  /**
   * Master switch for every ABDM feature: driven only by the admin config "ABHA section" (abha_section).
   * resolveAbhaDetails(), selectHiTypes() and linkVisitToABDM() all no-op when this is false.
   */
  get isEnabled(): boolean {
    return !!this.appConfigService.abha_section;
  }

  // ---------------------------------------------------------------------------
  // ABHA details
  // ---------------------------------------------------------------------------

  /**
   * Populate patient.person.abhaNumber / abhaAddress from patient identifiers
   * (the visit's ABHA_ADDRESS_ASSOCIATED attribute takes priority for the address).
   * @param {PatientModel} patient - Patient to update (mutated in place)
   * @param {VisitAttributeModel[]} visitAttributes - Attributes of the current visit
   */
  resolveAbhaDetails(patient: PatientModel, visitAttributes: VisitAttributeModel[] = []): void {
    if (!this.isEnabled || !patient?.person) return;

    const identifier = (type: string) => patient.identifiers
      ?.find((v) => v.identifierType?.display?.toLowerCase() === type)?.identifier;
    const visitAbhaAddress = visitAttributes
      ?.find((attr) => attr.attributeType?.display === ABDM_VISIT_ATTRIBUTE_TYPES.ABHA_ADDRESS_ASSOCIATED)?.value;

    const abhaNumber = identifier(ABHA_IDENTIFIER_TYPES.ABHA_NUMBER);
    patient.person.abhaNumber = abhaNumber;
    // Address must really exist (visit attribute or patient identifier) - it is not derived from the number.
    patient.person.abhaAddress = this.normalizeAbhaAddress(
      visitAbhaAddress || identifier(ABHA_IDENTIFIER_TYPES.ABHA_ADDRESS)
    );
  }

  /**
   * Whether the patient can be linked to ABDM: abha_section enabled AND patient has
   * both an ABHA number and an ABHA address. Gates the HI-type popup and the linking.
   * @param {PatientModel} patient - Patient
   */
  canLinkPatient(patient: PatientModel): boolean {
    const { abhaNumber, abhaAddress } = this.getLinkIdentifiers(patient);
    return this.isEnabled && !!abhaNumber && !!abhaAddress;
  }

  // ---------------------------------------------------------------------------
  // HI type selection popup
  // ---------------------------------------------------------------------------

  /**
   * Open the care-context popup so the doctor can pick which HI types to push to ABDM.
   * Emits:
   *  - selected HI types, when the doctor clicks "Send Data"
   *  - [] when ABDM is not applicable (disabled / patient cannot be linked / skipped) - share continues
   *  - null when the doctor closes the popup - caller should abort sharing
   * @param {AbdmCareContextData} data - Visit data to preview in the popup
   * @param {boolean} skip - Pass true to bypass the popup (e.g. visit already completed)
   */
  selectHiTypes(data: AbdmCareContextData, skip = false): Observable<string[] | null> {
    if (skip || !this.canLinkPatient(data?.patient)) {
      return of([]);
    }
    return this.dialog.open(VisitCareContextComponent, {
      panelClass: 'modal-lg',
      data,
      hasBackdrop: true,
      disableClose: true
    }).afterClosed().pipe(
      map((res: { selectedTabs?: string[] } | undefined) => res?.selectedTabs ?? null)
    );
  }

  // ---------------------------------------------------------------------------
  // Linking
  // ---------------------------------------------------------------------------

  /**
   * Mark the visit as not-yet-linked (isABDMLinked = false) and post the care context with the
   * selected HI types to the ABHA backend. Fire-and-forget; errors are only logged.
   * @param {AbdmLinkVisitParams} params - Visit, patient, visit-complete encounter uuid and HI types
   */
  linkVisitToABDM(params: AbdmLinkVisitParams): void {
    const { visit, patient, encounterUuid, hiTypes } = params;
    if (!visit?.uuid || !this.canLinkPatient(patient)) return;

    const { abhaNumber, abhaAddress, mobileNumber } = this.getLinkIdentifiers(patient);
    this.visitService.postAttribute(visit.uuid, {
      attributeType: ABDM_VISIT_ATTRIBUTE_TYPES.IS_ABDM_LINKED,
      value: false,
    }).pipe(
      switchMap(() => this.postCareContext({
        openMRSID: this.getIdentifier(patient, 'OpenMRS ID'),
        mobileNumber,
        visitUUID: visit.uuid,
        name: patient?.person?.display,
        gender: patient?.person?.gender,
        abhaNumber,
        abhaAddress,
        yearOfBirth: patient?.person?.birthdate ? Number(patient.person.birthdate.substring(0, 4)) : null,
        startDateTime: visit.startDatetime,
        encounterUUID: encounterUuid,
        personDisplay: patient?.person?.display,
        hiTypes: hiTypes ?? []
      }))
    ).subscribe({
      error: (err) => console.error('ABDM: failed to link visit care context', err)
    });
  }

  // ---------------------------------------------------------------------------
  // ABHA backend API
  // ---------------------------------------------------------------------------

  /**
   * Post visit care context to ABDM
   * @param {any} payload - Care context payload
   */
  postCareContext(payload: any): Observable<any> {
    return this.http.post(`${this.baseURLAbha}${ABDM_API.POST_CARE_CONTEXT}`, payload);
  }

  /**
   * Get care contexts linked for a visit
   * @param {string} visitUuid - Visit uuid
   */
  getVisitCareContext(visitUuid: string): Observable<any> {
    return this.http.post(`${this.baseURLAbha}${ABDM_API.VISIT_CARE_CONTEXT}`, { visitUUID: visitUuid });
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private getLinkIdentifiers(patient: PatientModel) {
    const mobile = patient?.person?.attributes
      ?.find((attr) => attr.attributeType?.display === 'Telephone Number')?.value;
    return {
      abhaNumber: patient?.person?.abhaNumber?.replace(/-/g, '') || undefined,
      abhaAddress: patient?.person?.abhaAddress || undefined,
      mobileNumber: mobile && mobile !== 'NA' ? mobile : undefined,
    };
  }

  private getIdentifier(patient: PatientModel, type: string): string {
    return patient?.identifiers?.find((idf) => idf.identifierType?.display === type)?.identifier ?? '';
  }

  private normalizeAbhaAddress(address: string): string {
    if (!address) return undefined;
    const suffix: string = (environment as any).abhaAddressSuffix || DEFAULT_ABHA_ADDRESS_SUFFIX;
    return address.includes('@') ? address : `${address}${suffix}`;
  }
}
