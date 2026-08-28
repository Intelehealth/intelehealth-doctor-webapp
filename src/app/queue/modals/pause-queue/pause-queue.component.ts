import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BREAK_PRESETS } from '../../queue.model';

@Component({
  selector: 'app-pause-queue',
  templateUrl: './pause-queue.component.html'
})
export class PauseQueueComponent {

  presets = BREAK_PRESETS;
  selectedPreset: number | null = 20;
  customDuration: number | null = null;

  constructor(private dialogRef: MatDialogRef<PauseQueueComponent>) { }


  selectPreset(minutes: number) {
    this.selectedPreset = minutes;
    this.customDuration = null;
  }


  onCustomDurationChange() {
    if (this.customDuration !== null && `${this.customDuration}` !== '') {
      this.selectedPreset = null;
    }
  }

  
  get duration(): number | null {
    const custom = Number(this.customDuration);
    if (custom > 0) {
      return custom;
    }
    return this.selectedPreset;
  }

 
  close(confirmed: boolean) {
    this.dialogRef.close(confirmed ? this.duration : null);
  }
}
