import { Component, Input, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { DiagnosisService } from '../../../services/diagnosis.service';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import medicines from './medicines';
import { TranslationService } from 'src/app/services/translation.service';
import * as moment from 'moment';
import { SessionService } from 'src/app/services/session.service';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VisitService } from 'src/app/services/visit.service';
declare var getEncounterUUID: any, getFromStorage: any;

@Component({
  selector: 'app-prescribed-medication',
  templateUrl: './prescribed-medication.component.html',
  styleUrls: ['./prescribed-medication.component.css'],
  animations: [
    trigger('moveInLeft', [
      transition('void=> *', [style({ transform: 'translateX(300px)' }),
      animate(200, keyframes([
        style({ transform: 'translateX(300px)' }),
        style({ transform: 'translateX(0)' })
      ]))]),
      transition('*=>void', [style({ transform: 'translateX(0px)' }),
      animate(100, keyframes([
        style({ transform: 'translateX(0px)' }),
        style({ transform: 'translateX(300px)' })
      ]))])
    ])
  ]
})
export class PrescribedMedicationComponent implements OnInit, OnDestroy {
  @Input() isManagerRole: boolean;
  @Input() visitCompleted: boolean;
  meds: any = [];
  add = false;
  encounterUuid: string;
  patientId: string;
  visitUuid: string;
  conceptPrescription = [];
  conceptDose = [];
  conceptfrequency = [];
  conceptAdministration = [];
  conceptDurationUnit = [];
  medicineObs = [];
  medicineObsList = [];
  medicinesList = [];
  objectKeys = Object.keys;
  conceptMed = 'c38c0c50-2fd2-4ae3-b7ba-7dd25adca4ca';
  isShow: boolean[] = Array(this.medicineObsList.length).fill(false);

