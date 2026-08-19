import { Component, Inject, Input, OnDestroy, OnInit ,NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AppConfigService } from '../lib/services/app-config.service';
import { VisitService } from '../lib/services/visit.service';
import { DiagnosisService } from '../lib/services/diagnosis.service';
import { ProfileService } from '../lib/services/profile.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DiagnosisModel, EncounterModel, EncounterProviderModel, FollowUpDataModel, MedicineModel, ObsApiResponseModel, ObsModel, PatientHistoryModel, PatientIdentifierModel, PatientModel, PatientRegistrationFieldsModel, PatientVisitSection, PersonAttributeModel, ProviderAttributeModel, ReferralModel, TestModel, VisitAttributeModel, VisitModel, VitalModel, StandardMedicineModel } from './model/model';
import { checkIsEnabled, VISIT_SECTIONS } from './utils/visit-sections';
import { TranslateService,TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { calculateBMI, getAge, convertCelsiusToFahrenheit, getFieldValueByLanguage,obsParse } from './utils/utility-functions';
import { conceptIds, doctorDetails, visitTypes } from './config/constant';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { precription } from "./utils/base64"
import { Observable } from 'rxjs';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
import { EnvConfigService } from './services/env.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { DefaultImageDirective } from './directives/default-image.directive';


@Component({
  selector: 'lib-presciption',
  standalone: true,
  imports: [  
    CommonModule,
    MatIconModule,
    MatButtonModule, 
    TranslateModule,
    MatTabsModule ,
    MatTableModule ,
    DefaultImageDirective,
    MatDialogModule
   ],
  templateUrl: './lib-prescription.component.html',
  styleUrls: ['./lib-prescription.component.scss'],
  providers: [AppConfigService],
  schemas: [NO_ERRORS_SCHEMA]
})
export class LibPresciptionComponent implements OnInit,OnDestroy {

  @Input() isDownloadPrescription: boolean = false;
  @Input() visitId: string;
  @Input() download: Observable<any>;
  envProduction: boolean;
  configPublicURL: string 
  baseUrl: string 
  logoImageURL: string;
  hwPhoneNo: string;
  visit: VisitModel;
  patient: PatientModel;
  pvsConfigs: PatientVisitSection[] = [];
  pvsConstant = VISIT_SECTIONS;
  patientRegFields: string[] = [];
  completedEncounter: EncounterModel = null;
  visitNotePresent: EncounterModel;
  spokenWithPatient: string = 'No';
  notes: ObsModel[] = [];
  medicines: MedicineModel[] = [];
  standardMedicines: StandardMedicineModel[] = [];
  existingDiagnosis: DiagnosisModel[] = [];
  advices: ObsModel[] = [];
  additionalInstructions: ObsModel[] = [];
  tests: TestModel[] = [];
  referrals: ReferralModel[] = [];
  followUp: FollowUpDataModel;
  consultedDoctor: any;
  followUpInstructions: ObsModel[] = [];
  dignosisSecondary: any = {};
  referralSecondary: string = "";

  conceptDiagnosis = '537bb20d-d09d-4f88-930b-cc45c7d662df';
  conceptNote = '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  conceptMed = 'c38c0c50-2fd2-4ae3-b7ba-7dd25adca4ca';
  conceptAdvice = '67a050c1-35e5-451c-a4ab-fff9d57b0db1';
  conceptTest = '23601d71-50e6-483f-968d-aeef3031346d';
  conceptReferral = '605b6f15-8f7a-4c45-b06d-14165f6974be';
  conceptFollow = 'e8caffd6-5d22-41c4-8d6a-bc31a44d0c86';
  conceptFollowUpInstruction = conceptIds.conceptFollowUpInstruction;
  conceptDiscussionSummary = 'b673cd54-a01d-4d8a-9c07-8fb19bf4982c';

  signaturePicUrl: string = null;
  signatureFile = null;
  cheifComplaints: string[] = [];
  vitalObs: ObsModel[] = [];
  
  vitals: VitalModel[] = [];
  hasVitalsEnabled: boolean = false;
  hasPatientOtherEnabled: boolean = false;
  hasPatientAddressEnabled: boolean = false;
  visitStatus: string;
  clinicName: string;
  providerName: string;

  eventsSubscription: any;
  prodBoolean: boolean
  discussionSummary: string = "";
  checkUpReasonData: any = [];

  recommendation: { uuid: string; value: any; };
  brandName: boolean = false;
 
  constructor(
     @Inject(MAT_DIALOG_DATA) public data:any,
      private dialogRef: MatDialogRef<LibPresciptionComponent>,
      public appConfigService: AppConfigService,
      private translateService: TranslateService,
      private visitService: VisitService,
      private diagnosisService: DiagnosisService,
      private profileService: ProfileService,
      private envService: EnvConfigService
    ) {
      this.baseUrl = this.envService.getConfig('baseURL');
      this.configPublicURL = this.envService.getConfig('configPublicURL');
      this.envProduction = this.envService.getConfig('production');
      this.brandName = this.envService.getConfig('brandName') === "KCDO";
    }

ngOnInit(): void {

  this.appConfigService.load().then(() => {
  
    if (!this.appConfigService.patient_registration) {
      console.warn("AppConfigService is still undefined.");
      return;
    }

    this.vitals = [...(this.appConfigService.patient_vitals || [])];
    this.hasVitalsEnabled = this.appConfigService.patient_vitals_section || false;
    this.hasPatientAddressEnabled = this.appConfigService?.patient_reg_address || false;
    this.hasPatientOtherEnabled = this.appConfigService?.patient_reg_other || false;

    Object.keys(this.appConfigService.patient_registration).forEach(obj => {
      this.patientRegFields.push(
        ...this.appConfigService.patient_registration[obj]
          .filter((e: { is_enabled: any }) => e.is_enabled)
          .map((e: { name: any }) => e.name)
      );
    });
     this.logoImageURL = this.appConfigService.theme_config.find(obj=>obj.key==='logo')?.value;

     this.pvsConfigs = this.appConfigService.patient_visit_sections?.filter((pvs: { key: string; }) => [
      this.pvsConstant['vitals'].key,
      this.pvsConstant['consultation_details'].key,
      this.pvsConstant['check_up_reason'].key
    ].includes(pvs.key));

  }).catch(error => {
    console.error("Failed to load AppConfigService:", error);
  });

  this.getVisit(this.isDownloadPrescription ? this.visitId : this.data.uuid);

  const basePath = `${window.location.origin}${window.location.pathname.includes('intelehealth') ? '/intelehealth' : ''}`;

    pdfMake.fonts = {
      DmSans: {
        normal: `${basePath}/assets/fonts/DM_Sans/DMSans-Regular.ttf`,
        bold: `${basePath}/assets/fonts/DM_Sans/DMSans-Bold.ttf`,
        italics: `${basePath}/assets/fonts/DM_Sans/DMSans-Italic.ttf`,
        bolditalics: `${basePath}/assets/fonts/DM_Sans/DMSans-BoldItalic.ttf`
      }
    };
    this.eventsSubscription = this.download?.subscribe((val) => { if (val) { this.downloadPrescription(); } });
  }

  
    /**
    * Get visit
    * @param {string} uuid - Visit uuid
    * @returns {void}
    */
    getVisit(uuid: string) {
      this.visitService.fetchVisitDetails(this.baseUrl,uuid).subscribe((visit: VisitModel) => {
        if (visit) {
          this.visit = visit;
          this.checkVisitStatus(visit.encounters);
          this.visitService.patientInfo(this.baseUrl,visit.patient.uuid).subscribe((patient: PatientModel) => {
            if (patient) {
              this.patient = patient;
              this.clinicName = visit.location.display;
              this.getAbhaDetails(patient);
              this.getVisitProvider(visit.encounters);
              // check if visit note exists for this visit
              this.visitNotePresent = this.checkIfEncounterExists(visit.encounters, visitTypes.VISIT_NOTE);
              if (this.visitNotePresent) {
                this.checkIfPatientInteractionPresent(visit.attributes);
                this.checkIfDiagnosisPresent();
                this.checkIfNotePresent();
                this.checkIfMedicationPresent();
                this.checkIfAdditionalInstructionPresent();
                this.checkIfAdvicePresent();
                this.checkIfTestPresent();
                this.checkIfReferralPresent();
                this.checkIfFollowUpPresent();
                this.checkIfFollowUpInstructionsPresent();
                this.checkIfDiscussionSummaryPresent();
                this.checkIfRecommendationPresent();
              }
              this.getCheckUpReason(visit.encounters);
              this.getVitalObs(visit.encounters);
  
              visit.encounters.forEach((encounter: EncounterModel) => {
                if (encounter.encounterType.display === visitTypes.VISIT_COMPLETE) {
                  this.completedEncounter = encounter;
                  encounter.obs.forEach((o: ObsModel) => {
                    if (o.concept.display === 'Doctor details') {
                      this.consultedDoctor = JSON.parse(o.value);
                    }
                  });
                  encounter.encounterProviders.forEach((p: EncounterProviderModel) => {
                    this.consultedDoctor.gender = p.provider.person.gender;
                    this.consultedDoctor.person_uuid = p.provider.person.uuid;
                    this.consultedDoctor.attributes = p.provider.attributes;
                    if (this.isDownloadPrescription) {
                      this.setSignature(this.signature?.value, this.signatureType?.value);
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  /**
   * Get chief complaints and patient visit reason/summary
   * @param {EncounterModel[]} encounters - Array of encounters
   * @return {void}
   */
   getCheckUpReason(encounters: EncounterModel[]) {
      this.cheifComplaints = [];
      this.checkUpReasonData = [];
      encounters.forEach((enc: EncounterModel) => {
        if (enc.encounterType.display === visitTypes.ADULTINITIAL) {
          enc.obs.forEach((obs: ObsModel) => {
            if (obs.concept.display === visitTypes.CURRENT_COMPLAINT) {
              const currentComplaint = this.visitService.getData(obs)?.value.split('<b>');
              for (let i = 0; i < currentComplaint.length; i++) {
                if (currentComplaint[i] && currentComplaint[i].length > 1) {
                  const obs1 = currentComplaint[i].split('<');
                  if (!obs1[0].match(visitTypes.ASSOCIATED_SYMPTOMS)) {
                    this.cheifComplaints.push(obs1[0]);
                  }
                  const splitByBr = currentComplaint[i].split('<br/>');
                  if (splitByBr[0].includes(visitTypes.ASSOCIATED_SYMPTOMS)) {
                    const obj1: PatientHistoryModel = {};
                    obj1.title = this.translateService.instant(visitTypes.ASSOCIATED_SYMPTOMS);
                    obj1.data = [];
                    for (let j = 1; j < splitByBr.length; j = j + 2) {
                      if (splitByBr[j].trim() && splitByBr[j].trim().length > 1) {
                        obj1.data.push({ key: splitByBr[j].replace('• ', '').replace(' -', ''), value: splitByBr[j + 1] });
                      }
                    }
                    this.checkUpReasonData.push(obj1);
                  } else {
                    const obj1: PatientHistoryModel = {};
                    obj1.title = splitByBr[0].replace('</b>:', '');
                    obj1.data = [];
                    for (let k = 1; k < splitByBr.length; k++) {
                      if (splitByBr[k].trim() && splitByBr[k].trim().length > 1) {
                        const splitByDash = splitByBr[k].split('-');
                        const processedStrings = splitByDash?.slice(1, splitByDash.length).join('-').split(".").map(itemList => {
                          let splitByHyphen = itemList.split(" - ");
                          let value = splitByHyphen.pop() || "";
                          splitByHyphen.push(value);
                          return splitByHyphen.join(" - ");
                        });
                        const resultString = processedStrings.join(". ");
                        obj1.data.push({ key: splitByDash[0].replace('• ', ''), value: resultString });
                      }
                    }
                    this.checkUpReasonData.push(obj1);
                  }
                }
              }
            }
          });
        }
      });
   }
 
   /**
   * Get vital observations from the vital encounter
   * @param {EncounterModel[]} encounters - Array of encounters
   * @return {void}
   */
   getVitalObs(encounters: EncounterModel[]) {
     encounters.forEach((enc: EncounterModel) => {
       if (enc.encounterType.display === visitTypes.VITALS) {
         this.vitalObs = enc.obs;
       }
     });
   }
 
   /**
   * Check if patient interaction visit attrubute present or not
   * @param {VisitAttributeModel[]} attributes - Array of visit attributes
   * @returns {void}
   */
   checkIfPatientInteractionPresent(attributes: VisitAttributeModel[]) {
     attributes.forEach((attr: VisitAttributeModel) => {
       if (attr.attributeType.display === visitTypes.PATIENT_INTERACTION) {
         this.spokenWithPatient = attr.value;
       }
     });
   }
 
   /**
   * Get diagnosis for the visit
   * @returns {void}
   */
   checkIfDiagnosisPresent() {
    this.existingDiagnosis = [];
    this.diagnosisService.getObs(this.baseUrl, this.visit.patient.uuid, conceptIds.conceptDiagnosis).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          if (this.isFeatureAvailable('dp_diagnosis_secondary')) {
            this.dignosisSecondary = obsParse(obs.value)
          } else if (obs.value.includes("}")) {
            let obsData: any = obsParse(obs.value, obs.uuid)
            this.existingDiagnosis.push({
              diagnosisName: obsData.diagnosis,
              diagnosisStatus: obsData.type,
              uuid: obsData.uuid,
            });
          } else {
            let obsValues = obs.value.split(':');
            if (obs.value.includes("::")) {
              obsValues = obs.value.split("::").pop()?.split(":");
            }
            const obsValuesOne = obsValues?.[1]?.split('&');
            this.existingDiagnosis.push({
              diagnosisName: obsValues?.[0]?.trim() ?? '',
              diagnosisType: obsValuesOne?.[0]?.trim() ?? '',
              diagnosisStatus: obsValuesOne?.[1]?.trim() ?? '',
              uuid: obs.uuid,
            });
          }
        }
      });
    });
  }
   /**
   * Get notes for the visit
   * @returns {void}
   */
   checkIfNotePresent() {
     this.notes = [];
     this.diagnosisService.getObs(this.baseUrl,this.visit.patient.uuid, this.conceptNote).subscribe((response: ObsApiResponseModel) => {
       response.results.forEach((obs: ObsModel) => {
         if (obs.encounter.visit.uuid === this.visit.uuid) {
           this.notes.push(obs);
         }
       });
     });
   }
 
    /**
  * Get discussion summary present
  * @returns {void}
  */
  checkIfDiscussionSummaryPresent() {
    this.diagnosisService.getObs(this.baseUrl, this.visit.patient.uuid, conceptIds.conceptDiscussionSummary).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          this.discussionSummary = obs.value
        }
      });
    });
  }

   /**
   * Get medicines for the visit
   * @returns {void}
   */
   checkIfMedicationPresent() {
    this.medicines = [];
    this.standardMedicines = [];
    this.diagnosisService.getObs(this.baseUrl,this.visit.patient.uuid, conceptIds.conceptMed).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          if (obs.value.includes(':')) {
            if(this.appConfigService.patient_visit_summary?.standard_medication){
              this.standardMedicines.push(this.visitService.formatMedicineDisplay(obs.value, obs.uuid));
            } else {
              this.medicines.push({
                drug: obs.value?.split(':')[0],
                strength: obs.value?.split(':')[1],
                days: obs.value?.split(':')[2],
                timing: obs.value?.split(':')[3],
                remark: obs.value?.split(':')[4],
                frequency: obs.value?.split(':')[5] ? obs.value?.split(':')[5] : "",
                uuid: obs.uuid
              });
            }
          }
        }
      });
    });
   }
 
   /**
   * Get additional instructions for the visit
   * @returns {void}
   */
   checkIfAdditionalInstructionPresent() {
     this.additionalInstructions = [];
     this.diagnosisService.getObs(this.baseUrl,this.visit.patient.uuid, this.conceptMed)
       .subscribe((response: ObsApiResponseModel) => {
         response.results.forEach((obs: ObsModel) => {
           const obsValue = typeof obs.value === 'string' ? obs.value : (obs.value?.display || String(obs.value || ''));
           if (obs.encounter && obs.encounter.visit && obs.encounter.visit.uuid === this.visit.uuid) {
             if (!obsValue.includes('</a>')) {
               if (!obsValue.includes(':')) {
                 this.additionalInstructions.push(obs);
               } 
             } else {
               console.log('Skipping - contains HTML link:', obsValue);
             }
           }
         });
       });
   }
 
   /**
   * Get advices for the visit
   * @returns {void}
   */
   checkIfAdvicePresent() {
     this.advices = [];
     this.diagnosisService.getObs(this.baseUrl,this.visit.patient.uuid, this.conceptAdvice)
       .subscribe((response: ObsApiResponseModel) => {
         response.results.forEach((obs: ObsModel) => {
           if (obs.encounter && obs.encounter.visit.uuid === this.visit.uuid) {
             if (!obs.value.includes('</a>')) {
               // Exclude additional instructions from advices list
              //  const isAdditionalInstruction = (!obs.value.includes(':') || obs.value.split(':').length < 3) && obs.value.length > 20;
              //  if (!isAdditionalInstruction) {
                 this.advices.push(obs);
               //}
             }
           }
         });
       });
   }
 
   /**
   * Get tests for the visit
   * @returns {void}
   */
   checkIfTestPresent() {
     this.tests = [];
     this.diagnosisService.getObs(this.baseUrl,this.visit.patient.uuid, this.conceptTest)
       .subscribe((response: ObsApiResponseModel) => {
         response.results.forEach((obs: ObsModel) => {
           if (obs.encounter && obs.encounter.visit.uuid === this.visit.uuid) {
             this.tests.push(obs);
           }
         });
       });
   }
 
   /**
   * Get referrals for the visit
   * @returns {void}
   */
   checkIfReferralPresent() {
     this.referrals = [];
    this.diagnosisService.getObs(this.baseUrl, this.visit.patient.uuid, conceptIds.conceptReferral)
      .subscribe((response: ObsApiResponseModel) => {
        response.results.forEach((obs: ObsModel) => {
          if (obs.encounter && obs.encounter.visit.uuid === this.visit.uuid) {
            if(obs.value.includes(":")) {
              const obs_values = obs.value.split(':');
              this.referrals.push({ uuid: obs.uuid, speciality: obs_values[0].trim(), facility: obs_values[1].trim(), priority: obs_values[2].trim(), reason: obs_values[3].trim()? obs_values[3].trim():'-' });
            }
          }
        });
      });
   }

   /**
  * Get Recommendation for the visit
  * @returns {void}
  */
  checkIfRecommendationPresent(): void {
    this.diagnosisService.getObs(this.baseUrl,this.visit.patient.uuid, conceptIds.conceptRecommendation)
    .subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if(obs.encounter && obs.encounter.visit.uuid === this.visit.uuid){
          this.recommendation = {uuid: obs.uuid, value: obs.value}
        }
      });
    });
  }
 
   /**
   * Get followup for the visit
   * @returns {void}
   */
   checkIfFollowUpPresent() {
     this.diagnosisService.getObs(this.baseUrl,this.visit.patient.uuid, this.conceptFollow).subscribe((response: ObsApiResponseModel) => {
       response.results.forEach((obs: ObsModel) => {
         if (obs.encounter.visit.uuid === this.visit.uuid) {
           let followUpDate: string, followUpTime: any, followUpReason: any, wantFollowUp: string = 'No', followUpType: string;
           if (obs.value.includes('Time:') || obs.value.includes('Remark:')) {
             const result = obs.value.split(',').filter(Boolean);
             const time = result.find((v: string) => v.includes('Time:'))?.split('Time:')?.[1]?.trim();
             const remark = result.find((v: string) => v.includes('Remark:'))?.split('Remark:')?.[1]?.trim();
             const type = result.find((v: string) => v.includes('Type:'))?.split('Type:')?.[1]?.trim();
             followUpDate = moment(result[0]).format('YYYY-MM-DD');
             followUpTime = time ? time : null;
             followUpReason = remark ? remark : null;
             followUpType = type && type !== 'null' ? type : null;
             wantFollowUp = 'Yes';
           }
           this.followUp = {
             present: true,
             wantFollowUp,
             followUpDate,
             followUpTime,
             followUpReason,
             followUpType
           };
         }
       });
     });
   }
 
   /**
   * Get patient identifier for a given identifier type
   * @param {string} identifierType - Identifier type
   * @returns {string} - Patient identifier for a given identifier type
   */
   getPatientIdentifier(identifierType: string): string {
     let identifier: string = '';
     if (this.patient) {
       this.patient.identifiers.forEach((idf: PatientIdentifierModel) => {
         if (idf.identifierType.display == identifierType) {
           identifier = idf.identifier;
         }
       });
     }
     return identifier;
   }

   /**
    * Get Abha number / Abha address from patient identifiers
    * @param {PatientModel} _patient - Patient
    * @returns {void}
    */
   getAbhaDetails(_patient: PatientModel): void {
     this.patient.person.abhaNumber = _patient.identifiers.find((v) => v.identifierType?.display?.toLowerCase() === 'abha number')?.identifier;
     this.patient.person.abhaAddress = _patient.identifiers.find((v) => v.identifierType?.display?.toLowerCase() === 'abha address')?.identifier;
   }

   /**
   * Check visit status
   * @param {EncounterModel[]} encounters - Array of encounters
   * @return {void}
   */
   checkVisitStatus(encounters: EncounterModel[]) {
     if (this.checkIfEncounterExists(encounters, visitTypes.PATIENT_EXIT_SURVEY)) {
       this.visitStatus = visitTypes.ENDED_VISIT;
     } else if (this.checkIfEncounterExists(encounters, visitTypes.VISIT_COMPLETE)) {
       this.visitStatus = visitTypes.COMPLETED_VISIT;
     } else if (this.checkIfEncounterExists(encounters, visitTypes.VISIT_NOTE)) {
       this.visitStatus = visitTypes.IN_PROGRESS_VISIT;
     } else if (this.checkIfEncounterExists(encounters, visitTypes.FLAGGED)) {
       this.visitStatus = visitTypes.PRIORITY_VISIT;
     } else if (this.checkIfEncounterExists(encounters, visitTypes.ADULTINITIAL) || this.checkIfEncounterExists(encounters, visitTypes.VITALS)) {
       this.visitStatus = visitTypes.AWAITING_VISIT;
     }
   }
 
   /**
   * Get encounter for a given encounter type
   * @param {EncounterModel[]} encounters - Array of encounters
   * @param {string} encounterType - Encounter type
   * @return {EncounterModel} - Encounter for a given encounter type
   */
   checkIfEncounterExists(encounters: EncounterModel[], encounterType: string) {
     return encounters.find(({ display = '' }) => display.includes(encounterType));
   }
 
   /**
   * Get age of patient from birthdate
   * @param {string} birthdate - Birthdate
   * @return {string} - Age
   */
  getAge(birthdate: string, short = false): string {
    return getAge(birthdate, this.translateService, short);
  }
 
   /**
   * Get person attribute value for a given attribute type
   * @param {str'} attrType - Person attribute type
   * @return {any} - Value for a given attribute type
   */
   getPersonAttributeValue(attrType: string) {
     let val = this.translateService.instant('NA');
     if (this.patient) {
       this.patient.person.attributes.forEach((attr: PersonAttributeModel) => {
         if (attrType === attr.attributeType.display) {
           val = attr.value;
         }
       });
     }
     return val;
   }
 
   /**
   * Replcae the string charaters with *
   * @param {string} str - Original string
   * @return {string} - Modified string
   */
   replaceWithStar(str: string) {
     const n = str.length;
     return str.replace(str.substring(0, n - 4), '******');
   }
 
   /**
   * Get visit provider details
   * @param {EncounterModel[]} encounters - Array of visit encounters
   * @return {void}
   */
   getVisitProvider(encounters: EncounterModel[]) {
     encounters.forEach((encounter: EncounterModel) => {
       if (encounter.display.match(visitTypes.ADULTINITIAL) !== null) {
         this.providerName = encounter.encounterProviders[0].display;
         encounter.encounterProviders[0].provider.attributes.forEach(
           (attribute) => {
             if (attribute.display.match(doctorDetails.PHONE_NUMBER) != null) {
               this.hwPhoneNo = attribute.value;
             }
           }
         );
       }
     });
   }
 
   /**
   * Close modal
   * @param {boolean} val - Dialog result
   * @return {void}
   */
   close(val: boolean) {
     this.dialogRef.close(val);
   }
 
   /**
   * Getter for is prescription modal
   * @return {boolean} - True if prescription modal else false
   */
   get isPrescriptionModal() {
     return location.hash.includes('#/i/');
   }
 
   /**
   * Getter for doctor provider attributes
   * @return {ProviderAttributeModel[]} - Doctor provider attributes
   */
   get attributes() {
     return Array.isArray(this.consultedDoctor?.attributes) ? this.consultedDoctor.attributes : [];
   }
 
   /**
   * Getter for signature type
   * @return {any} - Signature type
   */
   get signatureType(): any {
     return this.attributes.find((a: { attributeType: { display: string; }; }) => a?.attributeType?.display === doctorDetails.SIGNATURE_TYPE);
   }
 
   /**
   * Getter for signature
   * @return {any} - Signature
   */
   get signature(): any {
     return this.attributes.find((a: { attributeType: { display: string; }; }) => a?.attributeType?.display === doctorDetails.SIGNATURE);
   }
 
   /**
   * Detect MIME type from the base 64 url
   * @param {string} b64 - Base64 url
   * @return {string} - MIME type
   */
   detectMimeType(b64: string): string {
     return this.profileService.detectMimeType(b64);
   }
 
   /**
   * Set signature
   * @param {string} signature - Signature
   * @param {string} signatureType - Signature type
   * @return {void}
   */
   setSignature(signature: RequestInfo, signatureType: any): void {
     switch (signatureType) {
       case 'Draw':
       case 'Generate':
       case 'Upload':
         this.signaturePicUrl = signature as string;
         fetch(signature)
           .then(res => res.blob())
           .then(blob => {
             this.signatureFile = new File([blob], 'intelehealth', { type: this.detectMimeType(this.signaturePicUrl.split(',')[0]) });
           });
         break;
       default:
         break;
     }
   }
 
   /**
   * Get rows for make pdf doc defination for a given type
   * @param {string} type - row type
   * @return {any} - Rows
   */
  getRecords(type: string) {
    const records = [];
    
    switch (type) {
      case 'diagnosis':
        if(this.isFeatureAvailable('dp_diagnosis_secondary')){
          const diagnosisRow = [
            this.dignosisSecondary['diagnosis'] || "",
            this.dignosisSecondary['type'] || "",
            this.dignosisSecondary['tnm'] || "",
            this.dignosisSecondary['otherStaging'] || ""
          ];
          records.push(diagnosisRow);
        } else if (this.existingDiagnosis.length) {
          this.existingDiagnosis.forEach((d) => {
            const row = [d.diagnosisName ?? '', d.diagnosisType ?? '', d.diagnosisStatus ?? ''];
            records.push(row);
          });
        } else {
          records.push([{ text: 'No diagnosis added', colSpan: 3, alignment: 'center' }]);
        }
        break;
      case 'medication':
        if (this.medicines.length) {
          this.medicines.forEach((m) => {
            const row = [m.drug, m.strength, m.days, m.timing, m.frequency, m.remark];
            records.push(row);
          });
        } else {
          records.push([{ text: 'No medicines added', colSpan: 6, alignment: 'center' }]);
        }
        break;
      case 'standardMedication':
        if (this.standardMedicines.length) {
          this.standardMedicines.forEach((m) => {
            const row = [m.drug, m.dose, m.frequency, m.durationNo, m.durationUnit, m.instructRemark];
            records.push(row);
          });
        } else {
          records.push([{ text: 'No medicines added', colSpan: 6, alignment: 'center' }]);
        }
        break;
      case 'additionalInstruction':
        if (this.additionalInstructions.length) {
          this.additionalInstructions.forEach((ai) => {
            records.push({ text: ai.value, margin: [0, 5, 0, 5] });
          });
        } else {
          records.push([{ text: 'No additional instructions added'}]);
        }
        break;
      case 'advice':
        if (this.advices.length) {
          this.advices.forEach((a) => {
            records.push({ text: a.value, margin: [0, 5, 0, 5] });
          });
        } else {
          records.push([{ text: 'No advices added'}]);
        }
        break;
      case 'test':
        if (this.tests.length) {
          this.tests.forEach((t) => {
            records.push({ text: t.value, margin: [0, 5, 0, 5] });
          });
        } else {
          records.push([{ text: 'No tests added'}]);
        }
        break;
      case 'referral':
        const referralFacility = this.isFeatureAvailable('referralFacility', true)
        const priorityOfReferral = this.isFeatureAvailable('priorityOfReferral', true)
        let length = 2;
        if (this.referrals.length) {
          this.referrals.forEach((r) => {
            const referral = [r.speciality];
            if(referralFacility) referral.push(r.facility)
            if(priorityOfReferral) referral.push(r.priority)
            referral.push(r.reason? r.reason : '-')
            records.push(referral);
          });
        } else {
          if(referralFacility) length += 1;
          if(priorityOfReferral) length += 1;
          records.push([{ text: 'No referrals added', colSpan: length, alignment: 'center' }]);
        }
        break;
      case 'followUp':
          if (this.followUp) {
            const followUpRow = [
              this.followUp.wantFollowUp, 
              (this.isFeatureAvailable('followUpType') ? [this.followUp.followUpType ?? '-'] : []), 
              this.followUp.followUpDate ? moment(this.followUp.followUpDate).format('DD MMM YYYY') : '-', 
              (this.isFeatureAvailable('followUpTime') ? this.followUp.followUpTime ?? '-' : ''),
              this.followUp.followUpReason ?? '-'
            ];
            records.push(followUpRow);
          } else {
            records.push([{ text: 'No follow-up added', colSpan: (this.isFeatureAvailable('followUpType') ? 5 : this.isFeatureAvailable('followUpTime') ? 4 : 3), alignment: 'center' }]);
          }
          break;
      case 'cheifComplaint':
        if(this.isFeatureAvailable('dp_diagnosis_secondary') && this.checkUpReasonData.length > 0){
          this.checkUpReasonData[0].data.forEach((cc:any)=>{
            records.push({text: [{text: cc.key + ":", bold: true}, cc.value], margin: [0, 5, 0, 5]});
          });
        } else if (this.cheifComplaints.length) {
          this.cheifComplaints.forEach((cc) => {
            records.push({text: [{text: cc, bold: true}, ``], margin: [0, 5, 0, 5]});
          });
        }
        break;
      case visitTypes.VITALS:
        this.vitals.forEach((v: VitalModel) => {
          const vitalText = `${v.lang !== null ? this.getLanguageValue(v) : v.name } : ${this.getObsValue(v.uuid, v.key) ? this.getObsValue(v.uuid, v.key) : `No information`}`;
          records.push({ text: [{ text: `${v.lang !== null ? this.getLanguageValue(v) : v.name } : `, bold: true }, `${this.getObsValue(v.uuid, v.key) ? this.getObsValue(v.uuid, v.key) : `No information`}`], margin: [0, 5, 0, 5] });        });
        break;
      case 'followUpInstructions':
        if (this.followUpInstructions) {
          this.followUpInstructions.forEach((t) => {
            records.push({ text: t.value, margin: [0, 5, 0, 5] });
          });
        } else {
          records.push([{ text: 'No Follow Up Instructions added'}]);
        }
        break;
      case 'recommendation':
        if (this.recommendation) {
          records.push({ text: this.recommendation.value, margin: [0, 5, 0, 5] });
        } else {
          records.push([{ text: 'No Recommendation added'}]);
        }
        break;
      case 'specialtyNotes':
        this.specialtyNotes.forEach(note => {
          records.push({ text: this.translateService.instant(note), margin: [0, 3, 0, 3] });
        });
        break;
      default:
        console.warn(`Unknown record type: ${type}`);
    }
    
    return records;
  }
 

  toObjectUrl(url: string) {
    return fetch(url)
        .then((response) => {
          return response.blob();
        })
        .then(blob => {
          return new Promise((resolve, _) => {
              if (!blob) { resolve(''); }
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
          });
        });
  }
 
  ngOnDestroy() {
    this.eventsSubscription?.unsubscribe();
  }
 
  /**
  * Get vital value for a given vital uuid
  * @param {string} uuid - Vital uuid
  * @param {string} key - Optional vital key (e.g., 'bmi', 'temp_f')
  * @return {any} - Obs value
  */
  getObsValue(uuid: string, key?: string): any {
    const v = this.vitalObs.find(e => e.concept.uuid === uuid);
    let value = v?.value ? ( typeof v.value == 'object') ? v.value?.display : v.value : null;
    if(!value && key === 'bmi') {
      return calculateBMI(this.vitals, this.vitalObs);
    }
    // Convert temperature from Celsius to Fahrenheit if key contains 'temp'
    if (value && key && key.toLowerCase().includes('temp')) {
      const convertedValue = convertCelsiusToFahrenheit(parseFloat(value));
      return convertedValue !== null ? convertedValue : value;
    }
    return value
  }
 
  checkPatientRegField(fieldName: string): boolean{
    return this.patientRegFields.indexOf(fieldName) !== -1;
  }

  get shouldShowProfilePhoto(): boolean {
    return this.checkPatientRegField('Profile Photo') && Boolean(this.patient?.person?.uuid);
  }
  
  getPersonalInfo() {
    const data = {
      colSpan: 4,
      layout: 'noBorders',
      table: {
        widths: ['*','*','*','*'],
        body: [
          [
            {
              colSpan: 4,
              text: `Personal Information`,
              style: 'subheader'
            },
            '',
            '',
            ''
          ]
        ]
      }
    };

    let other = [];
    this.appConfigService.patient_registration['personal'].forEach((e: PatientRegistrationFieldsModel) => {
      let value: any;
      switch (e.name) {
        case 'Gender':
          value = this.patient?.person.gender == 'M' ? 'Male' : 'Female';
          break;
        case 'Age':
          value = this.getAge(this.patient?.person.birthdate);
          break;
        case 'Date of Birth':
          value = new Date(this.patient?.person.birthdate).toDateString();
          break;
        case 'Phone Number':
          value = this.getPersonAttributeValue('Telephone Number');
          break;
        case 'Guardian Type':
          value = this.getPersonAttributeValue('Guardian Type');
          break;
        case 'Guardian Name':
          value = this.getPersonAttributeValue('Guardian Name');
          break;
        case 'Emergency Contact Name':
          value = this.getPersonAttributeValue('Emergency Contact Name');
          break;
        case 'Emergency Contact Number':
          value = this.getPersonAttributeValue('Emergency Contact Number');
          break;
        case 'Contact Type':
          value = this.getPersonAttributeValue('Contact Type');
          break;
        case 'Email':
          value = this.getPersonAttributeValue('Email');
          break;
        default:
          break;
      }
      if (value !== 'NA' && value) {
        other.push({
          stack: [
            { text: e.name, style: 'subsubheader' },
            { text: value, style: 'pval' }
          ]
        });
      }
      if (e.name === 'Phone Number') {
        if (this.appConfigService?.abha_section && this.patient?.person?.abhaNumber) {
          other.push({
            stack: [
              { text: 'ABHA Number', style: 'subsubheader' },
              { text: this.patient.person.abhaNumber, style: 'pval' }
            ]
          });
        }
        if (this.appConfigService?.abha_section && this.patient?.person?.abhaAddress) {
          other.push({
            stack: [
              { text: 'ABHA Address', style: 'subsubheader' },
              { text: this.patient.person.abhaAddress, style: 'pval' }
            ]
          });
        }
      }
    });
    const chunkSize = 4;
    for (let i = 0; i < other.length; i += chunkSize) {
      const chunk = other?.slice(i, i + chunkSize);
      if (chunk.length == chunkSize) {
        data.table.body.push([...chunk]);
      } else {
        for (let x = chunk.length; x < chunkSize; x++) {
          chunk[x] = '';
        }
        data.table.body.push([...chunk]);
      }
    }

    return data;
  }

  getAddress() {
    const data = {
      colSpan: 4,
      layout: 'noBorders',
      table: {
        widths: ['*','*','*','*'],
        body: []
      }
    };
    if (this.hasPatientAddressEnabled) {
      data.table.body.push([
        {
          colSpan: 4,
          text: `Address`,
          style: 'subheader'
        },
        '',
        '',
        ''
      ]);
      let other = [];
      this.appConfigService.patient_registration['address'].forEach((e: PatientRegistrationFieldsModel) => {
        let value: any;
        switch (e.name) {
          case 'Household Number':
            value = this.patient?.person?.preferredAddress?.address6;
            break;
          case 'Corresponding Address 1':
            value = this.patient?.person?.preferredAddress?.address1;
            break;
          case 'Corresponding Address 2':
            value = this.patient?.person?.preferredAddress?.address2;
            break;
          case 'Block':
            value = this.patient?.person?.preferredAddress?.address3;
            break;
          case 'Village/Town/City':
            value = this.patient?.person.preferredAddress?.cityVillage;
            break;
          case 'District':
            value = this.patient?.person.preferredAddress?.countyDistrict;
            break;
          case 'State':
            value = this.patient?.person.preferredAddress?.stateProvince;
            break;
          case 'Country':
            value = this.patient?.person.preferredAddress?.country;
            break;
          case 'Postal Code':
            value = this.patient?.person.preferredAddress?.postalCode;
            break;
          default:
            break;
        }
        if (value) {
          other.push({ 
            stack: [
              { text: e.name, style: 'subsubheader' },
              { text: value, style: 'pval' }
            ] 
          });
        }
      });
      const chunkSize = 4;
      for (let i = 0; i < other.length; i += chunkSize) {
          const chunk = other?.slice(i, i + chunkSize);
          if (chunk.length == chunkSize) {
            data.table.body.push([...chunk]);
          } else {
            for (let x = chunk.length; x < chunkSize; x++) {
              chunk[x] = '';
            }
            data.table.body.push([...chunk]);
          }
      }
    } else {
      data.table.body.push(['','','','']);
    }
    return data;
  }

  getOtherInfo() {
    const data = {
      colSpan: 4,
      layout: 'noBorders',
      table: {
        widths: ['*','*','*','*'],
        body: []
      }
    };
    if (this.hasPatientOtherEnabled) {
      data.table.body.push([
        {
          colSpan: 4,
          text: `Other Information`,
          style: 'subheader'
        },
        '',
        '',
        ''
      ]);
      let other = [];
      this.appConfigService.patient_registration['other'].forEach((e: PatientRegistrationFieldsModel) => {
        let value: any;
        switch (e.name) {
          case 'Occupation':
            value = this.getPersonAttributeValue('occupation');
            break;
          case 'Education':
            value = this.getPersonAttributeValue('Education Level');
            break;
          case 'National ID':
            value = this.getPersonAttributeValue('NationalID');
            break;
          case 'Economic Category':
            value = this.getPersonAttributeValue('Economic Status');
            break;
          case 'Social Category':
            value = this.getPersonAttributeValue('Caste');
            break;
          // case 'TMH Case Number':
          //   value = this.getPersonAttributeValue('TMH Case Number');
          //   break;
          case 'Request ID':
            value = this.getPersonAttributeValue('Request ID');
            break;
          case 'Discipline':
            value = this.getPersonAttributeValue('Discipline');
            break;
          case 'Department':
            value = this.getPersonAttributeValue('Department');
            break;
          case 'Relative Phone Number':
            value = this.getPersonAttributeValue('Relative Phone Number');
            break;
          default:
            break;
        }
        if (value != 'NA' && value) {
          other.push({ 
            stack: [
              { text: e.name, style: 'subsubheader' },
              { text: value, style: 'pval' }
            ] 
          });
        }
      });
      const chunkSize = 4;
      for (let i = 0; i < other.length; i += chunkSize) {
          const chunk = other?.slice(i, i + chunkSize);
          if (chunk.length == chunkSize) {
            data.table.body.push([...chunk]);
          } else {
            for (let x = chunk.length; x < chunkSize; x++) {
              chunk[x] = '';
            }
            data.table.body.push([...chunk]);
          }
      }
    } else {
      data.table.body.push(['','','','']);
    }
    return data;
  }

  checkIsVisibleSection(pvsConfig: { key: string; is_enabled: boolean; }) {
    return checkIsEnabled(pvsConfig.key, 
      pvsConfig.is_enabled, {
      visitNotePresent: this.visitNotePresent,
      hasVitalsEnabled: this.hasVitalsEnabled
    })
  }

  /**
   * Retrieve the appropriate language value from an element.
   * @param {any} element - An object containing `lang` and `name`.
   * @return {string} - The value in the selected language or the first available one.
   * Defaults to `element.name` if no language value is found.
   */
  getLanguageValue(element: any): string {
    return getFieldValueByLanguage(element)
  }

  isFeatureAvailable(featureName: string, notInclude = false): boolean {
    const featureList = this.envService.getConfig('featureList')
    if(notInclude) return !featureList.includes(featureName);
    return featureList.includes(featureName);
  }

  renderReferralSectionPDF() {
    const referralFacility = this.isFeatureAvailable('referralFacility', true)
    const priorityOfReferral = this.isFeatureAvailable('priorityOfReferral', true)
    if (!referralFacility && !priorityOfReferral) {
      return {
        widths: ['35%', '65%'],
        headerRows: 1,
        body: [
          [{ text: 'Referral to', style: 'tableHeader' }, { text: 'Referral for (Reason)', style: 'tableHeader' }],
          ...this.getRecords('referral'),
        ]
      }
    }

    if (!priorityOfReferral) {
      return {
        widths: ['35%', '35%', '30%'],
        headerRows: 1,
        body: [
          [{ text: 'Referral to', style: 'tableHeader' }, { text: 'Referral facility', style: 'tableHeader' }, { text: 'Referral for (Reason)', style: 'tableHeader' }],
          ...this.getRecords('referral')
        ]
      }
    }

    if (!referralFacility) {
      return {
        widths: ['35%', '35%', '30%'],
        headerRows: 1,
        body: [
          [{ text: 'Referral to', style: 'tableHeader' }, { text: 'Priority', style: 'tableHeader' }, { text: 'Referral for (Reason)', style: 'tableHeader' }],
          ...this.getRecords('referral')
        ]
      }
    }

    return {
      widths: ['30%', '30%', '10%', '30%'],
      headerRows: 1,
      body: [
        [{ text: 'Referral to', style: 'tableHeader' }, { text: 'Referral facility', style: 'tableHeader' }, { text: 'Priority', style: 'tableHeader' }, { text: 'Referral for (Reason)', style: 'tableHeader' }],
        ...this.getRecords('referral')
      ]
    }
  }

  /**
  * Get followUpInstructions for the visit
  * @returns {void}
  */
  checkIfFollowUpInstructionsPresent(): void {
    this.followUpInstructions = [];
    this.diagnosisService.getObs(this.baseUrl,this.visit.patient.uuid, this.conceptFollowUpInstruction).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          this.followUpInstructions.push(obs);
        }
      });
    });
  }

  getDoctorRecommandation(){
    let medicinesHeaders = [{text: 'Drug name', style: 'tableHeader'}, {text: 'Strength', style: 'tableHeader'}, {text: 'No. of days', style: 'tableHeader'}, {text: 'Timing', style: 'tableHeader'}, {text: 'Frequency', style: 'tableHeader'}, {text: 'Remarks', style: 'tableHeader'}];

    if(this.appConfigService?.patient_visit_summary.standard_medication){
      medicinesHeaders = [{text: 'Drug name', style: 'tableHeader'}, {text: 'Dose', style: 'tableHeader'}, {text: 'Frequency', style: 'tableHeader'}, {text: 'Duration (number)', style: 'tableHeader'}, {text: 'Duration (units)', style: 'tableHeader'}, {text: 'Instruction(Remarks)', style: 'tableHeader'}];
    }

    let subFields = [[
      {
        colSpan: 4,
        table: {
          widths: [30, '*'],
          headerRows: 1,
          body: [
            [ {image: 'medication', width: 25, height: 25, border: [false, false, false, true]  }, {text: 'Medications', style: 'sectionheader', border: [false, false, false, true] }],
            [
              {
                colSpan: 2,
                table: {
                  widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
                  headerRows: 1,
                  body: [
                    medicinesHeaders,
                    ...this.getRecords((this.appConfigService?.patient_visit_summary.standard_medication ? 'standardMedication' : 'medication'))
                  ]
                },
                layout: 'lightHorizontalLines'
              }
            ],
            [{ text: 'Additional Instructions:', style: 'sectionheader', colSpan: 2 }, ''],
            [
              {
                colSpan: 2,
                ul: [
                  ...this.getRecords('additionalInstruction')
                ]
              }
            ]
          ]
        },
        layout: {
          defaultBorder: false
        }
      },
      '',
      '',
      ''
    ],
    [
      {
        colSpan: 4,
        table: {
          widths: [30, '*'],
          headerRows: 1,
          body: [
            [ {image: 'test', width: 25, height: 25, border: [false, false, false, true]  }, {text: 'Investigations', style: 'sectionheader', border: [false, false, false, true] }],
            [
              {
                colSpan: 2,
                ul: [
                  ...this.getRecords('test')
                ]
              }
            ]
          ]
        },
        layout: {
          defaultBorder: false
        }
      },
      '',
      '',
      ''
    ]];

    // Add follow-up instructions section if feature is available
    if (this.isFeatureAvailable('follow-up-instruction')) {
      subFields.push([
        {
          colSpan: 4,
          table: {
            widths: [30, '*'],
            headerRows: 1,
            body: [
              [ {image: 'followUp', width: 25, height: 25, border: [false, false, false, true]  }, {text: 'Follow Up', style: 'sectionheader', border: [false, false, false, true] }],
              [
                {
                  colSpan: 2,
                  ul: [
                    ...this.getRecords('followUpInstructions')
                  ]
                }
              ]
            ]
          },
          layout: {
            defaultBorder: false
          }
        },
        '',
        '',
        ''
      ]);
    }

    if(this.isFeatureAvailable('doctor-recommendation')){
      return [
        [
          {
            colSpan: 4,
            table: {
              widths: [30, '*'],
              headerRows: 1,
              body: [
                [ {image: 'advice', width: 25, height: 25, border: [false, false, false, true]  }, {text: 'Recommendation', style: 'sectionheader', border: [false, false, false, true] }],
                [
                  {
                    colSpan: 2,
                    ul: [
                      ...this.getRecords('recommendation')
                    ]
                  }
                ]
              ]
            },
            layout: {
              defaultBorder: false
            }
          },
          '',
          '',
          ''
        ]
      ]
    } else {
      return subFields;
    }
  }
  /**
 * Download prescription
 * @return {Promise<void>}
 */

  async downloadPrescription(): Promise<void> {
    try {
      const docDefinition = await this.generatePdf(); // Get the PDF content
      
      
      pdfMake.createPdf(docDefinition).download('e-prescription.pdf'); 
    } catch (error) {
      console.error('Error generating or downloading PDF:', error);
      // You might want to show a user-friendly error message here
      throw error;
    }
  }

  async generatePdf() {
    try {
      
      const userImg: any = await this.toObjectUrl(`${this.baseUrl}/personimage/${this.patient?.person.uuid}`);
      const logo: any = await this.toObjectUrl(`${this.configPublicURL}${this.logoImageURL}`);
      const checkUpReasonConfig = this.pvsConfigs.find((v) => v.key === this.pvsConstant['check_up_reason'].key);
      
      const vitalsConfig = this.pvsConfigs.find((v) => v.key === this.pvsConstant['vitals'].key); 

      let logoImage: any = { text: ''};
      if(logo && !logo?.includes('application/json') && !logo?.includes('text/html')){
        logoImage = { image: logo, width: 90, height: 30, alignment: 'right', margin: [0, 10, 10, 0] };
      }

      let signatureValue = this.signature.value;
      if(signatureValue.includes("amazonaws.com")){
        signatureValue = await this.toObjectUrl(`${this.signature.value}`);
      }
      
      const pdfObj = {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [ 20, 50, 20, 40 ],
        watermark: { text: 'INTELEHEALTH', color: 'var(--color-gray)', opacity: 0.1, bold: true, italics: false, angle: 0, fontSize: 50 },
        header: {
          columns: [
            { text: ''},
            logoImage
          ]
        },
        footer: (currentPage: { toString: () => string; }, pageCount: string) => {
          return {
            columns: [
              [ { text: (pageCount === currentPage ? '*The diagnosis and prescription is through telemedicine consultation conducted as per applicable telemedicine guideline\n\n' : '\n\n'),bold: true,fontSize: 9,margin: [10, 0, 0, 0] },{ text: 'Copyright ©2023 Intelehealth, a 501 (c)(3) & Section 8 non-profit organisation', fontSize: 8, margin: [5, 0, 0, 0]} ],
              { text: '\n\n'+currentPage.toString() + ' of ' + pageCount, width:"7%", fontSize: 8, margin: [5, 5, 5, 5], alignment: 'right'}
            ]
          };
        },
        content: [
          {
            style: 'tableExample',
            table: {
              widths: ['25%', '30%', '22%', '23%'],
              body: [
                [
                  {
                    colSpan: 4,
                    fillColor: '#E6FFF3',
                    text: 'Intelehealth e-Prescription',
                    alignment: 'center',
                    style: 'header'
                  },
                  '',
                  '',
                  ''
                ],
                [
                  {
                    colSpan: 4,
                    table: {
                      widths: ['auto', '*'],
                      body: [
                        [
                          {
                            image: (userImg && !userImg?.includes('application/json')) && this.checkPatientRegField('Profile Photo') ? userImg : 'user',
                            width: 30,
                            height: 30,
                            margin: [0, (userImg && !userImg?.includes('application/json')) ? 15 : 5, 0, 5]
                          },
                          [
                            {
                              text: `${this.patient?.person?.preferredName?.givenName?.toUpperCase()}` + (this.checkPatientRegField('Middle Name') && this.patient?.person?.preferredName?.middleName ? ' ' + this.patient?.person?.preferredName?.middleName?.toUpperCase() : '' ) + ` ${this.patient?.person?.preferredName?.familyName?.toUpperCase()}`,
                              bold: true,
                              margin: [10, 10, 0, 5],
                            }
                          ]
                        ]
                      ]
                    },
                    layout: 'noBorders'
                  },
                ],
                [
                  this.getPersonalInfo()
                ],
                [
                  this.getAddress()
                ],
                [
                  this.getOtherInfo()
                ],
                [
                  {
                    colSpan: 4,
                    sectionName:'cheifComplaint',
                    table: {
                      widths: [30, '*'],
                      headerRows: 1,
                      body: [
                        [ {image: 'cheifComplaint', width: 25, height: 25, border: [false, false, false, true] }, {text: this.getLanguageValue(checkUpReasonConfig), style: 'sectionheader', border: [false, false, false, true] }],
                        [
                          {
                            colSpan: 2,
                            ul: [
                              ...this.getRecords('cheifComplaint')
                            ]
                          }
                        ]
                      ]
                    },
                    layout: {
                      defaultBorder: false
                    }
                  },
                  '',
                  '',
                  ''
                ],
                [
                  {
                    colSpan: 4,
                    sectionName:'vitals',
                    table: {
                      widths: [30, '*'],
                      headerRows: 1,
                      body: [
                        [ {image: 'vitals', width: 25, height: 25, border: [false, false, false, true] }, {text: this.getLanguageValue(vitalsConfig), style: 'sectionheader', border: [false, false, false, true] }],
                        [
                          {
                            colSpan: 2,
                            ul: [
                              ...this.getRecords('Vitals')
                            ]
                          }
                        ]
                      ]
                    },
                    layout: {
                      defaultBorder: false
                    }
                  },
                  '',
                  '',
                  ''
                ],
                [
                  {
                    colSpan: 4,
                    table: {
                      widths: [30, '*'],
                      headerRows: 1,
                      body: [
                        [ {image: 'consultation', width: 25, height: 25, border: [false, false, false, true] }, {text: 'Consultation details', style: 'sectionheader', border: [false, false, false, true] }],
                        [
                          {
                            colSpan: 2,
                            ul: [
                              {text: [{text: 'Patient ID:', bold: true}, ` ${this.getPersonAttributeValue('TMH Case Number') !== 'NA' ? this.getPersonAttributeValue('TMH Case Number') : this.patient?.identifiers?.[0]?.identifier}`], margin: [0, 5, 0, 5]},
                              {text: [{text: 'Date of Consultation:', bold: true}, ` ${moment(this.completedEncounter?.encounterDatetime).format('DD MMM yyyy')}`],  margin: [0, 5, 0, 5]}
                            ]
                          }
                        ]
                      ]
                    },
                    layout: {
                      defaultBorder: false
                    }
                  },
                  '',
                  '',
                  ''
                ],
                this.getDiagnosis(),
                ...this.getDiscussionSummary(),
                ...(this.isFeatureAvailable('advice') ? [[
                  {
                    colSpan: 4,
                    sectionName: "advice",
                    table: {
                      widths: [30, '*'],
                      headerRows: 1,
                      body: [
                        [ {image: 'advice', width: 25, height: 25, border: [false, false, false, true]  }, {text: 'Advice', style: 'sectionheader', border: [false, false, false, true] }],
                        [
                          {
                            colSpan: 2,
                            ul: [
                              ...this.getRecords('advice')
                            ]
                          }
                        ]
                      ]
                    },
                    layout: {
                      defaultBorder: false
                    }
                  },
                  '',
                  '',
                  ''
                ]] : []),
                ...this.getDoctorRecommandation(),
                [
                  {
                    colSpan: 4,
                    sectionName: "referral",
                    table: {
                      widths: [30, '*'],
                      headerRows: 1,
                      body:  [
                        [ {image: 'referral', width: 25, height: 25, border: [false, false, false, true]  }, {text: 'Referral', style: 'sectionheader', border: [false, false, false, true] }],
                        [
                          {
                            colSpan: 2,
                            table: this.renderReferralSectionPDF(),
                            layout: 'lightHorizontalLines'
                          }
                        ]
                      ]
                    },
                    layout: {
                      defaultBorder: false
                    }
                  },
                  '',
                  '',
                  ''
                ],
                [
                  {
                    colSpan: 4,
                    sectionName:'visitFollowUp',
                    table: {
                      widths: [30, '*'],
                      headerRows: 1,
                      body: [
                        [ {image: 'followUp', width: 25, height: 25, border: [false, false, false, true]  }, {text: 'Follow-up', style: 'sectionheader', border: [false, false, false, true] }],
                        [
                          {
                            colSpan: 2,
                            table: {
                              widths:['*', '*', '*', '*', '*'],
                              headerRows: 1,
                              body: [
                              [{text: 'Follow-up Requested', style: 'tableHeader'}, (this.isFeatureAvailable('followUpType') ? {text: 'Type', style: 'tableHeader'} : []), {text: 'Date', style: 'tableHeader'}, (this.isFeatureAvailable('followUpTime') ? {text: 'Time', style: 'tableHeader'} : []), {text: 'Reason', style: 'tableHeader'}],
                                ...this.getRecords('followUp')
                              ]
                            },
                            layout: 'lightHorizontalLines'
                          }
                        ]
                      ]
                    },
                    layout: {
                      defaultBorder: false
                    }
                  },
                  '',
                  '',
                  ''
                ],
                [
                  {
                    colSpan: 4,
                    sectionName: 'specialtyNotes',
                    table: {
                      widths: [30, '*'],
                      headerRows: 1,
                      body: [
                        [ {image: 'advice', width: 25, height: 25, border: [false, false, false, true] }, {text: 'Notes & Precautions', style: 'sectionheader', border: [false, false, false, true] }],
                        [
                          {
                            colSpan: 2,
                            ul: [
                              ...this.getRecords('specialtyNotes')
                            ]
                          }
                        ]
                      ]
                    },
                    layout: {
                      defaultBorder: false
                    }
                  },
                  '',
                  '',
                  ''
                ],
                [
                  {
                    colSpan: 4,
                    alignment: 'right',
                    stack: [
                      { image: `${signatureValue}`, width: 100, margin: [0, 5, 0, 5] },
                      { text: `Dr. ${this.consultedDoctor?.name}`, margin: [0, 0, 0, 0]},
                      { text: `${this.consultedDoctor?.typeOfProfession}`},
                      { text: `Registration No. ${this.consultedDoctor?.registrationNumber}`},
                    ]
                  },
                  '',
                  '',
                  ''
                ]
              ]
            },
            layout: 'noBorders'
          }
        ],
        images: {...precription, ...logo},
        styles: {
          header: {
            fontSize: 14,
            bold: true,
            margin: [0, 10, 0, 10],
            font: 'DmSans'
          },
          subheader: {
            fontSize: 12,
            bold: true,
            margin: [0, 2, 0, 2],
            font: 'DmSans'
          },
          subsubheader: {
            fontSize: 10,
            bold: true,
            margin: [0, 2, 0, 2],
            font: 'DmSans'
          },
          pval: {
            fontSize: 10,
            margin: [0, 2, 0, 2],
            font: 'DmSans'
          },
          tableExample: {
            margin: [0, 5, 0, 5],
            fontSize: 12,
            font: 'DmSans'
          },
          tableHeader: {
            bold: true,
            fontSize: 12,
            color: 'black',
            font: 'DmSans'
          },
          sectionheader: {
            fontSize: 12,
            bold: true,
            margin: [0, 5, 0, 10],
            font: 'DmSans'
          }
        },
        defaultStyle: {
          font: 'DmSans',
        },
        fonts: {
          DmSans: {
              normal: 'DmSans-Regular.ttf',
              bold: 'DmSans-Bold.ttf',
              italics: 'DmSans-Italic.ttf',
              bolditalics: 'DmSans-BoldItalic.ttf'
          }
      }
      };
    

      pdfObj.content[0].table.body = pdfObj.content[0].table.body.filter((section:any, index: number)=>{
        // Debug: Log what's being filtered
        if (section[0] && typeof section[0] === 'object' && section[0].sectionName) {
          console.log(`Checking section ${index}: ${section[0].sectionName}`);
        }

        if (!section[0] || typeof section[0] !== 'object' || !section[0].sectionName) {
          return true; // Keep rows that don't have a sectionName
        }

        if(section[0].sectionName === 'vitals' && (!this.hasVitalsEnabled || !vitalsConfig?.is_enabled )) {
          console.log('Filtering out vitals section');
          return false;
        }
        if(section[0].sectionName === 'cheifComplaint' && !checkUpReasonConfig?.is_enabled) {
          console.log('Filtering out cheifComplaint section');
          return false;
        }
        if(section[0].sectionName === 'followUpInstructions' && !this.isFeatureAvailable('follow-up-instruction')) {
          console.log('Filtering out followUpInstructions section');
          return false;
        }
        if(section[0].sectionName === 'visitFollowUp' && !this.isFeatureAvailable('visitFollowUp')) {
          console.log('Filtering out visitFollowUp section');
          return false;
        }
        if(section[0].sectionName === 'advice' && !this.isFeatureAvailable('advice')) {
          console.log('Filtering out advice section');
          return false;
        }
        if(section[0].sectionName === 'referral' && this.brandName) {
          console.log('Filtering out referral section');
          return false;
        }
        if(section[0].sectionName === 'specialtyNotes' && !this.specialtyNotes?.length) {
          return false;
        }
        return true;
      });


      return pdfObj;
    } catch (error) {
      console.error('Error in generatePdf:', error);
      throw error;
    }
  }

  getDiscussionSummary(){
    if(!this.isFeatureAvailable('dp_discussion_summary')) return [];
    return [
      [
        {
          colSpan: 4,
          sectionName: "discussionSummary",
          table: {
            widths: [30, '*'],
            headerRows: 1,
            body: [
              [ {image: 'followUp', width: 25, height: 25, border: [false, false, false, true]  }, {text: 'Discussion Summary', style: 'sectionheader', border: [false, false, false, true] }],
              [
                {
                  colSpan: 2,
                  ul: [
                    { text: this.discussionSummary, margin: [0, 5, 0, 5] }
                  ]
                }
              ]
            ]
          },
          layout: {
            defaultBorder: false
          }
        },
        '',
        '',
        ''
      ]
    ]
  }

  getDiagnosis() {
    return [
      {
        colSpan: 4,
        table: {
          widths: [30, '*'],
          headerRows: 1,
          body: [
            [
              { image: 'diagnosis', width: 25, height: 25, border: [false, false, false, true] },
              { text: 'Diagnosis Details', style: 'sectionheader', border: [false, false, false, true] }
            ],
            [
              {
                colSpan: 2,
                table: {
                  widths: this.isFeatureAvailable('dp_diagnosis_secondary') ? ['40%', '*', '*', '*'] : ['*', '*', '*'],
                  headerRows: 1,
                  body: [
                    // Header Row
                    this.isFeatureAvailable('dp_diagnosis_secondary')
                      ? [
                          { text: 'Diagnosis', style: 'tableHeader' },
                          { text: 'Type', style: 'tableHeader' },
                          { text: 'TNM', style: 'tableHeader' },
                          { text: 'Other Staging', style: 'tableHeader' }
                        ]
                      : [
                          { text: 'Diagnosis', style: 'tableHeader' },
                          { text: 'Type', style: 'tableHeader' },
                          { text: 'Status', style: 'tableHeader' }
                        ],
                    // Data Rows
                   
                    ...this.getRecords('diagnosis').map(row => {
                      // Ensure each row has the correct number of cells
                      const paddedRow = [...row];
                      while (paddedRow.length < (this.isFeatureAvailable('dp_diagnosis_secondary') ? 4 : 3)) {
                        paddedRow.push({ text: '' }); // Add empty cells if needed
                      }
                      return paddedRow;
                    })
                  ]
                },
                layout: 'lightHorizontalLines'
              }
            ]
          ]
        },
        layout: {
          defaultBorder: false
        }
      },
      { }, 
      { },
      { } 
    ];
  }

/**
 * Returns specialty-specific prescription notes for the consulted doctor.
 * Falls back to General Physician if the doctor's specialty is disabled or unmatched.
 * Returns [] when the section is disabled or no notes are published.
  * @return {string[]}
  */
  get specialtyNotes(): string[] {
    if (this.appConfigService.prescription_notes_section === false) {
      return [];
    }

    const rows = this.appConfigService.prescription_notes;
    if (!Array.isArray(rows) || rows.length === 0) {
      return [];
    }

    const enabled = rows.filter(r => Boolean(r.is_enabled));
    if (!enabled.length) {
      return [];
    }

    const specialty = (this.consultedDoctor?.specialization || '').trim();
    const match = specialty
      ? enabled.find(r => r.specialty?.toLowerCase() === specialty.toLowerCase() || specialty?.toLowerCase().includes(r.specialty.toLowerCase()))
      : null;
    return match ? match.notes || [] : [];
  }
}
 
