import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { CoreService } from 'src/app/services/core/core.service';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-diagnosis-treatment-plan-configuration',
  templateUrl: './diagnosis-treatment-plan-configuration.component.html',
  styleUrls: ['./diagnosis-treatment-plan-configuration.component.scss']
})
export class DiagnosisTreatmentPlanConfigurationComponent implements OnInit {

  promptForm: FormGroup;
  submitted: boolean = false;
  gptModels: any = [];

  constructor(
    private pageTitleService: PageTitleService, 
    private coreService: CoreService,
    private visitService: VisitService,
    private toastr: ToastrService
  ) { 
    this.promptForm = new FormGroup({
      prompt1: new FormControl('', Validators.required),
      prompt2: new FormControl('', Validators.required),
      prompt3: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    this.pageTitleService.setTitle(null);
    this.getModels();
    this.getChatGptPrompts();
  }

  get f1() { return this.promptForm.controls; }

  getModels() {
    this.visitService.getChatGptModels().subscribe(res => {
      if (res.success) {
        this.gptModels = res.data;
      }
    });
  }

  getChatGptPrompts() {
    this.visitService.getChatGptPrompts().subscribe(res => {
      if (res.success) {
        this.promptForm.patchValue(res.data);
      }
    });
  }

  setAsDefaultModel(id: number) {
    this.visitService.setAsDefaultModelChatGpt(id).subscribe(res => {
      if (res.success) {
        this.toastr.success("ChatGPT model set as default successfully!", "Success");
        this.getModels();
      }
    });
  }

  savePrompts() {
    this.submitted = true;
    if (this.promptForm.invalid) {
      return;
    }
    if (!this.promptForm.value.prompt1.includes('[case information]')) {
      this.toastr.warning("Prompt #1 should contain [case informartion] placeholder", "Required placeholder must be present");
      return;
    }

    if (!this.promptForm.value.prompt2.includes('[case information]') || !this.promptForm.value.prompt2.includes('[additional notes]')) {
      this.toastr.warning("Prompt #2 should contain [case informartion] and [additional notes] placeholder", "Required placeholders must be present");
      return;
    }

    if (!this.promptForm.value.prompt3.includes('[case information]') || !this.promptForm.value.prompt3.includes('[final diagnosis]')) {
      this.toastr.warning("Prompt #3 should contain [case informartion] and [final diagnosis] placeholder", "Required placeholders must be present");
      return;
    }

    this.visitService.updateChatGptPrompts(this.promptForm.value).subscribe(res => {
      if (res.success) {
        this.toastr.success("ChatGPT prompts updated successfully!", "Success");
        this.getChatGptPrompts();
      }
    });
  }

  updateChatGptModel(data: any) {
    this.coreService.openUpateChatGptModelModal(data).subscribe(res => {
      if (res) {
        this.toastr.success("ChatGPT model updated successfully!", "Success");
        this.getModels();
      }
    });
  }

}
