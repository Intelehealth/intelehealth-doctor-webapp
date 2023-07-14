import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-gpt-input',
  templateUrl: './gpt-input.component.html',
  styleUrls: ['./gpt-input.component.scss']
})
export class GptInputComponent implements OnInit {

  gptInputs: any = [];
  gptModels: any = [];
  addGptInputForm: FormGroup;
  modelForm: FormGroup;
  submitted: boolean = false;

  constructor(
    private pageTitleService: PageTitleService,
    private visitService: VisitService,
    private toastr: ToastrService) {
    this.addGptInputForm = new FormGroup({
      input: new FormControl(null, Validators.required)
    });
    this.modelForm = new FormGroup({
      model: new FormControl(null, Validators.required)
    });
  }

  ngOnInit(): void {
    this.pageTitleService.setTitle(null);
    this.getGPTInputs();
    this.getModels();
  }

  get f() { return this.addGptInputForm.controls; }

  get f1() { return this.modelForm.controls; }

  getModels() {
    this.visitService.getGptModels().subscribe(res => {
      if (res.success) {
        this.gptModels = res.data;
        this.modelForm.get('model').setValue(this.gptModels.find(m => m.isDefault)?.id);
      }
    });
  }

  getGPTInputs() {
    this.visitService.getGptInputs().subscribe(res => {
      if (res.success) {
        this.gptInputs = res.data;
      }
    });
  }

  setAsDefault(id: number) {
    this.visitService.setAsDefaultGptInput(id).subscribe(res => {
      if (res.success) {
        this.toastr.success("GPT Input set as default successfully!", "Success");
        this.getGPTInputs();
      }
    });
  }

  addGPTInput() {
    this.submitted = true;
    if (this.addGptInputForm.invalid) {
      return;
    }
    this.visitService.addGptInputs(this.addGptInputForm.value.input).subscribe(res => {
      if (res.success) {
        this.toastr.success("GPT Input added successfully!", "Success");
        this.getGPTInputs();
        this.submitted = false;
        this.addGptInputForm.reset();
      }
    });
  }

  deleteGTPInput(id: number) {
    this.visitService.deleteGptInput(id).subscribe(res => {
      if (res.success) {
        this.toastr.success("GPT Input deleted successfully!", "Success");
        this.getGPTInputs();
      } else {
        this.toastr.success(res.message);
      }
    });
  }

  saveModel() {
    if (this.modelForm.invalid) {
      return;
    }
    this.visitService.setAsDefaultGptModel(this.modelForm.value.model).subscribe(res => {
      if (res.success) {
        this.toastr.success("GPT model set as default successfully!", "Success");
        this.getModels();
      }
    });
  }

}