  tempMedication: any = [];
  tempMedicationDisplay: any = [];
  private eventsSubscription: Subscription;
  @Input() events: Observable<void>;
  @Output() editedEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  interval: any;
  autoFillMedicines = [
    {
     id : 1,
     form : "pills",
     name : "Paracetamol",
     route : "Oral",
     strength : 500,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 2,
     directions : "4 times",
     frequencyNo : 4,
     duration : 5,
     totalAmoutOfDosages : 40,
     smallestPackageUI : "An envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 4,
     pricePerSmallestPackage: "10",
     PriceAutoCalculatedNonEditableUI: 20,
     class : "Pain reliever and fever reducer"
    },
    {
     id : 2,
     form : "pills",
     name : "Profin",
     route : "Oral",
     strength : 400,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "3 times when needed",
     frequencyNo : 3,
     duration : 3,
     totalAmoutOfDosages : 9,
     smallestPackageUI : "Envelope of 6 pills",
     numberOfDosesInAPackage : 6,
     countOfPackagesDispensedUI : 1.5,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Pain reliever and fever reducer"
    },
    {
     id : 3,
     form : "Suspended syrup",
     name : "Cetamol",
     route : "Oral",
     strength : 250,
     strengthUnit : "mg",
     doseUnit : "drink",
     amountPerDose : "",
     directions : "4 times",
     frequencyNo : "Every 6 hours",
     duration : 3,
     totalAmoutOfDosages : "",
     smallestPackageUI : "100 ml bottle",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : "",
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Pain reliever and fever reducer"
    },
    {
     id : 4,
     form : "drink",
     name : "Profin",
     route : "Oral",
     strength : 200,
     strengthUnit : "mg",
     doseUnit : "drink",
     amountPerDose : "",
     directions : "3 times a day",
     frequencyNo : "Every 8 hours",
     duration : "",
     totalAmoutOfDosages : "",
     smallestPackageUI : "100 ml bottle",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : "",
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Pain reliever and fever reducer"
    },
    {
     id : 5,
     form : "Ampoule",
     name : "Diclofenac sodium",
     route : "Intramuscular injection",
     strength : 75,
     strengthUnit : "mg",
     doseUnit : "Intramuscular injection",
     amountPerDose : 1,
     directions : "when it is needed",
     frequencyNo : 1,
     duration : 1,
     totalAmoutOfDosages : 1,
     smallestPackageUI : "One ampoule",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : 1,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Pain reliever and fever reducer"
    },
    {
     id : 6,
     form : "Ampoule",
     name : "Larvin",
     route : "Intramuscular injection",
     strength : 10,
     strengthUnit : "mg",
     doseUnit : "Injection",
     amountPerDose : "",
     directions : "when it is needed",
     frequencyNo : "Once",
     duration : 1,
     totalAmoutOfDosages : "",
     smallestPackageUI : "One ampoule",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : "",
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Anti-allergic"
    },
    {
     id : 7,
     form : "Ampoule",
     name : "Dexamethasone",
     route : "i.v,im",
     strength : 8,
     strengthUnit : "mg",
     doseUnit : "Injection",
     amountPerDose : "",
     directions : "According to the doctor's opinion",
     frequencyNo : 1,
     duration : 3,
     totalAmoutOfDosages : 0,
     smallestPackageUI : "One ampoule",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Anti-allergic"
    },
    {
     id : 8,
     form : "Vial",
     name : "Ceftriaxone",
     route : "i.v,im",
     strength : 1000,
     strengthUnit : "mg",
     doseUnit : "Injection",
     amountPerDose : "",
     directions : "According to the doctor's opinion",
     frequencyNo : "Every 12 hours",
     duration : 5,
     totalAmoutOfDosages : "",
     smallestPackageUI : "In the",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : "",
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "antibiotic"
    },
    {
     id : 9,
     form : "Vial",
     name : "Ceftriaxone Plus",
     route : "i.v,im",
     strength : 1500,
     strengthUnit : "mg",
     doseUnit : "Injection",
     amountPerDose : 1,
     directions : "According to the doctor's opinion",
     frequencyNo : 2,
     duration : 5,
     totalAmoutOfDosages : 10,
     smallestPackageUI : "In the",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : 10,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "antibiotic"
    },
    {
     id : 10,
     form : "Vial",
     name : "Ceftriaxone Plus",
     route : "i.v., im",
     strength : 750,
     strengthUnit : "mg",
     doseUnit : "Injection",
     amountPerDose : 1,
     directions : "According to the doctor's opinion",
     frequencyNo : 2,
     duration : 5,
     totalAmoutOfDosages : 10,
     smallestPackageUI : "In the",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : 10,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "antibiotic"
    },
    {
     id : 11,
     form : "pills",
     name : "Aspirin 81",
     route : "Oral",
     strength : 81,
     strengthUnit : "mg",
     doseUnit : "Live",
     amountPerDose : 1,
     directions : "Once a day",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "An envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Blood thinner"
    },
    {
     id : 12,
     form : "pills",
     name : "Atorvastatin",
     route : "Oral",
     strength : 10,
     strengthUnit : "mg",
     doseUnit : "Live",
     amountPerDose : 1,
     directions : "Once in the evening.",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "An envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Grease solvent"
    },
    {
     id : 13,
     form : "pills",
     name : "Atorvastatin",
     route : "Oral",
     strength : 20,
     strengthUnit : "mg",
     doseUnit : "Live",
     amountPerDose : 1,
     directions : "Once in the evening",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "An envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Grease solvent"
    },
    {
     id : 14,
     form : "pills",
     name : "Atorvastatin",
     route : "Oral",
     strength : 40,
     strengthUnit : "mg",
     doseUnit : "Live",
     amountPerDose : 1,
     directions : "Once in the evening",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "An envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Grease solvent"
    },
    {
     id : 15,
     form : "pills",
     name : "Bisoprolol",
     route : "Oral",
     strength : 2.5,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "one piece",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "An envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Beta besieged"
    },
    {
     id : 16,
     form : "pills",
     name : "Bisoprolol",
     route : "Oral",
     strength : 5,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "one piece",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "An envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Beta besieged"
    },
    {
     id : 17,
     form : "pills",
     name : "Bisoprolol",
     route : "Oral",
     strength : 10,
     strengthUnit : "mg",
     doseUnit : "Live",
     amountPerDose : 1,
     directions : "One pill daily",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "An envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Beta besieged"
    },
    {
     id : 18,
     form : "pills",
     name : "Bisoprolol Plus",
     route : "Oral",
     strength : "2.5\/6.25",
     strengthUnit : "mg",
     doseUnit : "Live",
     amountPerDose : 1,
     directions : "One pill daily",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "An envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Beta blocker and diuretic"
    },
    {
     id : 19,
     form : "pills",
     name : "Bisoprolol Plus",
     route : "Oral",
     strength : "5\/6.25",
     strengthUnit : "mg",
     doseUnit : "Live",
     amountPerDose : 1,
     directions : "One pill daily",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "An envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Beta blocker and diuretic"
    },
    {
     id : 20,
     form : "pills",
     name : "Bisoprolol Plus",
     route : "Oral",
     strength : "10\/6.25",
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "One pill daily",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "An envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Beta blocker and diuretic"
    },
    {
     id : 21,
     form : "pills",
     name : "lasix",
     route : "Oral",
     strength : 40,
     strengthUnit : "mg",
     doseUnit : "Live",
     amountPerDose : 1,
     directions : "One pill daily",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "An envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Diuretic"
    },
    {
     id : 22,
     form : "Ampoule",
     name : "lasix",
     route : "Intramuscular and intravenous",
     strength : 20,
     strengthUnit : "mg",
     doseUnit : "Injection",
     amountPerDose : 1,
     directions : "According to the doctor's opinion",
     frequencyNo : 1,
     duration : 1,
     totalAmoutOfDosages : 1,
     smallestPackageUI : "One ampoule",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : 1,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Diuretic"
    },
    {
     id : 23,
     form : "pills",
     name : "Augmentin",
     route : "Oral",
     strength : 1000,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Twice daily",
     frequencyNo : 2,
     duration : 5,
     totalAmoutOfDosages : 10,
     smallestPackageUI : "Envelope of 6 pills",
     numberOfDosesInAPackage : 6,
     countOfPackagesDispensedUI : 1.666666667,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "antibiotic"
    },
    {
     id : 24,
     form : "drink",
     name : "Augmentin",
     route : "Oral",
     strength : 457,
     strengthUnit : "mg",
     doseUnit : "drink",
     amountPerDose : "",
     directions : "Twice daily",
     frequencyNo : 2,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "60 ml bottle",
     numberOfDosesInAPackage : 60,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "antibiotic"
    },
    {
     id : 25,
     form : "pills",
     name : "Cefixime",
     route : "Oral",
     strength : 200,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Twice daily",
     frequencyNo : 2,
     duration : 5,
     totalAmoutOfDosages : 10,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 1,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "antibiotic"
    },
    {
     id : 26,
     form : "drink",
     name : "Cefixime",
     route : "Oral",
     strength : 100,
     strengthUnit : "mg",
     doseUnit : "drink",
     amountPerDose : "",
     directions : "Twice daily",
     frequencyNo : 2,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "60 ml bottle",
     numberOfDosesInAPackage : 60,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "antibiotic"
    },
    {
     id : 27,
     form : "drink",
     name : "Azthromycin",
     route : "Oral",
     strength : 200,
     strengthUnit : "mg",
     doseUnit : "drink",
     amountPerDose : "",
     directions : "Once a day",
     frequencyNo : 1,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "30 ml bottle",
     numberOfDosesInAPackage : 30,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "antibiotic"
    },
    {
     id : 28,
     form : "pills",
     name : "Azthromycin",
     route : "Oral",
     strength : 500,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Once a day",
     frequencyNo : 1,
     duration : 3,
     totalAmoutOfDosages : 3,
     smallestPackageUI : "Envelope of 3 pills",
     numberOfDosesInAPackage : 3,
     countOfPackagesDispensedUI : 1,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "antibiotic"
    },
    {
     id : 29,
     form : "capsule",
     name : "Omeprazole",
     route : "Oral",
     strength : 40,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Once a day",
     frequencyNo : 1,
     duration : 7,
     totalAmoutOfDosages : 7,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 0.7,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Antacid"
    },
    {
     id : 30,
     form : "capsule",
     name : "Levofloxacin",
     route : "Oral",
     strength : 750,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Once a day",
     frequencyNo : 1,
     duration : 7,
     totalAmoutOfDosages : 7,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 0.7,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "antibiotic"
    },
    {
     id : 31,
     form : "Drop",
     name : "Levofloxacin",
     route : "Eye drops",
     strength : 0.5,
     strengthUnit : "mg",
     doseUnit : "Drop",
     amountPerDose : 1,
     directions : "4 times daily",
     frequencyNo : 4,
     duration : 7,
     totalAmoutOfDosages : 28,
     smallestPackageUI : "10 ml bottle",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 2.8,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "antibiotic"
    },
    {
     id : 32,
     form : "Intravenous serum",
     name : "Levofloxacin",
     route : "Intravenous",
     strength : 500,
     strengthUnit : "mg",
     doseUnit : "Intravenous infusion",
     amountPerDose : "",
     directions : "Once a day",
     frequencyNo : 1,
     duration : 5,
     totalAmoutOfDosages : 0,
     smallestPackageUI : "100 ml bottle",
     numberOfDosesInAPackage : 100,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "antibiotic"
    },
    {
     id : 33,
     form : "pills",
     name : "Isodenitrate",
     route : "Oral",
     strength : 10,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : "",
     directions : "According to the doctor's opinion",
     frequencyNo : 3,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Vasodilator"
    },
    {
     id : 34,
     form : "Ampoule",
     name : "Spasmo",
     route : "Intravenous and intramuscular",
     strength : 10,
     strengthUnit : "mg",
     doseUnit : "Injection",
     amountPerDose : "",
     directions : "As needed",
     frequencyNo : 3,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "One ampoule",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Antispasmodic"
    },
    {
     id : 35,
     form : "pills",
     name : "Spacinol Plus",
     route : "Oral",
     strength : "",
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "3 times",
     frequencyNo : 3,
     duration : 5,
     totalAmoutOfDosages : 15,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 1.5,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Antispasmodic"
    },
    {
     id : 36,
     form : "pills",
     name : "Prednisolone",
     route : "Oral",
     strength : 20,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "As necessary",
     frequencyNo : 1,
     duration : 7,
     totalAmoutOfDosages : 7,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 0.7,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Anti-allergic"
    },
    {
     id : 37,
     form : "pills",
     name : "Prednisolone",
     route : "Oral",
     strength : 5,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "As necessary",
     frequencyNo : 1,
     duration : 7,
     totalAmoutOfDosages : 7,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 0.7,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Anti-allergic"
    },
    {
     id : 38,
     form : "drink",
     name : "Dailov",
     route : "Oral",
     strength : "",
     strengthUnit : "mg",
     doseUnit : "drink",
     amountPerDose : "",
     directions : "when it is needed",
     frequencyNo : 3,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "60 ml bottle",
     numberOfDosesInAPackage : 60,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Antispasmodic"
    },
    {
     id : 39,
     form : "pills",
     name : "rovaltro",
     route : "Oral",
     strength : 10,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Once a day",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Blood thinner"
    },
    {
     id : 40,
     form : "pills",
     name : "Clopid",
     route : "Oral",
     strength : 75,
     strengthUnit : "mg",
     doseUnit : "Jabbah",
     amountPerDose : 1,
     directions : "Once a day",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Blood thinner"
    },
    {
     id : 41,
     form : "drink",
     name : "Prospan",
     route : "Oral",
     strength : "",
     strengthUnit : "mg",
     doseUnit : "10 ml",
     amountPerDose : 1,
     directions : "3 times daily",
     frequencyNo : 3,
     duration : 5,
     totalAmoutOfDosages : 15,
     smallestPackageUI : "100 ml bottle",
     numberOfDosesInAPackage : 100,
     countOfPackagesDispensedUI : 0.15,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Expectorant"
    },
    {
     id : 42,
     form : "pills",
     name : "USERK",
     route : "Oral",
     strength : 16,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Twice daily",
     frequencyNo : 2,
     duration : 7,
     totalAmoutOfDosages : 14,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 1.4,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Anti-allergic"
    },
    {
     id : 43,
     form : "generous",
     name : "Fusidate",
     route : "My skin",
     strength : 30,
     strengthUnit : "love",
     doseUnit : "Tube",
     amountPerDose : "",
     directions : "Twice daily",
     frequencyNo : 2,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "Tube 30 grams",
     numberOfDosesInAPackage : 30,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "antibiotic"
    },
    {
     id : 44,
     form : "pills",
     name : "Amlodipine",
     route : "Oral",
     strength : 5,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Once a day",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Hypotensive"
    },
    {
     id : 45,
     form : "pills",
     name : "Valsartan",
     route : "Oral",
     strength : 80,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Once a day",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Hypotensive"
    },
    {
     id : 46,
     form : "drink",
     name : "Salbutamol",
     route : "Oral",
     strength : 2,
     strengthUnit : "mg",
     doseUnit : "drink",
     amountPerDose : "",
     directions : "3 times daily",
     frequencyNo : 3,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "100 ml bottle",
     numberOfDosesInAPackage : 100,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Bronchodilator"
    },
    {
     id : 47,
     form : "sprayer",
     name : "Salbutamol",
     route : "sprayer",
     strength : 4,
     strengthUnit : "mg",
     doseUnit : "Spray",
     amountPerDose : "",
     directions : "when it is needed",
     frequencyNo : 1,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "Package of 120 sprays",
     numberOfDosesInAPackage : 120,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Bronchodilator"
    },
    {
     id : 48,
     form : "Ampoule",
     name : "Ondanstrone",
     route : "Intramuscular and intravenous",
     strength : 8,
     strengthUnit : "mg",
     doseUnit : "Injection",
     amountPerDose : "",
     directions : "when it is needed",
     frequencyNo : 1,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "One ampoule",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Antiemetic"
    },
    {
     id : 49,
     form : "drink",
     name : "Ondanstrone",
     route : "Oral",
     strength : 4,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "when it is needed",
     frequencyNo : 1,
     duration : 3,
     totalAmoutOfDosages : 3,
     smallestPackageUI : "100 ml bottle",
     numberOfDosesInAPackage : 100,
     countOfPackagesDispensedUI : 0.03,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Antiemetic"
    },
    {
     id : 50,
     form : "pills",
     name : "Rambril",
     route : "Oral",
     strength : 5,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Once a day",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Hypotensive"
    },
    {
     id : 51,
     form : "pills",
     name : "Vitamin D 5000",
     route : "Oral",
     strength : "5000 units",
     strengthUnit : "international unit",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Twice a week",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Lime stabilizer"
    },
    {
     id : 52,
     form : "pills",
     name : "Eurystone",
     route : "Oral",
     strength : "",
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Twice daily",
     frequencyNo : 2,
     duration : 7,
     totalAmoutOfDosages : 14,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 1.4,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Condition for sand"
    },
    {
     id : 53,
     form : "pills",
     name : "Norgrel Plus",
     route : "Oral",
     strength : "75\\75",
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Once a day",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Blood thinner"
    },
    {
     id : 54,
     form : "pills",
     name : "Diltiazem",
     route : "Oral",
     strength : 60,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Once a day",
     frequencyNo : 1,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Lime blockade"
    },
    {
     id : 55,
     form : "Drop",
     name : "Cytonoven",
     route : "Nasal",
     strength : "0,5",
     strengthUnit : "mg",
     doseUnit : "a point",
     amountPerDose : "",
     directions : "3 times daily",
     frequencyNo : 3,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "10 ml drop",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Decongestant"
    },
    {
     id : 56,
     form : "pills",
     name : "Warfarin",
     route : "Oral",
     strength : 5,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Once a day",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Blood thinner"
    },
    {
     id : 57,
     form : "Suppositories",
     name : "Diclofenac sodium",
     route : "Anal",
     strength : 100,
     strengthUnit : "mg",
     doseUnit : "suppository",
     amountPerDose : 1,
     directions : "when it is needed",
     frequencyNo : 1,
     duration : 1,
     totalAmoutOfDosages : 1,
     smallestPackageUI : "Envelope of 5 suppositories",
     numberOfDosesInAPackage : 5,
     countOfPackagesDispensedUI : 0.2,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Pain reliever and fever reducer"
    },
    {
     id : 58,
     form : "Suppositories",
     name : "Diclofenac sodium",
     route : "Anal",
     strength : 25,
     strengthUnit : "mg",
     doseUnit : "suppository",
     amountPerDose : 1,
     directions : "when it is needed",
     frequencyNo : 1,
     duration : 1,
     totalAmoutOfDosages : 1,
     smallestPackageUI : "Envelope of 5 suppositories",
     numberOfDosesInAPackage : 5,
     countOfPackagesDispensedUI : 0.2,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Pain reliever and fever reducer"
    },
    {
     id : 59,
     form : "pills",
     name : "Davon",
     route : "Oral",
     strength : 500,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 2,
     directions : "Twice daily",
     frequencyNo : 3,
     duration : 7,
     totalAmoutOfDosages : 42,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 4.2,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Peripheral circulation stimulator"
    },
    {
     id : 60,
     form : "pills",
     name : "Inderal",
     route : "Oral",
     strength : "10 + 40",
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Once a day",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Cardiac regulator"
    },
    {
     id : 61,
     form : "pills",
     name : "Enbrel",
     route : "Oral",
     strength : 10,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Once a day",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Hypotensive"
    },
    {
     id : 62,
     form : "pills",
     name : "Flagyl",
     route : "Oral",
     strength : 500,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "3 times daily",
     frequencyNo : 3,
     duration : 5,
     totalAmoutOfDosages : 15,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 1.5,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Intestinal disinfectant"
    },
    {
     id : 63,
     form : "drink",
     name : "Flagyl",
     route : "Oral",
     strength : 200,
     strengthUnit : "mg",
     doseUnit : "drink",
     amountPerDose : "",
     directions : "3 times daily",
     frequencyNo : 3,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "100 ml bottle",
     numberOfDosesInAPackage : 100,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Intestinal disinfectant"
    },
    {
     id : 64,
     form : "pills",
     name : "apexazor",
     route : "Oral",
     strength : 2.5,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Once a day",
     frequencyNo : 1,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Blood thinner"
    },
    {
     id : 65,
     form : "pills",
     name : "Glucofer",
     route : "Oral",
     strength : 200,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : "",
     directions : "Once a day",
     frequencyNo : 1,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "iron"
    },
    {
     id : 66,
     form : "Hababat",
     name : "Glucofer",
     route : "Oral",
     strength : "",
     strengthUnit : "mg",
     doseUnit : "Hababa",
     amountPerDose : "",
     directions : "Once a day",
     frequencyNo : 1,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "One pellet",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "iron"
    },
    {
     id : 67,
     form : "pills",
     name : "D-histamine",
     route : "Oral",
     strength : 10,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Once a day",
     frequencyNo : 1,
     duration : 5,
     totalAmoutOfDosages : 5,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 0.5,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Anti-allergic"
    },
    {
     id : 68,
     form : "drink",
     name : "D-histamine",
     route : "Oral",
     strength : 5,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Once a day",
     frequencyNo : 1,
     duration : 5,
     totalAmoutOfDosages : 5,
     smallestPackageUI : "100 ml bottle",
     numberOfDosesInAPackage : 100,
     countOfPackagesDispensedUI : 0.05,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Anti-allergic"
    },
    {
     id : 69,
     form : "Intravenous serum",
     name : "Saline serum",
     route : "Intravenous",
     strength : 0.0009,
     strengthUnit : "mg",
     doseUnit : "Serum",
     amountPerDose : "",
     directions : "According to the doctor's opinion",
     frequencyNo : 1,
     duration : 1,
     totalAmoutOfDosages : 0,
     smallestPackageUI : "500 ml",
     numberOfDosesInAPackage : 500,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : ""
    },
    {
     id : 70,
     form : "Intravenous serum",
     name : "Diabetes serum",
     route : "Intravenous",
     strength : 0.05,
     strengthUnit : "mg",
     doseUnit : "Serum",
     amountPerDose : "",
     directions : "According to the doctor's opinion",
     frequencyNo : 1,
     duration : 1,
     totalAmoutOfDosages : 0,
     smallestPackageUI : "500 ml",
     numberOfDosesInAPackage : 500,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : ""
    },
    {
     id : 71,
     form : "Intravenous serum",
     name : "Mixed serum",
     route : "Intravenous",
     strength : "0,9+5",
     strengthUnit : "mg",
     doseUnit : "Serum",
     amountPerDose : "",
     directions : "According to the doctor's opinion",
     frequencyNo : 1,
     duration : 1,
     totalAmoutOfDosages : 0,
     smallestPackageUI : "500 ml",
     numberOfDosesInAPackage : 500,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : ""
    },
    {
     id : 72,
     form : "Intravenous serum",
     name : "Ranger serum",
     route : "Intravenous",
     strength : "",
     strengthUnit : "mg",
     doseUnit : "Serum",
     amountPerDose : "",
     directions : "According to the doctor's opinion",
     frequencyNo : 1,
     duration : 1,
     totalAmoutOfDosages : 0,
     smallestPackageUI : "500 ml",
     numberOfDosesInAPackage : 500,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : ""
    },
    {
     id : 73,
     form : "pills",
     name : "locust",
     route : "Oral",
     strength : 10,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Once a day in the evening",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Antihistamine and bronchodilator"
    },
    {
     id : 74,
     form : "bundle",
     name : "Gauze",
     route : "topical",
     strength : 7,
     strengthUnit : "poison",
     doseUnit : "Roll",
     amountPerDose : "",
     directions : "when it is needed",
     frequencyNo : 1,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "bond",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : ""
    },
    {
     id : 75,
     form : "Ampoule",
     name : "Tramadol",
     route : "Intramuscular and intravenous",
     strength : 100,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "when it is needed",
     frequencyNo : 1,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "One ampoule",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Central pain reliever"
    },
    {
     id : 76,
     form : "Drop",
     name : "Tobramycin",
     route : "Eye drops",
     strength : "",
     strengthUnit : "",
     doseUnit : "Drop",
     amountPerDose : 1,
     directions : "4 times daily",
     frequencyNo : 4,
     duration : 7,
     totalAmoutOfDosages : 28,
     smallestPackageUI : "10 ml drop",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 2.8,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "antibiotic"
    },
    {
     id : 77,
     form : "pills",
     name : "Cordan",
     route : "Oral",
     strength : 200,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Once a day",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "Envelope of 10 pills",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Cardiac regulator"
    },
    {
     id : 78,
     form : "solution",
     name : "Povidone",
     route : "solution",
     strength : 0.04,
     strengthUnit : "mg",
     doseUnit : "Package",
     amountPerDose : "",
     directions : "when it is needed",
     frequencyNo : 1,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "100 ml bottle",
     numberOfDosesInAPackage : 100,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "disinfected"
    },
    {
     id : 79,
     form : "generous",
     name : "Povidone",
     route : "topical",
     strength : 0.1,
     strengthUnit : "mg",
     doseUnit : "Package",
     amountPerDose : "",
     directions : "when it is needed",
     frequencyNo : 1,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "30 g package",
     numberOfDosesInAPackage : 30,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "disinfected"
    },
    {
     id : 80,
     form : "Syrink",
     name : "Syrink",
     route : "topical",
     strength : "5 cm",
     strengthUnit : "",
     doseUnit : "Syrink",
     amountPerDose : "",
     directions : "when it is needed",
     frequencyNo : 1,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "One syringe",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : ""
    },
    {
     id : 81,
     form : "Blaster",
     name : "Blaster",
     route : "topical",
     strength : "Width 5 cm",
     strengthUnit : "",
     doseUnit : "Roll",
     amountPerDose : "",
     directions : "when it is needed",
     frequencyNo : 1,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "One roll",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : ""
    },
    {
     id : 82,
     form : "solution",
     name : "alcohol",
     route : "topical",
     strength : 0.7,
     strengthUnit : "mg",
     doseUnit : "Package",
     amountPerDose : "",
     directions : "when it is needed",
     frequencyNo : 1,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "250 ml bottle",
     numberOfDosesInAPackage : 250,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "antiseptic"
    },
    {
     id : 83,
     form : "solution",
     name : "Lidocaine",
     route : "topical",
     strength : 0.02,
     strengthUnit : "mg",
     doseUnit : "In the",
     amountPerDose : "",
     directions : "when it is needed",
     frequencyNo : 1,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "25 ml bottle",
     numberOfDosesInAPackage : 25,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "local anesthetic"
    },
    {
     id : 84,
     form : "sprayer",
     name : "Unicinide",
     route : "sprayer",
     strength : 200,
     strengthUnit : "mg",
     doseUnit : "Spray",
     amountPerDose : "",
     directions : "when it is needed",
     frequencyNo : 1,
     duration : "",
     totalAmoutOfDosages : 0,
     smallestPackageUI : "Package of 120 sprays",
     numberOfDosesInAPackage : 120,
     countOfPackagesDispensedUI : 0,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Bronchoallergic antihistamine"
    },
    {
     id : 85,
     form : "pills",
     name : "Unadol Day",
     route : "Oral",
     strength : 500,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 2,
     directions : "3 times",
     frequencyNo : 3,
     duration : 5,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "",
     numberOfDosesInAPackage : "",
     countOfPackagesDispensedUI : "#DIV\/0!",
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : ""
    },
    {
     id : 86,
     form : "Enema",
     name : "Easy Enema",
     route : "Anal injection",
     strength : "",
     strengthUnit : "50ml",
     doseUnit : "Injection",
     amountPerDose : 1,
     directions : 1,
     frequencyNo : 1,
     duration : 3,
     totalAmoutOfDosages : 3,
     smallestPackageUI : "",
     numberOfDosesInAPackage : "",
     countOfPackagesDispensedUI : "#DIV\/0!",
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Intestinal laxative"
    },
    {
     id : 87,
     form : "Oral",
     name : "Miconazole gel",
     route : "Oral gel",
     strength : "",
     strengthUnit : "",
     doseUnit : "Tube",
     amountPerDose : "",
     directions : "3 times",
     frequencyNo : 3,
     duration : 7,
     totalAmoutOfDosages : 0,
     smallestPackageUI : "",
     numberOfDosesInAPackage : "",
     countOfPackagesDispensedUI : "#DIV\/0!",
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Antifungal"
    },
    {
     id : 88,
     form : "Oral",
     name : "Tamsumax",
     route : "Oral",
     strength : 0.4,
     strengthUnit : "mg",
     doseUnit : "Love it in the evening",
     amountPerDose : 1,
     directions : 1,
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "Packages of 10 tablets",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 3,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Treatment for enlarged prostate"
    },
    {
     id : 89,
     form : "Oral",
     name : "Omni",
     route : "Oral",
     strength : 300,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Twice daily",
     frequencyNo : 2,
     duration : 5,
     totalAmoutOfDosages : 10,
     smallestPackageUI : "Packages of 10 tablets",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 1,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "antibiotic"
    },
    {
     id : 90,
     form : "Oral",
     name : "Two deaths",
     route : "Oral",
     strength : 10,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Twice daily",
     frequencyNo : 2,
     duration : 5,
     totalAmoutOfDosages : 10,
     smallestPackageUI : "Packages of 10 tablets",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 1,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Antiemetic"
    },
    {
     id : 91,
     form : "drink",
     name : "Tuplexil",
     route : "Oral",
     strength : "66\/3.3\/66\/66",
     strengthUnit : "mg",
     doseUnit : "spoon 4 ml",
     amountPerDose : 2,
     directions : "4 times daily",
     frequencyNo : 4,
     duration : 5,
     totalAmoutOfDosages : 40,
     smallestPackageUI : "Package",
     numberOfDosesInAPackage : 40,
     countOfPackagesDispensedUI : 1,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Antitussive"
    },
    {
     id : 92,
     form : "drink",
     name : "Palmocast",
     route : "Oral",
     strength : "4\/4.15\/2.5",
     strengthUnit : "mg",
     doseUnit : "spoon 4 ml",
     amountPerDose : 2,
     directions : 4,
     frequencyNo : 4,
     duration : 5,
     totalAmoutOfDosages : 40,
     smallestPackageUI : "Package",
     numberOfDosesInAPackage : 40,
     countOfPackagesDispensedUI : 1,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Antitussive"
    },
    {
     id : 93,
     form : "drink",
     name : "Ventolin",
     route : "Oral",
     strength : "02-May",
     strengthUnit : "mg",
     doseUnit : "spoon 4 ml",
     amountPerDose : 1,
     directions : "4 times daily",
     frequencyNo : 4,
     duration : 5,
     totalAmoutOfDosages : 20,
     smallestPackageUI : "Package",
     numberOfDosesInAPackage : 40,
     countOfPackagesDispensedUI : 0.5,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Antitussive"
    },
    {
     id : 94,
     form : "drink",
     name : "Broncorama",
     route : "Oral",
     strength : "",
     strengthUnit : "",
     doseUnit : "spoon 4 ml",
     amountPerDose : 2,
     directions : "3 times daily",
     frequencyNo : 3,
     duration : 5,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "Package",
     numberOfDosesInAPackage : 40,
     countOfPackagesDispensedUI : 0.75,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Antitussive"
    },
    {
     id : 95,
     form : "drink",
     name : "Bronchorist",
     route : "Oral",
     strength : "4\/1.25\/50\/2.5",
     strengthUnit : "",
     doseUnit : "spoon 4 ml",
     amountPerDose : 2,
     directions : "3 times daily",
     frequencyNo : 3,
     duration : 5,
     totalAmoutOfDosages : 30,
     smallestPackageUI : "Package",
     numberOfDosesInAPackage : 40,
     countOfPackagesDispensedUI : 0.75,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Antitussive"
    },
    {
     id : 96,
     form : "pills",
     name : "Mucoular",
     route : "Oral",
     strength : 375,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "4 times",
     frequencyNo : 4,
     duration : 10,
     totalAmoutOfDosages : 40,
     smallestPackageUI : "Packages of 10 tablets",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 4,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Expectorant"
    },
    {
     id : 97,
     form : "Ampoule",
     name : "Acyclovir",
     route : "Intravenous",
     strength : 250,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "3 times daily",
     frequencyNo : 3,
     duration : 7,
     totalAmoutOfDosages : 21,
     smallestPackageUI : "Packages of 10 tablets",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 2.1,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Antiviral"
    },
    {
     id : 98,
     form : "pills",
     name : "Elvicon",
     route : "Oral",
     strength : "0500\/10\/4",
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "4 times",
     frequencyNo : 4,
     duration : 5,
     totalAmoutOfDosages : 20,
     smallestPackageUI : "Packages of 10 tablets",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 2,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Decongestant"
    },
    {
     id : 99,
     form : "pills",
     name : "No flow",
     route : "Oral",
     strength : "",
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "4 times",
     frequencyNo : 4,
     duration : 5,
     totalAmoutOfDosages : 20,
     smallestPackageUI : "Packages of 10 tablets",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 2,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Decongestant"
    },
    {
     id : 100,
     form : "sprayer",
     name : "Ipratropium Rama Forte",
     route : "Nasal spray",
     strength : 0.06,
     strengthUnit : "%",
     doseUnit : "Spray",
     amountPerDose : 1,
     directions : "Twice daily",
     frequencyNo : 2,
     duration : 30,
     totalAmoutOfDosages : 60,
     smallestPackageUI : "Package",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : 60,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Decongestant"
    },
    {
     id : 101,
     form : "sprayer",
     name : "Fluticasone rama",
     route : "Nasal spray",
     strength : 50,
     strengthUnit : "mcg",
     doseUnit : "Spray",
     amountPerDose : 1,
     directions : "Twice daily",
     frequencyNo : 2,
     duration : 30,
     totalAmoutOfDosages : 60,
     smallestPackageUI : "Package",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : 60,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Decongestant"
    },
    {
     id : 102,
     form : "sprayer",
     name : "Fluticasone Plus",
     route : "Nasal spray",
     strength : "50\/125",
     strengthUnit : "mcg",
     doseUnit : "Spray",
     amountPerDose : 1,
     directions : "Twice daily",
     frequencyNo : 2,
     duration : 30,
     totalAmoutOfDosages : 60,
     smallestPackageUI : "Package",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : 60,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Decongestant"
    },
    {
     id : 103,
     form : "sprayer",
     name : "FORMILAR PLUS",
     route : "Inhalation spray",
     strength : 125,
     strengthUnit : "mcg",
     doseUnit : "Spray",
     amountPerDose : 2,
     directions : "Twice daily",
     frequencyNo : 2,
     duration : 30,
     totalAmoutOfDosages : 120,
     smallestPackageUI : "Package of 120 sprays",
     numberOfDosesInAPackage : 120,
     countOfPackagesDispensedUI : 1,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Bronchodilator"
    },
    {
     id : 104,
     form : "sprayer",
     name : "FORMILAR PLUS",
     route : "Inhalation spray",
     strength : 250,
     strengthUnit : "mcg",
     doseUnit : "Spray",
     amountPerDose : 2,
     directions : "Twice daily",
     frequencyNo : 2,
     duration : 30,
     totalAmoutOfDosages : 120,
     smallestPackageUI : "Package of 120 sprays",
     numberOfDosesInAPackage : 120,
     countOfPackagesDispensedUI : 1,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Bronchodilator"
    },
    {
     id : 105,
     form : "sprayer",
     name : "Unizone Plus",
     route : "Inhalation spray",
     strength : "200\/6",
     strengthUnit : "mcg",
     doseUnit : "Spray",
     amountPerDose : 2,
     directions : "Twice daily",
     frequencyNo : 2,
     duration : 30,
     totalAmoutOfDosages : 120,
     smallestPackageUI : "Package of 120 sprays",
     numberOfDosesInAPackage : 120,
     countOfPackagesDispensedUI : 1,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Inhaled cortisone"
    },
    {
     id : 106,
     form : "sprayer",
     name : "Unizone Plus",
     route : "Inhalation spray",
     strength : "400\/6",
     strengthUnit : "mcg",
     doseUnit : "Spray",
     amountPerDose : 2,
     directions : "Twice daily",
     frequencyNo : 2,
     duration : 30,
     totalAmoutOfDosages : 120,
     smallestPackageUI : "Package of 120 sprays",
     numberOfDosesInAPackage : 120,
     countOfPackagesDispensedUI : 1,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Inhaled cortisone"
    },
    {
     id : 107,
     form : "sprayer",
     name : "Ibrahiler",
     route : "Inhalation spray",
     strength : 21,
     strengthUnit : "mcg",
     doseUnit : "Spray",
     amountPerDose : 2,
     directions : "Twice daily",
     frequencyNo : 2,
     duration : 30,
     totalAmoutOfDosages : 120,
     smallestPackageUI : "Package of 200 sprays",
     numberOfDosesInAPackage : 200,
     countOfPackagesDispensedUI : "",
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Bronchodilator"
    },
    {
     id : 108,
     form : "sprayer",
     name : "SALMITED",
     route : "Inhalation spray",
     strength : "25\/125",
     strengthUnit : "mcg",
     doseUnit : "Spray",
     amountPerDose : 2,
     directions : "Twice daily",
     frequencyNo : 2,
     duration : 30,
     totalAmoutOfDosages : 120,
     smallestPackageUI : "Package of 120 sprays",
     numberOfDosesInAPackage : 120,
     countOfPackagesDispensedUI : 1,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Bronchodilator"
    },
    {
     id : 109,
     form : "sprayer",
     name : "SALMITED",
     route : "Inhalation spray",
     strength : "250\/25",
     strengthUnit : "mcg",
     doseUnit : "Spray",
     amountPerDose : 2,
     directions : "Twice daily",
     frequencyNo : 2,
     duration : 30,
     totalAmoutOfDosages : 120,
     smallestPackageUI : "Package of 120 sprays",
     numberOfDosesInAPackage : 120,
     countOfPackagesDispensedUI : 1,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Bronchodilator"
    },
    {
     id : 110,
     form : "Ampoule",
     name : "Salbutamol",
     route : "Spray",
     strength : 1.5,
     strengthUnit : "mg",
     doseUnit : "Spray",
     amountPerDose : 1,
     directions : "3- 4 times daily",
     frequencyNo : "03-Apr",
     duration : 3,
     totalAmoutOfDosages : "07-Dec",
     smallestPackageUI : "One ampoule",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : "07-Dec",
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Acute attack\/bronchodilator"
    },
    {
     id : 111,
     form : "Ampoule",
     name : "Salbonb Plus",
     route : "Spray",
     strength : "3\/0.5",
     strengthUnit : "mg",
     doseUnit : "Spray",
     amountPerDose : 1,
     directions : "3- 4 times daily",
     frequencyNo : "03-Apr",
     duration : 3,
     totalAmoutOfDosages : "07-Dec",
     smallestPackageUI : "One ampoule",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : "07-Dec",
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Acute attack\/bronchodilator"
    },
    {
     id : 112,
     form : "Ampoule",
     name : "Levopenix",
     route : "Spray",
     strength : 0.31,
     strengthUnit : "mg",
     doseUnit : "Spray",
     amountPerDose : 1,
     directions : "According to weight",
     frequencyNo : 4,
     duration : 3,
     totalAmoutOfDosages : 12,
     smallestPackageUI : "One ampoule",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : 12,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Acute attack\/bronchodilator"
    },
    {
     id : 113,
     form : "Ampoule",
     name : "Levopenix",
     route : "Spray",
     strength : 1.25,
     strengthUnit : "mg",
     doseUnit : "Spray",
     amountPerDose : 1,
     directions : "4 times daily",
     frequencyNo : 4,
     duration : 3,
     totalAmoutOfDosages : 12,
     smallestPackageUI : "One ampoule",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : 12,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Acute attack\/bronchodilator"
    },
    {
     id : 114,
     form : "Ampoule",
     name : "Ipratropium",
     route : "Spray",
     strength : 0.5,
     strengthUnit : "mg",
     doseUnit : "Spray",
     amountPerDose : 1,
     directions : "3- 4 times daily",
     frequencyNo : "03-Apr",
     duration : 3,
     totalAmoutOfDosages : "07-Dec",
     smallestPackageUI : "One ampoule",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : "07-Dec",
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Acute attack\/bronchodilator"
    },
    {
     id : 115,
     form : "Ampoule",
     name : "Budesonide",
     route : "Spray",
     strength : 0.5,
     strengthUnit : "mg",
     doseUnit : "Spray",
     amountPerDose : 1,
     directions : "3 times daily",
     frequencyNo : 3,
     duration : 3,
     totalAmoutOfDosages : 9,
     smallestPackageUI : "One ampoule",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : 9,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Acute attack\/cortisone inhalation"
    },
    {
     id : 116,
     form : "Ampoule",
     name : "Ambroxol",
     route : "Spray",
     strength : 15,
     strengthUnit : "mg",
     doseUnit : "Spray",
     amountPerDose : 1,
     directions : "3 times daily",
     frequencyNo : 3,
     duration : 3,
     totalAmoutOfDosages : 9,
     smallestPackageUI : "One ampoule",
     numberOfDosesInAPackage : 1,
     countOfPackagesDispensedUI : 9,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Expectorant"
    },
    {
     id : 117,
     form : "pills",
     name : "Pharmacort",
     route : "pills",
     strength : 20,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Twice daily",
     frequencyNo : 2,
     duration : 10,
     totalAmoutOfDosages : 20,
     smallestPackageUI : "Packages of 10 tablets",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 2,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Systemic cortisone"
    },
    {
     id : 118,
     form : "pills",
     name : "Metrocourt",
     route : "pills",
     strength : 8,
     strengthUnit : "mg",
     doseUnit : "grain",
     amountPerDose : 1,
     directions : "Twice daily",
     frequencyNo : 2,
     duration : 10,
     totalAmoutOfDosages : 20,
     smallestPackageUI : "Packages of 10 tablets",
     numberOfDosesInAPackage : 10,
     countOfPackagesDispensedUI : 2,
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Systemic cortisone"
    },
    {
     id : 119,
     form : "sprayer",
     name : "Universal",
     route : "Inhalation spray",
     strength : 120,
     strengthUnit : "mcg",
     doseUnit : "Spray",
     amountPerDose : 2,
     directions : "2- 4 times daily",
     frequencyNo : "02-Apr",
     duration : 30,
     totalAmoutOfDosages : "Nov-24",
     smallestPackageUI : "Package of 200 sprays",
     numberOfDosesInAPackage : 200,
     countOfPackagesDispensedUI : "Mar-23",
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Bronchodilator"
    },
    {
     id : 120,
     form : "sprayer",
     name : "Unitobium",
     route : "Inhalation spray",
     strength : "09-Jun",
     strengthUnit : "mcg",
     doseUnit : "Spray",
     amountPerDose : 2,
     directions : "Once a day",
     frequencyNo : 1,
     duration : 30,
     totalAmoutOfDosages : 60,
     smallestPackageUI : "Package of 120 sprays",
     numberOfDosesInAPackage : 120,
     countOfPackagesDispensedUI : "",
     pricePerSmallestPackage: "",
     PriceAutoCalculatedNonEditableUI: "",
     class : "Bronchodilator"
    }
 ]
  strengthList: any[] = [
    {
      id: 1,
      name: 'mg'
    },
    {
      id: 2,
      name: 'love'
    },
    {
      id: 3,
      name: 'international unit'
    },
    {
      id: 4,
      name: 'poison'
    },
    {
      id: 5,
      name: '%'
    },
    {
      id: 6,
      name: 'mcg'
    },
  ];
  frequencyList: any = [
    {
      id: 1,
      name:"4 times"
    },
    {
      id: 2,
      name:"3 times when needed"
    },
    {
      id: 3,
      name:"3 times a day"
    },
    {
      id: 4,
      name:"when it is needed"
    },
    {
      id: 5,
      name:"According to the doctor's opinion"
    },
    {
      id: 6,
      name:"Once a day"
    },
    {
      id: 7,
      name:"Once in the evening"
    },
    {
      id: 8,
      name:"one piece"
    },
    {
      id: 9,
      name:"One pill daily"
    },
    {
      id: 10,
      name:"Twice daily"
    },
    {
      id: 11,
      name:"4 times daily"
    },
    {
      id: 12,
      name:"As needed"
    },
    {
      id: 13,
      name:"3 times"
    },
    {
      id: 14,
      name:"As necessary"
    },
    {
      id: 15,
      name:"As necessary"
    },
    {
      id: 16,
      name:"3 times daily"
    },
    {
      id: 17,
      name:"Twice a week"
    },
    {
      id: 18,
      name:"Once a day in the evening"
    },
    {
      id: 19,
      name:"1 time"
    },
    {
      id: 20,
      name:"3- 4 times daily"
    },
    {
      id: 21,
      name:"According to weight"
    },
    {
      id: 22,
      name:"2- 4 times daily"
    }
  ];
  routeList: any = [
    {
      id: 1,
      name: 'Oral'
    },
    {
      id: 1,
      name: 'Intramuscular injection'
    },
    {
      id: 1,
      name: 'i.v,im'
    },
    {
      id: 1,
      name: 'Intramuscular and intravenous'
    },
    {
      id: 1,
      name: 'Eye drops'
    },
    {
      id: 1,
      name: 'Intravenous'
    },
    {
      id: 1,
      name: 'Intravenous and intramuscular'
    },
    {
      id: 1,
      name: 'sprayer'
    },
    {
      id: 1,
      name: 'Nasal'
    },
    {
      id: 1,
      name: 'Anal'
    },
    {
      id: 1,
      name: 'topical'
    },
    {
      id: 1,
      name: 'solution'
    },
    {
      id: 1,
      name: 'Anal injection'
    },
    {
      id: 1,
      name: 'Oral gel'
    },
    {
      id: 1,
      name: 'Nasal spray'
    },
    {
      id: 1,
      name: 'Inhalation spray'
    },
    {
      id: 1,
      name: 'Spray'
    },
    {
      id: 1,
      name: 'pills'
    },
  ];
  durationUnitList: any = [
    {
      id: 1,
      name: 'Minutes'
    },
    {
      id: 2,
      name: 'Hours'
    },
    {
      id: 3,
      name: 'DAYS'
    },
    {
      id: 4,
      name: 'WEEKS'
    },
    {
      id: 5,
      name: 'MONTHS'
    },
    {
      id: 6,
      name: 'Years'
    },
    {
      id: 7,
      name: 'Number of occurrences'
    },
    {
      id: 0,
      name: 'Seconds'
    }
  ];
  formList: any = [
    {
      id: 1,
      name: 'pills'
    },
    {
      id: 2,
      name: 'Suspended syrup'
    },
    {
      id: 3,
      name: 'drink'
    },
    {
      id: 4,
      name: 'Ampoule'
    },
    {
      id: 5,
      name: 'Vial'
    },
    {
      id: 6,
      name: 'capsule'
    },
    {
      id: 7,
      name: 'Drop'
    },
    {
      id: 8,
      name: 'Intravenous serum'
    },
    {
      id: 9,
      name: 'generous'
    },
    {
      id: 10,
      name: 'sprayer'
    },
    {
      id: 11,
      name: 'Suppositories'
    },
    {
      id: 12,
      name: 'Hababat'
    },
    {
      id: 13,
      name: 'bundle'
    },
    {
      id: 14,
      name: 'solution'
    },
    {
      id: 15,
      name: 'Syrink'
    },
    {
      id: 16,
      name: 'Blaster'
    },
    {
      id: 17,
      name: 'Enema'
    },
    {
      id: 18,
      name: 'Oral'
    }
  ]
  doseUnit: any = [
    {
      id: 1,
      name: 'grain'
    },
    {
      id: 1,
      name: 'drink'
    },
    {
      id: 1,
      name: 'Intramuscular injection'
    },
    {
      id: 1,
      name: 'Injection'
    },
    {
      id: 1,
      name: 'Live'
    },
    {
      id: 1,
      name: 'Drop'
    },
    {
      id: 1,
      name: 'Intravenous infusion'
    },
    {
      id: 1,
      name: 'A forehead'
    },
    {
      id: 1,
      name: '10 ml'
    },
    {
      id: 1,
      name: 'Tube'
    },
    {
      id: 1,
      name: 'Spray'
    },
    {
      id: 1,
      name: 'a point'
    },
    {
      id: 1,
      name: 'suppository'
    },
    {
      id: 1,
      name: 'Hababa'
    },
    {
      id: 1,
      name: 'Serum'
    },
    {
      id: 1,
      name: 'Roll'
    },
    {
      id: 1,
      name: 'Syrink'
    },
    {
      id: 1,
      name: 'Package'
    },
    {
      id: 1,
      name: 'In the'
    },
    {
      id: 1,
      name: 'Love it in the evening'
    },
    {
      id: 1,
      name: 'spoon 4 ml'
    },
  ] 

