import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface IPrescriptionNotesEditData {
  id: number;
  specialty: string;
  notes: string[];
}

@Component({
  selector: 'app-prescription-notes-edit',
  templateUrl: './prescription-notes-edit.component.html',
  styleUrls: ['./prescription-notes-edit.component.scss'],
})
export class PrescriptionNotesEditComponent implements OnInit {
  @Output() onSubmit = new EventEmitter<string[]>();

  specialty: string;
  form: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IPrescriptionNotesEditData,
    private dialogRef: MatDialogRef<PrescriptionNotesEditComponent>,
    private fb: FormBuilder,
  ) {
    this.specialty = this.data?.specialty;
    this.form = this.fb.group({
      notes: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    const initial = Array.isArray(this.data?.notes) && this.data.notes.length
      ? this.data.notes
      : [''];
    initial.forEach((value) => this.notes.push(this.makeNoteControl(value)));
  }

  get notes(): FormArray {
    return this.form.get('notes') as FormArray;
  }

  private makeNoteControl(value: string = '') {
    return this.fb.group({
      value: [value, [Validators.required, Validators.maxLength(500)]],
    });
  }

  addNote(): void {
    this.notes.push(this.makeNoteControl(''));
  }

  removeNote(index: number): void {
    if (this.notes.length <= 1) {
      return;
    }
    this.notes.removeAt(index);
  }

  trackByIndex(index: number): number {
    return index;
  }

  handleSubmit(): void {
    if (this.form.invalid) {
      this.notes.controls.forEach((c) => c.markAllAsTouched());
      return;
    }
    const cleaned: string[] = this.notes.value
      .map((row: { value: string }) => (row?.value ?? '').trim())
      .filter((v: string) => v.length > 0);

    if (!cleaned.length) {
      return;
    }
    this.onSubmit.emit(cleaned);
  }

  handleCancel(): void {
    this.dialogRef.close();
  }
}
