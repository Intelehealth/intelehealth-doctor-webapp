import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { CustomVisitModel } from 'src/app/model/model';
import { environment } from 'src/environments/environment';
import { AppConfigService } from '../../services/app-config.service';
import { PaginationService, PaginationState } from '../../services/pagination.service';

@Component({
  selector: 'app-completed',
  templateUrl: './completed.component.html',
  styleUrls: ['./completed.component.scss']
})
export class CompletedComponent implements OnInit, AfterViewInit, OnChanges {

  // Public properties
  @Input() completedVisits: CustomVisitModel[] = [];
  @Input() completedVisitsCount: number = 0;
  @Output() fetchPageEvent = new EventEmitter<{page: number, pageSize: number, searchTerm?: string}>();
  
  // ViewChild references
  @ViewChild('completedPaginator') paginator: MatPaginator;
  @ViewChild('compSearchInput', { static: true }) searchElement: ElementRef;
  
  // Component state
  displayedColumns: string[] = ['name', 'age', 'visit_created', 'location', 'cheif_complaint', 'prescription_sent', 'visit_ended'];
  dataSource: CustomVisitModel[] = [];
  baseUrl: string = environment.baseURL;
  pageIndex: number = 0;
  pageSize: number = environment.recordsPerPage;
  currentPage: number = 1;
  patientRegFields: string[] = [];
  
  // Pagination tracking
  private recordsFetched: number = 0;
  
  constructor(
    private appConfigService: AppConfigService,
    private paginationService: PaginationService
  ) { 
    this.initializePatientRegistrationFields();
    this.filterDisplayedColumns();
  }

  ngOnInit(): void {
    this.updatePaginationState();
    this.updateDataSource();
  }

  ngAfterViewInit(): void {
    this.updateDataSource();
    this.updatePaginator();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.completedVisits && !changes.completedVisits.firstChange) {
      this.updatePaginationState();
      this.updateDataSource();
      this.updatePaginator();
    }
  }

  /**
   * Handle page change event and determine if API call is needed
   * @param event - Page event
   * @returns PageEvent
   */
  public getData(event?: PageEvent): PageEvent {
    if (!event) return event;
    
    this.updatePaginationFromEvent(event);
    this.clearSearchFilter();
    
    if (this.needsApiCall()) {
      this.fetchDataFromApi();
    } else {
      this.handleClientSidePagination();
    }
    
    return event;
  }

  /**
   * Apply filter on a datasource
   * @param {Event} event - Input's change event
   * @return {void}
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    // Filter functionality can be implemented here if needed
    this.paginator.firstPage();
  }

  /**
   * Clear filter from a datasource
   * @return {void}
   */
  clearFilter(): void {
    this.searchElement.nativeElement.value = "";
    this.resetToFirstPage();
    this.emitClearSearchEvent();
  }

  checkPatientRegField(fieldName: string): boolean {
    return this.patientRegFields.includes(fieldName);
  }

  // Private helper methods
  private initializePatientRegistrationFields(): void {
    Object.keys(this.appConfigService.patient_registration).forEach(obj => {
      this.patientRegFields.push(
        ...this.appConfigService.patient_registration[obj]
          .filter((e: { is_enabled: any; }) => e.is_enabled)
          .map((e: { name: any; }) => e.name)
      );
    });
  }

  private filterDisplayedColumns(): void {
    this.displayedColumns = this.displayedColumns.filter(
      col => col !== 'age' || this.checkPatientRegField('Age')
    );
  }

  private updatePaginationState(): void {
    this.recordsFetched = this.completedVisits.length;
  }

  private updateDataSource(): void {
    const config = this.paginationService.createPaginationConfig(
      this.pageSize,
      this.completedVisitsCount,
      this.recordsFetched
    );
    
    const result = this.paginationService.handlePagination(
      this.completedVisits,
      config,
      this.pageIndex,
      true // Enable debug logging
    );
    
    this.dataSource = result.currentPageData;
    
    if (result.debugInfo) {
      console.log('Completed Pagination Debug:', result.debugInfo);
    }
  }

  private updatePaginator(): void {
    if (this.paginator) {
      this.paginator.length = this.completedVisitsCount;
      this.paginator.pageIndex = this.pageIndex;
    }
  }

  private updatePaginationFromEvent(event: PageEvent): void {
    const newState = this.paginationService.updatePaginationState(event);
    this.pageIndex = newState.pageIndex;
    this.pageSize = newState.pageSize;
    this.currentPage = newState.currentPage;
  }

  private clearSearchFilter(): void {
    if (this.searchElement?.nativeElement?.value) {
      this.searchElement.nativeElement.value = "";
    }
  }

  private needsApiCall(): boolean {
    const config = this.paginationService.createPaginationConfig(
      this.pageSize,
      this.completedVisitsCount,
      this.recordsFetched
    );
    
    return this.paginationService.shouldFetchFromAPI(config, this.pageIndex);
  }

  private fetchDataFromApi(): void {
    this.fetchPageEvent.emit({
      page: this.currentPage,
      pageSize: this.pageSize
    });
  }

  private handleClientSidePagination(): void {
    this.updateDataSource();
    this.updatePaginator();
  }


  private resetToFirstPage(): void {
    const resetState = this.paginationService.resetToFirstPage();
    this.currentPage = resetState.currentPage;
    this.pageIndex = resetState.pageIndex;
    
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  private emitClearSearchEvent(): void {
    this.fetchPageEvent.emit({
      page: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: ""
    });
  }
}