  medForm = new UntypedFormGroup({
    medObj: new UntypedFormControl(null, [Validators.required]),
    med: new UntypedFormControl(null, [Validators.required]),
    dose: new UntypedFormControl(null, Validators.min(0)),
    unit: new UntypedFormControl(null, [Validators.required]),
    amount: new UntypedFormControl(null, Validators.min(1)),
    unitType: new UntypedFormControl(null, [Validators.required]),
    frequency: new UntypedFormControl(null, [Validators.required]),
    route: new UntypedFormControl(null, [Validators.required]),
    reason: new UntypedFormControl(null),
    duration: new UntypedFormControl(null, Validators.min(1)),
    durationUnit: new UntypedFormControl(null, [Validators.required]),
    additional: new UntypedFormControl(null),
    smallestPackage : new UntypedFormControl(null),
    countOfPackages : new UntypedFormControl(null),
    price: new UntypedFormControl(null),
    form: new UntypedFormControl(null)
  });

  constructor(private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute,
    private translationService: TranslationService,
    private sessionSvc: SessionService,
    private ngxTranslationService: TranslateService,
    public visitSvc: VisitService,
    private snackbar: MatSnackBar
  ) { }

  searchPrescription = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.conceptPrescription.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).sort(new Intl.Collator(localStorage.getItem("selectedLanguage"), { caseFirst: 'upper' }).compare).slice(0, 10))
    )

  searchFrequency = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.conceptfrequency.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).sort(new Intl.Collator(localStorage.getItem("selectedLanguage"), { caseFirst: 'upper' }).compare).slice(0, 10))
    )

  searchAdministration = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.conceptAdministration.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).sort(new Intl.Collator(localStorage.getItem("selectedLanguage"), { caseFirst: 'upper' }).compare).slice(0, 10))
    )

  searchDose = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.conceptDose.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).sort(new Intl.Collator(localStorage.getItem("selectedLanguage"), { caseFirst: 'upper' }).compare).slice(0, 10))
    )

  durationUnit = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.conceptDurationUnit.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).sort(new Intl.Collator(localStorage.getItem("selectedLanguage"), { caseFirst: 'upper' }).compare).slice(0, 10))
    )

  ngOnInit() {
    const prescriptionUuid = 'c25ea0e9-6522-417f-97ec-6e4b7a615254';
    // this.diagnosisService.concept(prescriptionUuid)
    // .subscribe(res => {
    //   const result = res.answers;
    //   console.log('result:>>>>>>>>>>>>>>> ', result);
    //   result.forEach(ans => {
    //     this.conceptPrescription.push(ans.display);
    //   });
    // });
    medicines.forEach(med => {
      this.conceptPrescription.push(this.translationService.getDropdownTranslation('medicines', med));
    });
    //this.conceptPrescription = this.conceptPrescription.concat(medicines)
    const doseUnit = '162384AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    this.diagnosisService.concept(doseUnit)
      .subscribe(res => {
        const result = res.setMembers;
        result.forEach(ans => {
          this.conceptDose.push(this.translationService.getDropdownTranslation('units', ans.display));
        });
      });
    const frequency = '9847b24f-8434-4ade-8978-157184c435d2';
    this.diagnosisService.concept(frequency)
      .subscribe(res => {
        const result = res.setMembers;
        result.forEach(ans => {
          this.conceptfrequency.push(this.translationService.getDropdownTranslation('frequency', ans.display));
        });
      });
    const RouteOfAdministration = '162394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    this.diagnosisService.concept(RouteOfAdministration)
      .subscribe(res => {
        const result = res.setMembers;
        result.forEach(ans => {
          this.conceptAdministration.push(this.translationService.getDropdownTranslation('route', ans.display));
        });
      });
    const conceptDurationUnit = '1732AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    this.diagnosisService.concept(conceptDurationUnit)
      .subscribe(res => {
        const result = res.setMembers;
        result.forEach(ans => {
          this.conceptDurationUnit.push(this.translationService.getDropdownTranslation('durationUnit', ans.display));
        });
      });
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    // this.meds = this.medicines
    this.diagnosisService.getObs(this.patientId, this.conceptMed).subscribe(response => {
      response.results.forEach(async obs => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          if (obs.comment) {
            const comment = obs.comment.split('|');
            obs.creatorRegNo = comment[5] != 'NA' ? `(${comment[5]})` : "(-)";
            obs.deletorRegNo = comment[3] != 'NA' ? `(${comment[3]})` : "(-)";
            this.meds.push(this.diagnosisService.getData(obs));
          } else {
            obs.creatorRegNo = await this.sessionSvc.getRegNo(obs.creator.uuid);
            this.meds.push(this.diagnosisService.getData(obs));
          }
        }
      });
      this.visitSvc.lockMedicineAidOrder.next();
    });

    this.visitSvc.fetchVisitDetails(this.visitUuid).subscribe(visitDetail => {
      visitDetail.encounters.filter((e) => {
        let medObs = {}
        if(e.display.includes("DISPENSE")){
          for(let i = 0; i < e.obs.length; i++){
            if(e.obs[i].display.includes("DISPENSE_MEDICATION")){              
              let obsData = JSON.parse(e.obs[i].value)
              medObs['medicationUuidList'] = obsData.medicationUuidList
              medObs['obsDatetime'] = e.obs[i].obsDatetime
              medObs['creator'] = {'dispensed' : e.obs[i].creator.display}
            }
          }
          this.medicineObs.push(medObs);
        }
        if(e.display.includes("ADMINISTER")){
          for(let i = 0; i < e.obs.length; i++){
            if(e.obs[i].display.includes("ADMINISTER_MEDICATION")){              
              let obsData = JSON.parse(e.obs[i].value)
              medObs['medicationUuidList'] = obsData.medicationUuidList
              medObs['obsDatetime'] = e.obs[i].obsDatetime
              medObs['creator'] = {'administered' : e.obs[i].creator.display}
            }
          }
          this.medicineObs.push(medObs);
        }
        if(e.display.includes("Visit Note")){
          this.getMedicineList(e.obs,this.medicineObs);
        }
      });      
    });

    this.visitSvc.lockMedicineAidOrder.subscribe({
      next: () => {
        if (this.visitSvc?.dispense?.length && this.meds?.length) {
          this.meds.forEach(med => {
            if (Array.isArray(this.visitSvc.dispense)) {
              this.visitSvc.dispense.forEach(dispense => {
                if (Array.isArray(dispense?.medicationUuidList) && !med.disabled) {
                  med.disabled = dispense.medicationUuidList.includes(med.uuid);
                }
              });
            }
          });
        }
      }
    });
    this.eventsSubscription = this.events?.subscribe(() => this.commentMedication());
    this.interval = setInterval(()=>{ console.log("Temporary Medicines: ", this.tempMedication.length) }, 15000);
    
    this.medForm.get('medObj').valueChanges.subscribe( val => {
      if(val?.id){
        this.medForm.patchValue({
          med: val.name,
          form: val.form,
          dose: val.strength,
          unit: val.strengthUnit,
          amount: val.amountPerDose,
          unitType: val.doseUnit,
          frequency: val.directions,
          route: val.route,
          duration: val.duration,
          reason: '',
          additional: '',
          smallestPackage : val.smallestPackageUI,
          // countOfPackages : val.countOfPackagesDispensedUI,
          // price: val?.PriceAutoCalculatedNonEditableUI,
        })
      } else {
        this.medForm.patchValue({
          med: val?.label
        });
      }
      
    })
  }

  ngOnDestroy() {
    // this.visitSvc.lockMedicineAidOrder.unsubscribe();
    this.eventsSubscription?.unsubscribe();
    if(this.interval) clearInterval(this.interval);
  }

  onSubmit() {
    const date = new Date();
    const value = this.medForm.value;
    let insertValue;
    this.diagnosisService.getTranslationData();
    setTimeout(() => {
      if (localStorage.getItem('selectedLanguage') === 'ar') {
        insertValue = {
          "ar": `${value.med} (${value.form} ${value.dose} ${value.unit})\n ${value.amount} ${value.unitType} ${value.frequency}`,
          "en": `${value.med} (${value.form} ${value.dose} ${this.diagnosisService.getTranslationValue('units', value.unit)})\n ${value.amount} ${this.diagnosisService.getTranslationValue('units', value.unitType)} ${this.diagnosisService.getTranslationValue('frequency', value.frequency)}`,
        }
        if (value.route) {
          insertValue["ar"] = `${insertValue["ar"]} (${value.route})`;
          insertValue["en"] = `${insertValue["en"]} (${this.diagnosisService.getTranslationValue('route', value.route)})`;
        }
        if (value.reason) {
          insertValue["ar"] = `${insertValue["ar"]} ${value.reason}`;
          insertValue["en"] = `${insertValue["en"]} ${value.reason}`;
        }
        insertValue["ar"] = `${insertValue["ar"]} لاجل ${value.duration} ${value.durationUnit}`;
        insertValue["en"] = `${insertValue["en"]} for ${value.duration} ${this.diagnosisService.getTranslationValue('units', value.unitType)} ${this.diagnosisService.getTranslationValue('durationUnit', value.durationUnit)}`;
        if (value.additional) {
          insertValue["ar"] = `${insertValue["ar"]} ${value.additional}`;
          insertValue["en"] = `${insertValue["en"]} ${value.additional}`;
        }
      } else {
        insertValue = {
          "en": `${value.med} (${value.form} ${value.dose} ${value.unit})\n ${value.amount} ${value.unitType} ${value.frequency}`,
          "ar": `${value.med} (${value.form} ${value.dose} ${this.diagnosisService.getTranslationValue('units', value.unit)})\n ${value.amount} ${this.diagnosisService.getTranslationValue('units', value.unitType)} ${this.diagnosisService.getTranslationValue('frequency', value.frequency)}`,
        }
        if (value.route) {
          insertValue["en"] = `${insertValue["en"]} (${value.route})`;
          insertValue["ar"] = `${insertValue["ar"]} (${this.diagnosisService.getTranslationValue('route', value.route)})`;
        }
        if (value.reason) {
          insertValue["en"] = `${insertValue["en"]} ${value.reason}`;
          insertValue["ar"] = `${insertValue["ar"]} ${value.reason}`;
        }
        insertValue["en"] = `${insertValue["en"]} for ${value.duration} ${value.durationUnit}`;
        insertValue["ar"] = `${insertValue["ar"]} لاجل ${value.duration} ${this.diagnosisService.getTranslationValue('units', value.unitType)} ${this.diagnosisService.getTranslationValue('durationUnit', value.durationUnit)}`;

        if (value.additional) {
          insertValue["en"] = `${insertValue["en"]} ${value.additional}`;
          insertValue["ar"] = `${insertValue["ar"]} ${value.additional}`;
        }
      }
      if (this.diagnosisService.isEncounterProvider()) {
        this.encounterUuid = getEncounterUUID();
        const json = {
          concept: this.conceptMed,
          person: this.patientId,
          obsDatetime: date,
          value: JSON.stringify(insertValue),
          encounter: this.encounterUuid
        };
        let flag = 0;
        if (localStorage.getItem('selectedLanguage') === 'ar') {
          for (let m = 0; m < this.meds.length; m++) {
            if (this.meds[m].value == insertValue['ar'] && this.meds[m].comment == null) {
              flag = 1;
              break;
            }
          }
          for (let m = 0; m < this.tempMedicationDisplay.length; m++) {
            if (this.tempMedicationDisplay[m].value == insertValue['ar'] && this.tempMedicationDisplay[m].comment == null) {
              flag = 1;
              break;
            }
          }
        } else {
          for (let m = 0; m < this.meds.length; m++) {
            if (this.meds[m].value == insertValue['en'] && this.meds[m].comment == null) {
              flag = 1;
              break;
            }
          }
          for (let m = 0; m < this.tempMedicationDisplay.length; m++) {
            if (this.tempMedicationDisplay[m].value == insertValue['en'] && this.tempMedicationDisplay[m].comment == null) {
              flag = 1;
              break;
            }
          }
        }
        if (flag == 1) {
          this.ngxTranslationService.get('messages.cantAdd').subscribe((res: string) => {
            this.snackbar.open(res, null, { duration: 4000, direction: this.txtDirection });
          });
          return;
        }

        this.tempMedication.push(json);
        this.editedEvent.emit(true);
        const user = getFromStorage("user");
        this.tempMedicationDisplay.push(this.diagnosisService.getData({ value: json.value, obsDatetime: date, creatorRegNo:`(${getFromStorage("registrationNumber")})`, creator: { uuid: user.uuid, person: user.person } }));
        this.add = false;
        // this.service.postObs(json)
        //   .subscribe(response => {
        //     const user = getFromStorage("user");
        //     this.meds.push(this.diagnosisService.getData({ uuid: response.uuid, value: json.value, obsDatetime: response.obsDatetime, creatorRegNo: `(${getFromStorage("registrationNumber")})`, creator: { uuid: user.uuid, person: user.person } }));
        //     this.add = false;
        //   });
      }
    }, 500);

  }

  get txtDirection() {
    return localStorage.getItem("selectedLanguage") === 'ar' ? "rtl" : "ltr";
  }

  delete(i) {
    if (this.diagnosisService.isEncounterProvider()) {
      const observation = this.meds[i];
      const uuid = observation.uuid;
      if (observation.comment) {
        console.log("Can't delete, already deleted")
      } else {
        // if (observation.creator.uuid == getFromStorage("user").uuid) {
        //   this.diagnosisService.deleteObs(uuid)
        //   .subscribe(() => {
        //     this.meds.splice(i, 1);
        //   });
        // } else {
        const provider = getFromStorage("provider");
        const deletorRegistrationNumber = getFromStorage("registrationNumber");
        const creatorRegistrationNumber = observation.creatorRegNo.replace('(', "").replace(')', "");
        const deletedTimestamp = moment.utc().toISOString();
        const prevCreator = observation?.creator?.person?.display;
        this.diagnosisService.updateObs(uuid, { comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}|${deletorRegistrationNumber ? deletorRegistrationNumber : 'NA'}|${prevCreator}|${creatorRegistrationNumber ? creatorRegistrationNumber : 'NA'}|${observation.obsDatetime.replace('+0000', 'Z')}` })
          .subscribe(() => {
            this.meds[i] = { ...this.meds[i], comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}|${deletorRegistrationNumber ? deletorRegistrationNumber : 'NA'}|${prevCreator}|${creatorRegistrationNumber ? creatorRegistrationNumber : 'NA'}|${observation.obsDatetime.replace('+0000', 'Z')}` };
          });
        // }
      }
    }
    // if (this.diagnosisService.isSameDoctor()) {
    //   const uuid = this.meds[i].uuid;
    //   this.diagnosisService.deleteObs(uuid)
    //     .subscribe(() => {
    //       this.meds.splice(i, 1);
    //     });
    // }
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
  }

  getMedicineList(obs:any, arr:any){
    for(let j = 0; j < obs.length; j++){
      let disAdminObs = {};
      let obsArr = [];
      if(obs[j].display.includes("JSV MEDICATIONS")){
        this.diagnosisService.getData(obs[j]);
        for(let x = 0; x < arr.length; x++){
          if(arr[x].medicationUuidList){
            let obsMeds = {};
            for(let y = 0; y < arr[x].medicationUuidList.length; y++){
              if(arr[x].medicationUuidList[y] === obs[j].uuid){ 
                obsMeds[obs[j].value] = [arr[x].creator, arr[x].obsDatetime];
                this.medicinesList.push(obsMeds);
              }                    
            }
          }
        }
        for(let i = 0; i < this.medicinesList.length; i++){
          if(this.objectKeys(this.medicinesList[i]).includes(obs[j].value)){            
            obsArr.push(this.medicinesList[i][obs[j].value]);
          }
        }
        disAdminObs[obs[j].value] = obsArr
        this.medicineObsList.push(disAdminObs);
      }
    }
  }

  toggleShow(index: number): void {
    this.isShow[index] = !this.isShow[index];
  }

  
  commentMedication(){
    console.log("Saving medication");
    for (let i = 0; i < this.tempMedication.length; i++) {
      this.service.postObs(this.tempMedication[i]).subscribe(response => {
        const user = getFromStorage("user");
        const obj = {
          uuid: response.uuid,
          value: response.value,
          obsDatetime: response.obsDatetime,
          creatorRegNo:`(${getFromStorage("registrationNumber")})`,
          creator: { uuid: user.uuid, person: user.person }
        }
        this.meds.push(this.diagnosisService.getData(obj));
        this.add = false;
      });
    }

    setTimeout(() => {
      this.tempMedicationDisplay = [];
      this.tempMedication = [];
    }, 1000);
  }

  tempDelete(i){    
    return this.tempMedicationDisplay.splice(i, 1) && this.tempMedication.splice(i, 1);
  }

  unSaveChanges() {
    return this.tempMedicationDisplay.length > 0 && this.tempMedication.length > 0;
  }

  addStrengthTag(tag: string) {
    return tag;
  }
}
