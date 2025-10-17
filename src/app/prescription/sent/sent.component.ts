import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { CustomVisitModel } from 'src/app/model/model';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';
import { environment } from 'src/environments/environment';
import { AppConfigService } from '../../services/app-config.service';
import { PaginationService, PaginationState } from '../../services/pagination.service';

@Component({
  selector: 'app-sent',
  templateUrl: './sent.component.html',
  styleUrls: ['./sent.component.scss']
})
export class SentComponent implements OnInit, AfterViewInit, OnChanges {

  // Table configuration
  displayedColumns: string[] = ['name', 'age', 'visit_created', 'location', 'cheif_complaint', 'prescription_sent'];
  dataSource: CustomVisitModel[] = [];
  
  // Input properties
  @Input() prescriptionsSent: CustomVisitModel[] = [];
  @Input() prescriptionsSentCount = 0;
  
  // Output events
  @Output() fetchPageEvent = new EventEmitter<{page: number, pageSize: number, searchTerm?: string}>();
  
  // View references
  @ViewChild('sentPaginator') paginator: MatPaginator;
  @ViewChild('sentSearchInput', { static: true }) searchElement: ElementRef;
  
  // Configuration
  readonly baseUrl: string = environment.baseURL;
  readonly pageSize = environment.recordsPerPage;
  readonly patientRegFields: string[] = [];
  
  // Pagination state
  private paginationState: PaginationState = {
    pageIndex: 0,
    pageSize: environment.recordsPerPage,
    currentPage: 1,
    recordsFetched: 0
  };
  
  constructor(
    private translateService: TranslateService,
    private appConfigService: AppConfigService,
    private paginationService: PaginationService
  ) { 
    this.initializePatientRegistrationFields();
    this.configureDisplayedColumns();
  }

  private initializePatientRegistrationFields(): void {
    Object.keys(this.appConfigService.patient_registration).forEach(obj => {
      this.patientRegFields.push(
        ...this.appConfigService.patient_registration[obj]
          .filter(e => e.is_enabled)
          .map(e => e.name)
      );
    });
  }

  private configureDisplayedColumns(): void {
    this.displayedColumns = this.displayedColumns.filter(
      col => col !== 'age' || this.checkPatientRegField('Age')
    );
  }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.updatePaginationState();
    this.updateDataSource();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.prescriptionsSent && !changes.prescriptionsSent.firstChange) {
      this.updatePaginationState();
      this.updateDataSource();
      this.updatePaginator();
    }
  }

  ngAfterViewInit(): void {
    this.updateDataSource();
    this.updatePaginator();
  }

  private updatePaginationState(): void {
    this.paginationState.recordsFetched = this.prescriptionsSent.length;
  }

  private updateDataSource(): void {
    const config = this.paginationService.createPaginationConfig(
      this.paginationState.pageSize,
      this.prescriptionsSentCount,
      this.paginationState.recordsFetched
    );
    
    const result = this.paginationService.handlePagination(
      this.prescriptionsSent,
      config,
      this.paginationState.pageIndex,
      true // Enable debug logging
    );
    
    this.dataSource = result.currentPageData;
    
    if (result.debugInfo) {
      console.log('Sent Pagination Debug:', result.debugInfo);
    }
  }

  private updatePaginator(): void {
    if (this.paginator) {
      this.paginator.length = this.prescriptionsSentCount;
      this.paginator.pageIndex = this.paginationState.pageIndex;
    }
  }

  /**
   * Callback for page change event and Get visit for a selected page index and page size
   * @param {PageEvent} event - Page event
   * @return {PageEvent}
   */
  public getData(event?: PageEvent): PageEvent {
    if (!event) return event;

    this.updatePaginationFromEvent(event);
    this.clearSearchFilter();
    
    if (this.shouldFetchFromAPI()) {
      this.fetchDataFromAPI();
    } else {
      this.handleClientSidePagination();
    }
    
    return event;
  }

  private updatePaginationFromEvent(event: PageEvent): void {
    const newState = this.paginationService.updatePaginationState(event);
    this.paginationState.pageIndex = newState.pageIndex;
    this.paginationState.pageSize = newState.pageSize;
    this.paginationState.currentPage = newState.currentPage;
  }

  private clearSearchFilter(): void {
    if (this.searchElement?.nativeElement?.value) {
      this.searchElement.nativeElement.value = "";
    }
  }

  private shouldFetchFromAPI(): boolean {
    const config = this.paginationService.createPaginationConfig(
      this.paginationState.pageSize,
      this.prescriptionsSentCount,
      this.paginationState.recordsFetched
    );
    
    return this.paginationService.shouldFetchFromAPI(config, this.paginationState.pageIndex);
  }

  private fetchDataFromAPI(): void {
    this.fetchPageEvent.emit({
      page: this.paginationState.currentPage,
      pageSize: this.paginationState.pageSize
    });
  }

  /**
   * Apply filter on a datasource
   * @param {Event} event - Input's change event
   * @return {void}
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.resetToFirstPage();
    this.emitSearchEvent(filterValue.trim());
  }

  /**
   * Clear filter from a datasource
   * @return {void}
   */
  clearFilter(): void {
    this.clearSearchInput();
    this.resetToFirstPage();
    this.emitSearchEvent("");
  }

  private clearSearchInput(): void {
    if (this.searchElement?.nativeElement) {
      this.searchElement.nativeElement.value = "";
    }
  }

  private resetToFirstPage(): void {
    const resetState = this.paginationService.resetToFirstPage();
    this.paginationState.currentPage = resetState.currentPage;
    this.paginationState.pageIndex = resetState.pageIndex;
    
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  private emitSearchEvent(searchTerm: string): void {
    this.fetchPageEvent.emit({
      page: this.paginationState.currentPage,
      pageSize: this.paginationState.pageSize,
      searchTerm
    });
  }

  /**
   * Handle client-side pagination for already loaded data
   * @return {void}
   */
  private handleClientSidePagination(): void {
    this.updateDataSource();
    this.updatePaginator();
  }

  /**
   * Check if a patient registration field is enabled
   * @param {string} fieldName - The field name to check
   * @return {boolean}
   */
  checkPatientRegField(fieldName: string): boolean {
    return this.patientRegFields.includes(fieldName);
  }
}
