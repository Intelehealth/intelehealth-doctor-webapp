import { Component, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { PageTitleService } from "src/app/core/page-title/page-title.service";
import { ConfigService } from "src/app/services/config.service";
import { getCacheData } from "src/app/utils/utility-functions";
import { languages } from "src/config/constant";
import { VoiceTranscriptSource } from "src/app/utils/voice-transcript";

@Component({
  selector: 'app-ai-llm',
  templateUrl: './ai-llm.component.html',
  styleUrls: ['./ai-llm.component.scss']
})
export class AiLlmComponent {

  aiLlmDataSource = new MatTableDataSource<any>();
  aiLlmRecordingDataSource = new MatTableDataSource<any>();
  aiLlmVoiceTranscriptDataSource = new MatTableDataSource<any>();

  @ViewChild("aiLlmPaginator") aiLlmPaginator: MatPaginator;
  @ViewChild('aiLlmRecordingPaginator') aiLlmRecordingPaginator: MatPaginator;
  @ViewChild('aiLlmVoiceTranscriptPaginator') aiLlmVoiceTranscriptPaginator: MatPaginator;

  sectionEnabled: boolean = false;
  allSectionData: any = {};
  displayedAILLMColumns: string[] = ["serialNo", "section", "is_enabled"];
  displayedAILLMRecordingColumns: string[] = ["serialNo", "sectionr"];
  displayedAILLMVoiceTranscriptColumns: string[] = ["serialNo", "section", "is_enabled"];
  voiceTranscriptSourceByKey: { [key: string]: VoiceTranscriptSource } = {
    record_transcribe_webapp: "webapp"
  };

  tableData = [];
  aiLlmId: number;
  aiLlmfeatures: any = {};
  aiLlmRecordingfeatures: any ={};
  aiLlmRecordingId: any;
  aiLlmVoiceTranscriptfeatures: any = {};
  aiLlmVoiceTranscriptId: number;

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.getAILLM();
    this.getAILLMByKey();

    // AI LLM Recordings
    this.getAILLMRecording();
    this.getAILLMRecordingByKey();

    this.getAILLMVoiceTranscript();
    this.getAILLMVoiceTranscriptByKey();
  }

  ngAfterViewInit(){
    this.aiLlmDataSource.paginator = this.aiLlmPaginator;
    this.aiLlmRecordingDataSource.paginator = this.aiLlmRecordingPaginator;
    this.aiLlmVoiceTranscriptDataSource.paginator = this.aiLlmVoiceTranscriptPaginator;
  }

  /**
   * Publish langauge changes.
   * @return {void}
   */
  onPublish(): void {
    this.configService.publishConfig().subscribe(res => {
      this.toastr.success("AI LLM changes published successfully!", "Changes published!");
    });
  }

  /**
   * Get all fields.
   * @return {void}
   */
  getAILLM(): void {
    this.configService.getAILLM().subscribe((res: any) => {
      this.aiLlmDataSource = new MatTableDataSource(res.aiLlm);
      this.aiLlmDataSource.paginator = this.aiLlmPaginator;
    });
  }

  /**
   * Update patient details status.
   * @return {void}
   */
  updateAILLMEnabledStatus(id: number, status: boolean): void {
    this.configService.updateAILLMEnabledStatus(id, status).subscribe(
      (res) => {
        this.toastr.success("AI LLM have been successfully updated", "Update successful!");
        this.getAILLM();
      },
      (err) => {
        this.getAILLM();
      }
    );
  }

  getAILLMByKey() {
    this.configService.getAILLMByKey("ai_llm_section").subscribe((res: any) => {
      this.aiLlmId = res.feature.id;
      this.aiLlmfeatures = res.feature;
    });
  }

  /**
   * @return {void}
   */
  updateAILLMStatus(status: boolean): void {
    this.configService.updateFeatureEnabledStatus(this.aiLlmId, status).subscribe(
      (res) => {
        this.toastr.success("AI LLM have been successfully updated", "Update successful!");
        this.getAILLM();
      },
      (err) => {
        this.getAILLM();
      }
    );
  }

  // AI LLM Recording Section..
   /**
   * Get all fields.
   * @return {void}
   */
  getAILLMRecording(): void {
    this.configService.getAILLMRecording().subscribe((res: any) => {
      this.aiLlmRecordingDataSource = new MatTableDataSource(res.aiLlm);
      this.aiLlmRecordingDataSource.paginator = this.aiLlmRecordingPaginator;
    });
  }

  /**
   * Update patient details status.
   * @return {void}
   */
  updateAILLMRecordingEnabledStatus(id: number, status: boolean): void {
    this.configService.updateAILLMRecordingEnabledStatus(id, status).subscribe(
      (res) => {
        this.toastr.success("AI LLM recording have been successfully updated", "Update successful!");
        this.getAILLMRecording();
      },
      (err) => {
        this.getAILLMRecording();
      }
    );
  }
  
  getAILLMRecordingByKey(){
    this.configService.getAILLMRecordingByKey("ai_llm_recording_section").subscribe((res: any) => {
      this.aiLlmRecordingId = res.feature.id;
      this.aiLlmRecordingfeatures = res.feature ;
    });
  }

  /**
   * @return {void}
   */
  updateAILLMRecordingStatus(event:Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.configService.updateFeatureEnabledStatus(this.aiLlmRecordingId, checked).subscribe(
      (res) => {
        this.toastr.success("AI video recording have been successfully updated", "Update successful!");
        this.getAILLMRecording();
      },
      (err) => {
        this.getAILLMRecording();
      }
    );
  }

  getAILLMVoiceTranscript(): void {
    this.configService.getAILLMVoiceTranscript().subscribe((res: any) => {
      this.aiLlmVoiceTranscriptDataSource = new MatTableDataSource(res.aiLlm);
      this.aiLlmVoiceTranscriptDataSource.paginator = this.aiLlmVoiceTranscriptPaginator;
    });
  }

  updateAILLMVoiceTranscriptEnabledStatus(id: number, status: boolean): void {
    this.configService.updateAILLMVoiceTranscriptEnabledStatus(id, status).subscribe(
      (res) => {
        this.toastr.success("Voice transcript have been successfully updated", "Update successful!");
        this.getAILLMVoiceTranscript();
      },
      (err) => {
        this.getAILLMVoiceTranscript();
      }
    );
  }

  getAILLMVoiceTranscriptByKey(): void {
    this.configService.getAILLMVoiceTranscriptByKey("ai_llm_voice_transcript_section").subscribe((res: any) => {
      this.aiLlmVoiceTranscriptId = res.feature.id;
      this.aiLlmVoiceTranscriptfeatures = res.feature;
    });
  }

  updateAILLMVoiceTranscriptStatus(status: boolean): void {
    this.configService.updateFeatureEnabledStatus(this.aiLlmVoiceTranscriptId, status).subscribe(
      (res) => {
        this.toastr.success("Voice transcript have been successfully updated", "Update successful!");
        this.getAILLMVoiceTranscript();
      },
      (err) => {
        this.getAILLMVoiceTranscriptByKey();
        this.getAILLMVoiceTranscript();
      }
    );
  }

  viewVoiceTranscripts(source: VoiceTranscriptSource): void {
    this.router.navigate(["/admin/actions/ai-llm/voice-transcripts"], { queryParams: { source } });
  }
}
