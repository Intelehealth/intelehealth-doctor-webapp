import { Component, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { PageTitleService } from "src/app/core/page-title/page-title.service";
import { ConfigService } from "src/app/services/config.service";
import { getCacheData } from "src/app/utils/utility-functions";
import { languages } from "src/config/constant";

@Component({
  selector: 'app-ai-llm',
  templateUrl: './ai-llm.component.html',
  styleUrls: ['./ai-llm.component.scss']
})
export class AiLlmComponent {

  aiLlmDataSource = new MatTableDataSource<any>();
  @ViewChild("aiLlmPaginator") aiLlmPaginator: MatPaginator;
  sectionEnabled: boolean = false;
  allSectionData: any = {};
  displayedAILLMColumns: string[] = ["serialNo", "section"];
  tableData = [];
  aiLlmId: number;
  aiLlmfeatures: any = {};

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.getAILLM();
    this.getAILLMByKey();
  }

  ngAfterViewInit(){
    this.aiLlmDataSource.paginator = this.aiLlmPaginator;
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
}
