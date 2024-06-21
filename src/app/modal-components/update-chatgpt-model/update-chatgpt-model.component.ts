import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-update-chatgpt-model',
  templateUrl: './update-chatgpt-model.component.html',
  styleUrls: ['./update-chatgpt-model.component.scss']
})
export class UpdateChatgptModelComponent implements OnInit {

  chatGptForm: FormGroup;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<UpdateChatgptModelComponent>,
    private visitService: VisitService  
  ) { 
    this.chatGptForm = new FormGroup({
      id: new FormControl(null, Validators.required),
      model: new FormControl('', Validators.required),
      temprature: new FormControl(1, [Validators.required, Validators.max(2), Validators.min(0)]),
      top_p: new FormControl(1, [Validators.required, Validators.max(1), Validators.min(0.1)]),
    });
  }

  ngOnInit(): void {
    this.chatGptForm.patchValue(this.data);
  }

  save() {
    if (this.chatGptForm.invalid) {
      return;
    }
    this.visitService.updateModelChatGpt(this.chatGptForm.value).subscribe(res => {
      if (res.success) {
        this.close(true);
      }
    });
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

}
