import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { EncounterModel, ObsApiResponseModel, ObsModel, VisitModel } from 'src/app/model/model';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { EncounterService } from 'src/app/services/encounter.service';
import { conceptIds } from 'src/config/constant';
import { autoGrowTextZone, autoGrowAllTextAreaZone } from 'src/app/utils/utility-functions';
import { tap } from 'rxjs/operators';


@Component({
  selector: 'app-follow-up-instruction',
  templateUrl: './follow-up-instruction.component.html',
  styleUrls: ['./follow-up-instruction.component.scss']
})
export class FollowUpInstructionComponent{
  @Input() isVisitNoteProvider = false;
  @Input() visitEnded: EncounterModel | string;
  @Input() set visit(_visit: VisitModel) {
    this._visit = _visit;
    if (this._visit)
      this.checkIfFollowUpInstructionsPresent();
  }
  @Input() visitNotePresent: EncounterModel;
  @Input() title: string = 'notes';
  @Input() isMCCUser: boolean = false;
 
  _visit: VisitModel;
  addInstructionForm: FormGroup = new FormGroup({
    uuid: new FormControl(null),
    instructions: new FormControl(null)
  });
  addMoreInstruction = false;
  conceptId = conceptIds.conceptFollowUpInstruction;

  constructor(
    private diagnosisSvc: DiagnosisService,
    private encounterSvc: EncounterService,
    private translateSvc: TranslateService,
    private toastr: ToastrService,
  ) { }
  /**
   * Get followUpInstructions for the visit
   * @returns {void}
   */
  checkIfFollowUpInstructionsPresent(): void {
    this.diagnosisSvc.getObs(this._visit.patient.uuid, this.conceptId).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (obs.encounter.visit.uuid === this._visit.uuid) {
          this.addInstructionForm.patchValue({uuid: obs.uuid,instructions: obs.value});
        }
      });
    });
  }


  /**
  * Save addInstruction
  * @returns Observable<boolean>
  */
  addInstructions(): Observable<any> {
    if(this.addInstructionForm.value.uuid){
      if(this.addInstructionForm.value.instructions && this.addInstructionForm.value.instructions.trim())
        return this.encounterSvc.updateObs(this.addInstructionForm.value.uuid,{value: this.addInstructionForm.value.instructions})
      else 
        return this.diagnosisSvc.deleteObs(this.addInstructionForm.value.uuid).pipe(tap((res)=>this.addInstructionForm.patchValue({ uuid: null})))
    } else if(this.addInstructionForm.value.instructions) {
      return this.encounterSvc.postObs({
        concept: this.conceptId,
        person: this._visit.patient.uuid,
        obsDatetime: new Date(),
        value: this.addInstructionForm.value.instructions,
        encounter: this.visitNotePresent.uuid
      }).pipe(tap((res)=>this.addInstructionForm.patchValue({ uuid: res.uuid})))
    } else {
      return of(false)
    }
  }

  autoGrowTextZone(e:any){
    return autoGrowTextZone(e)
  }
}
