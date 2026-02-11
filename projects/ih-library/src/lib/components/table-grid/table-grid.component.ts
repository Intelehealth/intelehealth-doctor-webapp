import { Component, ElementRef, OnInit, ViewChild, Input, SimpleChanges, ChangeDetectionStrategy, Inject, Output, EventEmitter, AfterViewInit} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ApiResponseModel, AppointmentModel, CustomEncounterModel, CustomObsModel, CustomVisitModel, ProviderAttributeModel, RescheduleAppointmentModalResponseModel, PatientVisitSummaryConfigModel } from '../../model/model';
import { AppointmentService } from '../../services/appointment.service';
import { VisitService } from '../../services/visit.service';
import moment from 'moment';
import { CoreService } from '../../services/core.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { getCacheData, checkIfDateOldThanOneDay, isFeaturePresent } from '../../utils/utility-functions';
import { doctorDetails, languages, visitTypes } from '../../config/constant';
import { MindmapService } from '../../services/mindmap.service';
import { AppConfigService } from '../../services/app-config.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxRolesService } from 'ngx-permissions';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'lib-table-grid',
  templateUrl: './table-grid.component.html',
  styleUrls: ['./table-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableGridComponent implements OnInit, AfterViewInit {
  
  // Constants
  private static readonly DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 25];
  private static readonly APPOINTMENT_PAGE_SIZE = 5;
  private static readonly SPECIALIZATION_UUID = 'ed1715f5-93e2-404e-b3c9-2a2d9600f062';
  private static readonly TELEPHONE_ATTRIBUTE_ID = 8;
  private static readonly FOLLOW_UP_CONCEPT_ID = 163345;
  private static readonly CHIEF_COMPLAINT_CONCEPT_ID = 163212;
  
  @Input() pluginConfigObs: any;
  displayedAppointmentColumns: any = [];
  displayedColumns: string[] = [];
  dataSource: any[] = [];
  filteredDataSource: any[] = [];
  paginatedDataSource: any[] = [];
  patientRegFields: string[] = [];
  isMCCUser = false;
  pageSizeOptions = TableGridComponent.DEFAULT_PAGE_SIZE_OPTIONS;
  
  // Unique component instance ID
  componentId: string;
  
  // @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('searchInput', { static: true }) searchElement: ElementRef;
  filteredDateAndRangeForm: FormGroup;
  @ViewChild('tempPaginator') tempPaginator: MatPaginator;
  @ViewChild('tempPaginator', { read: ElementRef })
  paginatorEl!: ElementRef<HTMLElement>;

  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;
  
  // Date picker ViewChild references
  @ViewChild('datePicker') datePicker: any;
  @ViewChild('startDatePicker') startDatePicker: any;
  @ViewChild('endDatePicker') endDatePicker: any;
  @ViewChild('filterMenu') filterMenu: any;


  panelExpanded: boolean = true;
  mode: 'date' | 'range' = 'date';
  maxDate: Date;
  dateErrorMessage: string = '';
  startDateErrorMessage: string = '';
  endDateErrorMessage: string = '';

  appointments: AppointmentModel[] = [];
  priorityVisits: CustomVisitModel[] = [];
  awaitingVisits: CustomVisitModel[] = [];
  inProgressVisits: CustomVisitModel[] = [];
  completedVisits: CustomVisitModel[] = [];
  followUpVisits: CustomVisitModel[] = [];

  specialization: string = '';
  @Output() visitsCountDate = new EventEmitter<any>();
  pageIndex: number = 0;
  pageSize: number = 0;
  pageEvent: PageEvent;
  recordsFetched: number = 0;
  totalRecords: number = 0;
  
  isFilterApplied = false;
  pvs: PatientVisitSummaryConfigModel;
  baseURL: any;
  isBrandName: string;

  // to apply filter with date and text search
  dateField: string;
  dateFilter: string;
  originalData: any[];
  filteredDataAfterDate: any[];
  tableLoader: boolean;
  
  // Custom pagination properties
  currentPage: number = 0;
  itemsPerPage: number = 0;
  searchTerm: string = '';
  currentDateFilter: any = null;
  
  // Filtered data properties
  filteredTotalCount: number = 0;
  isFilterActive: boolean = false;
  paginationDisabled: boolean = false;


ngAfterViewInit(): void {
  // Wait for the paginator to be fully initialized
  setTimeout(() => {
    if (this.paginatorEl && this.paginatorEl.nativeElement) {
      const el = this.paginatorEl.nativeElement;
      const suffix = this.pluginConfigObs?.pluginConfigObsFlag || '';

      el.querySelector('.mat-paginator-navigation-next')
        ?.setAttribute('data-test-id', `paginator-next-${suffix}`);

      el.querySelector('.mat-paginator-navigation-previous')
        ?.setAttribute('data-test-id', `paginator-prev-${suffix}`);

      el.querySelector('.mat-paginator-navigation-first')
        ?.setAttribute('data-test-id', `paginator-first-${suffix}`);

      el.querySelector('.mat-paginator-navigation-last')
        ?.setAttribute('data-test-id', `paginator-last-${suffix}`);

      el.querySelector('.mat-paginator-range-label')
        ?.setAttribute('data-test-id', `paginator-range-label-${suffix}`);
    }
  }, 100);
}
  constructor(
    private appointmentService: AppointmentService,
    private visitService: VisitService,
    private coreService: CoreService,
    private toastr: ToastrService,
    private translateService: TranslateService,
    private mindmapService: MindmapService,
    private sanitizer: DomSanitizer,
    private appConfigService: AppConfigService,
    private rolesService: NgxRolesService,
    private ngxLoader: NgxUiLoaderService,
    @Inject('environment') environment
  ) { 
    this.isBrandName = environment.brandName;
    // Generate unique component ID
    this.componentId = 'table-grid-' + Math.random().toString(36).substr(2, 9);
    this.tableLoader = isFeaturePresent(environment.featureList, 'tableLoader');
    this.baseURL = environment.baseURL;
    this.pageSize = environment.recordsPerPage;
    this.itemsPerPage = environment.recordsPerPage;
    this.filteredDateAndRangeForm = this.createFilteredDateRangeForm();
  }

  /**
   * Creates a filtered date range form with required date fields
   * @return {FormGroup} - The created form group
   */
  createFilteredDateRangeForm(): FormGroup {
    return new FormGroup({
      date: new FormControl('', [Validators.required]),
      startDate: new FormControl(null, Validators.required),
      endDate: new FormControl(null, Validators.required),
    });
  }

  /**
   * Initialize component-specific state to prevent conflicts between multiple instances
   */
  private initializeComponentState(): void {
    // Reset all component-specific arrays and objects
    this.appointments = [];
    this.priorityVisits = [];
    this.awaitingVisits = [];
    this.inProgressVisits = [];
    this.completedVisits = [];
    this.followUpVisits = [];
    
    // Reset pagination state
    this.pageIndex = 0;
    this.recordsFetched = 0;
    this.totalRecords = 0;
    
    // Reset filter state
    this.isFilterApplied = false;
    this.isFilterActive = false;
    this.filteredTotalCount = 0;
    this.paginationDisabled = false;
    this.originalData = [];
    this.filteredDataAfterDate = [];
    
    // Reset data arrays for this instance
    this.dataSource = [];
    this.filteredDataSource = [];
    this.paginatedDataSource = [];
    this.currentPage = 0;
    this.searchTerm = '';
    this.currentDateFilter = null;
   
    if(this.pluginConfigObs?.pluginConfigObsFlag === 'Appointment'){
      this.pageSize = TableGridComponent.APPOINTMENT_PAGE_SIZE;
      this.itemsPerPage = TableGridComponent.APPOINTMENT_PAGE_SIZE;
      console.log('itemsPerPage', this.itemsPerPage);
    }
  }

  /**
   * Apply custom pagination to the filtered data
   */
  private applyPagination(): void {
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedDataSource = this.filteredDataSource.slice(startIndex, endIndex);
  }

  /**
   * Calculate pagination indices
   */
  private getPaginationIndices(): { startIndex: number; endIndex: number } {
    return {
      startIndex: this.currentPage * this.itemsPerPage,
      endIndex: (this.currentPage + 1) * this.itemsPerPage
    };
  }

  /**
   * Restore current page data from original data
   */
  private restoreCurrentPageData(): void {
    const { startIndex, endIndex } = this.getPaginationIndices();
    this.paginatedDataSource = this.originalData.slice(startIndex, endIndex);
  }

  /**
   * Apply search filter to the current page data only
   */
  private applySearchFilter(): void {
    if (!this.searchTerm.trim()) {
      this.restoreCurrentPageData();
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.paginatedDataSource = this.paginatedDataSource.filter((item: any) => 
        this.matchesSearchTerm(item, searchLower)
      );
    }
  }

  /**
   * Get formatted date for an item based on the date field
   */
  private getItemDate(item: any, dateField: string): string {
    if (dateField === 'followUp') {
      return this.formatDate(this.convertToISO(item.followUp));
    } else if (dateField === 'slotJsDate') {
      return this.formatDate(item[dateField]);
    } else {
      return item[dateField].includes(',') ? this.formatDate(item[dateField]) : this.convertToDate(item[dateField]);
    }
  }

  /**
   * Check if item matches search term
   */
  private matchesSearchTerm(item: any, searchLower: string): boolean {
    if (this.pluginConfigObs?.pluginConfigObsFlag === 'Appointment') {
      return (
        item?.openMrsId?.toLowerCase().includes(searchLower) ||
        item?.patientName?.toLowerCase().includes(searchLower) ||
        item?.TMH_patient_id?.toLowerCase().includes(searchLower)
      );
    } else {
      return (
        item?.patient?.identifier?.toLowerCase().includes(searchLower) ||
        item?.patient_name?.given_name?.toLowerCase().includes(searchLower) ||
        item?.patient_name?.family_name?.toLowerCase().includes(searchLower)
      );
    }
  }

  /**
   * Apply multiple filters efficiently
   */
  private applyFilters(): void {
    // Check if any filters are active
    this.isFilterActive = !!(this.searchTerm.trim() || this.currentDateFilter);
    this.paginationDisabled = this.isFilterActive;
    
    // If no search term and no date filter, restore current page data
    if (!this.isFilterActive) {
      this.restoreCurrentPageData();
      this.updatePaginatorLength();
      return;
    }
    
    // Always start with current page data from original data when applying filters
    const { startIndex, endIndex } = this.getPaginationIndices();
    let filteredData = this.originalData.slice(startIndex, endIndex);
    
    // Apply date filter
    if (this.currentDateFilter) {
      const { dateField, filterValue, isRange, startDate, endDate } = this.currentDateFilter;
      filteredData = filteredData.filter((item: any) => {
        const itemDate = this.getItemDate(item, dateField);
        
        if (isRange && startDate && endDate) {
          return itemDate >= startDate && itemDate <= endDate;
        } else if (filterValue) {
          return itemDate === filterValue;
        }
        return true;
      });
    }
    
    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filteredData = filteredData.filter((item: any) => this.matchesSearchTerm(item, searchLower));
    }
    
    // Update filtered count for current page
    this.filteredTotalCount = filteredData.length;
    this.paginatedDataSource = filteredData;
    
    // Update paginator length
    this.updatePaginatorLength();
  }

  /**
   * Update paginator length based on filter state
   */
  private updatePaginatorLength(): void {
    if (this.tempPaginator) {
      this.tempPaginator.length = this.isFilterActive ? this.filteredTotalCount : this.totalRecords;
    }
  }

  /**
   * Check if pagination should be disabled
   */
  public isPaginationDisabled(): boolean {
    return this.isFilterActive || this.paginationDisabled;
  }

  /**
   * Get the current total count (filtered or original)
   */
  public getCurrentTotalCount(): number {
    return this.isFilterActive ? this.filteredTotalCount : this.totalRecords;
  }

  ngOnInit(): void {
    this.isMCCUser = !!this.rolesService.getRole('ORGANIZATIONAL:MCC');
    
    // Initialize component-specific state
    this.initializeComponentState();

    this.appConfigService.load().then(() => {
    this.displayedColumns = this.displayedColumns.filter(col=>(col!=='age' || this.checkPatientRegField('Age')));
      Object.keys(this.appConfigService.patient_registration).forEach(obj=>{
        this.patientRegFields.push(...this.appConfigService.patient_registration[obj].filter((e: { is_enabled: any; })=>e.is_enabled).map((e: { name: any; })=>e.name));
      });
      this.pvs = { ...this.appConfigService.patient_visit_summary }; 
      this.pvs.appointment_button = this.pvs.appointment_button;
      this.displayedColumns = this.displayedColumns.filter(col=> {
        if(col === 'drName' && !this.isMCCUser) return false;
        if(col === 'age') return this.checkPatientRegField('Age');
        return true;
      });

      if(!this.pvs.awaiting_visits_patient_type_demarcation){
        this.displayedColumns = this.displayedColumns.filter(col=>(col!=='patient_type'));
      }
    }).catch((error) => {
      console.error('Error loading app config', error);
    });

    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    let provider = getCacheData(true, doctorDetails.PROVIDER);
    if (provider) {
      if (provider.attributes.length) {
        this.specialization = this.getSpecialization(provider.attributes);
      }
      if(this.pluginConfigObs?.pluginConfigObsFlag === "Appointment"){
        this.getAppointments();
      }
      if(this.pluginConfigObs?.pluginConfigObsFlag === "Awaiting"){
        this.getAwaitingVisits(1);
      }
      if(this.pluginConfigObs?.pluginConfigObsFlag === "Priority"){
        this.getPriorityVisits(1);
      }
      if(this.pluginConfigObs?.pluginConfigObsFlag === "InProgress"){
        this.getInProgressVisits(1);
      }
      if(this.pluginConfigObs?.pluginConfigObsFlag === "Completed"){
        this.getCompletedVisits(1);
      }if(this.pluginConfigObs?.pluginConfigObsFlag === "FollowUp"){
        this.getFollowUpVisit(1);
      }
    }
    this.maxDate = this.pluginConfigObs.filterObs.filterDateMax;
    if(this.pluginConfigObs.hasOwnProperty("pageSizeOptions")){
      this.pageSizeOptions = this.pluginConfigObs.pageSizeOptions
    }
  }

  /**
   * Dynmaic label Display
   * @param changes pluginConfigObs 
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["pluginConfigObs"] && changes["pluginConfigObs"].currentValue) {
      this.displayedAppointmentColumns = [...changes["pluginConfigObs"].currentValue?.tableColumns]
      this.displayedColumns = this.displayedAppointmentColumns.map(column => column.key);
    }
    if( (!changes['pluginConfigObs'].firstChange) && this.pluginConfigObs.pluginConfigObsFlag == "Appointment" && changes["pluginConfigObs"].currentValue?.tableHeader !== changes["pluginConfigObs"].previousValue?.tableHeader){
      this.pageSize = TableGridComponent.APPOINTMENT_PAGE_SIZE;
      this.itemsPerPage = TableGridComponent.APPOINTMENT_PAGE_SIZE;
      this.getAppointments();
    }
    const prev = changes['pluginConfigObs'].previousValue;
    const curr = changes['pluginConfigObs'].currentValue;
    const prevType = prev?.filter?.filterType;
    const currType = curr?.filter?.filterType;
    if ( prevType !== currType) {
      this.resetDateForm(); // Reset only when type has changed
    }
  }

  /**
  * Reset the date for appointments(Today's,upcoming,pending appoinments)  g
  */
  resetDateForm() {
    if (this.filteredDateAndRangeForm) {
      this.filteredDateAndRangeForm.reset({
        date: null,
        startDate: null,
        endDate: null
      });
    }
    this.mode = 'date'; 
    if (this.searchElement && this.searchElement.nativeElement) {
      this.searchElement.nativeElement.value = "";
    }
    this.isFilterApplied = false;
    this.dataSource.filter = null;
  }

  /**
  * Retreive the chief complaints for the visit
  * @param {CustomVisitModel} visit - Visit
  * @return {string[]} - Chief complaints array
  */
  getCheifComplaint(visit: CustomVisitModel): string[] {
    let recent: string[] = [];
    const encounters = visit.encounters;
    encounters.forEach((encounter: CustomEncounterModel) => {
      const display = encounter.type?.name;
      if (display.match(visitTypes.ADULTINITIAL) !== null) {
        const obs = encounter.obs;
        obs.forEach((currentObs: CustomObsModel) => {
          if (currentObs.concept_id == TableGridComponent.CHIEF_COMPLAINT_CONCEPT_ID) {
            const currentComplaint = this.visitService.getData2(currentObs)?.value_text.replace(new RegExp('►', 'g'), '').split('<b>');
            for (let i = 1; i < currentComplaint.length; i++) {
              const obs1 = currentComplaint[i].split('<');
              if (!obs1[0].match(visitTypes.ASSOCIATED_SYMPTOMS)) {
                recent.push(obs1[0]);
              }
            }
          }
        });
      }
    });
    return recent;
  }

  /**
  * Check how old the date is from now
  * @param {string} data - Date in string format
  * @return {string} - Returns how old the date is from now
  */
  checkIfDateOldThanOneDay(data: string) {
    let hours = moment(data).diff(moment(), 'hours');
    let minutes = moment(data).diff(moment(), 'minutes');
    if(hours > 24) {
      return moment(data).format('DD MMM, YYYY hh:mm A');
    };
    if (hours < 1) {
      if(minutes < 0) return `Due : ${moment(data).format('DD MMM, YYYY hh:mm A')}`;
      return `${minutes} minutes`;
    }
    return `${hours} hrs`;
  }

  /**
  * Reschedule appointment
  * @param {AppointmentModel} appointment - Appointment to be rescheduled
  * @param {boolean} isValidationRequired - If true, validation is required
  * @return {void}
  */
  reschedule(appointment: AppointmentModel, isValidationRequired: boolean) {
    const len = appointment.visit.encounters.filter((e: CustomEncounterModel) => {
      return (e.type.name == visitTypes.PATIENT_EXIT_SURVEY || e.type.name == visitTypes.VISIT_COMPLETE);
    }).length;
    const isCompleted = Boolean(len);
    if (isCompleted) {
      this.toastr.error(this.translateService.instant("Visit is already completed, it can't be rescheduled."), this.translateService.instant('Rescheduling failed!'));
    } else if(appointment.visitStatus == 'Visit In Progress' && isValidationRequired) {
      this.toastr.error(this.translateService.instant("Visit is in progress, it can't be rescheduled."), this.translateService.instant('Rescheduling failed!'));
    } else {
      this.coreService.openRescheduleAppointmentModal(appointment).subscribe((res: RescheduleAppointmentModalResponseModel) => {
        if (res) {
          let newSlot = res;
          this.coreService.openRescheduleAppointmentConfirmModal({ appointment, newSlot }).subscribe((result: boolean) => {
            if (result) {
              appointment.appointmentId = appointment.id;
              appointment.slotDate = moment(newSlot.date, "YYYY-MM-DD").format('DD/MM/YYYY');
              appointment.slotTime = newSlot.slot;
              this.appointmentService.rescheduleAppointment(appointment).subscribe((res: ApiResponseModel) => {
                const message = res.message;
                if (res.status) {
                  this.mindmapService.notifyHwForRescheduleAppointment(appointment);
                  this.getAppointments();
                  this.toastr.success(this.translateService.instant("The appointment has been rescheduled successfully!"), this.translateService.instant('Rescheduling successful!'));
                } else {
                  this.toastr.success(message, this.translateService.instant('Rescheduling failed!'));
                }
              });
            }
          });
        }
      });
    }
  }

  /**
  * Cancel appointment
  * @param {AppointmentModel} appointment - Appointment to be rescheduled
  * @param {boolean} isValidationRequired - If true, validation is required
  * @return {void}
  */
  cancel(appointment: AppointmentModel, isValidationRequired: boolean) {
    if (appointment.visitStatus == 'Visit In Progress' && isValidationRequired) {
      this.toastr.error(this.translateService.instant("Visit is in progress, it can't be cancelled."), this.translateService.instant('Canceling failed!'));
      return;
    }
    this.coreService.openConfirmCancelAppointmentModal(appointment).subscribe((res: boolean) => {
      if (res) {
        this.toastr.success(this.translateService.instant('The Appointment has been successfully canceled.'),this.translateService.instant('Canceling successful'));
        this.getAppointments();
      }
    });
  }

  /**
  * Get user uuid from localstorage user
  * @return {string} - User uuid
  */
  get userId(): string {
    return getCacheData(true, doctorDetails.USER).uuid;
  }

  /**
  * Apply filter on a datasource
  * @param {Event} event - Input's change event
  * @return {void}
  */
  applyFilter(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.trim();
    this.isFilterApplied = this.searchTerm.length > 0;
    this.applyFilters();
  }

  // Call this once after loading appointments
  storeOriginalData(originalData?: any[]) {
    this.originalData = originalData? [...originalData]: [...this.dataSource]; // Backup full data
    this.applyFilters(); // Apply any existing filters
  }
  /**
  * Clear filter from current page data
  * @return {void}
  */
  clearFilter(): void {
    this.searchTerm = '';
    this.currentDateFilter = null;
    this.isFilterApplied = false;
    this.isFilterActive = false;
    this.filteredTotalCount = 0;
    this.paginationDisabled = false;
    
    if (this.searchElement?.nativeElement) {
      this.searchElement.nativeElement.value = "";
    }
    
    this.filteredDateAndRangeForm.reset({
      date: null,
      startDate: null,
      endDate: null
    });
    
    this.mode = 'date';
    this.restoreCurrentPageData();
    this.updatePaginatorLength();
  }

  /**
   * Checks if the field is in patient registration fields
   * @param {string} fieldName - The field name
   * @return {boolean} - True if present, else false
   */
  checkPatientRegField(fieldName: string): boolean {
    return this.patientRegFields.indexOf(fieldName) !== -1;
  }

  /**
  * Returns the WhatsApp link for a given telephone number
  * @param {string} telephoneNumber - The telephone number to generate the link for
  * @return {string} - The WhatsApp link
  */
  getWhatsAppLink(telephoneNumber: string): string {
    return this.visitService.getWhatsappLink(telephoneNumber);
  }
  
  /**
   * Retrieves the telephone number from the person's attributes
   * @param {AppointmentModel['visit']['person']} person - The person object containing attributes
   * @return {string | undefined} - The person's telephone number or undefined if not found
   */
  getTelephoneNumber(person: AppointmentModel['visit']['person']) {
    return person?.person_attribute.find((v: { person_attribute_type_id: number; }) => v.person_attribute_type_id == TableGridComponent.TELEPHONE_ATTRIBUTE_ID)?.value;
  }


  /**
   * Closes the menu if it's open
   */
  closeMenu() {
    if (this.menuTrigger) {
      this.menuTrigger.closeMenu();
    }
  }


  /**
   * Sets the mode for the component (either 'date' or 'range')
   * @param {'date' | 'range'} mode - The mode to set
   */
  setMode(mode: 'date' | 'range') {
    this.mode = mode;
    // Clear error messages when switching modes
    this.dateErrorMessage = '';
    this.startDateErrorMessage = '';
    this.endDateErrorMessage = '';
  }


  /**
   * Formats a date into 'YYYY-MM-DD' format
   * @param {any} date - The date to format
   * @return {string} - The formatted date
   */
  formatDate(date: any): string {
    const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  /**
   * Converts a relative time string (e.g., "2 hours", "1 day") to a date string
   * @param {string} relativeTime - The relative time string
   * @return {string} - The resulting date in 'YYYY-MM-DD' format
   * @throws {Error} - Throws error for invalid time units
   */
  convertToDate(relativeTime: string): string {
    const now = new Date();
    const [value, unit] = relativeTime.split(' ');
    const amount = parseInt(value, 10);    
    
    if (['hour', 'hours'].includes(unit.toLowerCase())) now.setHours(now.getHours() - amount);
    else if (['minute', 'minutes'].includes(unit.toLowerCase())) now.setMinutes(now.getMinutes() - amount);
    else if (['day', 'days'].includes(unit.toLowerCase())) now.setDate(now.getDate() - amount);
    else throw new Error('Invalid time unit. Only "hours", "minutes", or "days" are supported.');

    return now.toISOString().split('T')[0];
  }

  /**
   * Converts a follow-up date string to ISO format
   * @param {string} followUp - The follow-up date string
   * @return {string} - The follow-up date in ISO string format
   */
  convertToISO(followUp: string): string {
    const date = new Date(followUp);
    date.setDate(date.getDate());
    return date.toISOString();
  }
  
  /**
   * Applies date or range filter to the data source based on selected date(s)
   * @param {string} dateField - The field name for the date to filter
   */
  applyDateOrRangeFilter(dateField: string) {
    const selectedDate = this.filteredDateAndRangeForm.get('date')?.value;
    const startDate = this.filteredDateAndRangeForm.get('startDate')?.value;
    const endDate = this.filteredDateAndRangeForm.get('endDate')?.value;

    // Clear previous error messages
    this.dateErrorMessage = '';
    this.startDateErrorMessage = '';
    this.endDateErrorMessage = '';

    // Validation for date mode
    if (this.mode === 'date' && !selectedDate) {
      this.dateErrorMessage = this.translateService.instant('Please select a date');
      return;
    }

    // Validation for range mode
    if (this.mode === 'range') {
      let hasError = false;

      if (!startDate) {
        this.startDateErrorMessage = this.translateService.instant('Please select start date');
        hasError = true;
      }
      if (!endDate) {
        this.endDateErrorMessage = this.translateService.instant('Please select end date');
        hasError = true;
      }

      if (hasError) {
        return;
      }
    }

    if (selectedDate) {
      const formattedDate = this.formatDate(selectedDate);
      this.dateFilter = this.formatDate(selectedDate);
      this.currentDateFilter = {
        dateField,
        filterValue: formattedDate,
        isRange: false
      };
    } else if (startDate && endDate) {
      const formattedStartDate = this.formatDate(startDate);
      const formattedEndDate = this.formatDate(endDate);
      this.dateFilter = `${this.formatDate(startDate)}:${this.formatDate(endDate)}`;
      this.currentDateFilter = {
        dateField,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        isRange: true
      };
    } else {
      this.dateFilter = '';
      this.currentDateFilter = null;
    }

    this.dateField = dateField;
    this.applyFilters();
    this.closeMenu();
  }

  /**
   * Resets the date filter form and clears the data source filter
   * @param {boolean} flag - If true, doesn't close the menu
   */
  resetDate(flag: boolean = false) {
    this.filteredDateAndRangeForm.reset();
    this.currentDateFilter = null;
    // Clear error messages
    this.dateErrorMessage = '';
    this.startDateErrorMessage = '';
    this.endDateErrorMessage = '';
    this.applyFilters();
    if (!flag) {
      this.closeMenu();
    }
  }


  /**
   * Retrieves a specific attribute data from the person's attributes
   * @param {any} data - The data object containing person attributes
   * @param {string} attributeName - The name of the attribute to retrieve
   * @return {Object | null} - The attribute name and value, or null if not found
   */
  getAttributeData(data: any, attributeName: string): { name: string; value: string } | null {
    if (Array.isArray(data.person_attribute)) {
      const attribute = data.person_attribute.find(
        (attr: any) => attr.person_attribute_type?.name === attributeName
      );
      if (attribute) {
        return {
          name: attribute.person_attribute_type.name,
          value: attribute.value
        };
      }
    }
    return null;
  }

  /**
  * Get booked appointments for a logged-in doctor in a current year
  * @return {void}
  */
  getAppointments(): void {
    this.ngxLoader.startLoader('table-loader-' + this.pluginConfigObs.pluginConfigObsFlag); // Start section loader
    this.appointments = [];
    let fromDate = moment().startOf('year').format('DD/MM/YYYY');
    let toDate = moment().endOf('year').format('DD/MM/YYYY');
    let pending_visits = this.pluginConfigObs.filter?.hasOwnProperty("pending_visits")  ? this.pluginConfigObs.filter?.pending_visits : null;
    if(this.pluginConfigObs?.filter){
      fromDate = this.pluginConfigObs?.filter?.fromDate
      toDate = this.pluginConfigObs?.filter?.toDate
    }
    this.appointmentService.getUserSlots(getCacheData(true, doctorDetails.USER).uuid, fromDate, toDate, this.isMCCUser ? this.specialization : null, pending_visits)
      .subscribe({
        next: (res: ApiResponseModel) => {        
          this.totalRecords = (res.data?.length > 1) ? res.data?.length - 1 : res.data?.length || 0;
          this.emitVisitsCount(this.totalRecords);
          let appointmentsdata = res.data;
          appointmentsdata.forEach((appointment: AppointmentModel) => {
            if (appointment.status == 'booked' && (appointment.visitStatus == 'Awaiting Consult'||appointment.visitStatus == 'Visit In Progress')) {
              if (appointment.visit) {
                appointment.cheif_complaint = this.getCheifComplaint(appointment.visit);
                appointment.starts_in = checkIfDateOldThanOneDay(appointment.slotJsDate);
                appointment.telephone = this.getTelephoneNumber(appointment?.visit?.person);
                appointment.TMH_patient_id = this.getAttributeData(appointment.visit, "TMH Case Number")?.value;
                appointment.uuid = appointment.visitUuid;
                appointment.location = appointment?.visit?.location?.name;
                appointment.age = appointment?.patientAge + ' ' + this.translateService.instant('y');
                this.appointments.push(appointment);
              }
            }
          });
          this.dataSource = [...this.appointments];
          this.storeOriginalData();
        },
        complete: () => {
          this.ngxLoader.stopLoader('table-loader-' + this.pluginConfigObs.pluginConfigObsFlag); // Stop section loader
          // Scroll to top after data is loaded
          this.scrollToTop();
        }
    });
  }
  
  /**
  * Get doctor speciality
  * @param {ProviderAttributeModel[]} attr - Array of provider attributes
  * @return {string} - Doctor speciality
  */
  getSpecialization(attr: ProviderAttributeModel[]): string {
    let specialization = '';
    attr.forEach((a: ProviderAttributeModel) => {
      if (a.attributeType.uuid == TableGridComponent.SPECIALIZATION_UUID && !a.voided) {
        specialization = a.value;
      }
    });
    return specialization;
  }

  /**
  * Returns the age in years from the birthdate
  * @param {string} birthdate - Date in string format
  * @return {number} - Age
  */
  calculateAge(birthdate: string): number {
    return moment().diff(birthdate, 'years');
  }

  /**
  * Returns the created time in words from the date
  * @param {string} data - Date
  * @return {string} - Created time in words from the date
  */
  getCreatedAt(data: string): string {
    let hours = moment().diff(moment(data), 'hours');
    let minutes = moment().diff(moment(data), 'minutes');
    if (hours > 24) {
      return moment(data).format('DD MMM, YYYY');
    };
    if (hours < 1) {
      return `${minutes} ${this.translateService.instant("Minutes ago")}`;
    }
    return `${hours} ${this.translateService.instant("Hours ago")}`;
  }
  
  /**
  * Get encounter datetime for a given encounter type
  * @param {CustomVisitModel} visit - Visit
  * @param {string} encounterName - Encounter type
  * @return {string} - Encounter datetime
  */
  getEncounterCreated(visit: CustomVisitModel, encounterName: string): string {
    let created_at = '';
    const encounters = visit.encounters;
    encounters.forEach((encounter: CustomEncounterModel) => {
      const display = encounter.type?.name;
      if (display.match(encounterName) !== null) {
        created_at = this.getCreatedAt(encounter.encounter_datetime.replace('Z','+0530'));
      }
    });
    return created_at;
  }

  /**
   * Determines if the encounter is a follow-up or new visit
   * @param {any} enc - Encounter data
   * @return {string} - 'FOLLOW_UP' or 'NEW'
   */
  getDemarcation(enc: any): string {
    let isFollowUp = false;
    const adlIntl = enc?.find?.(e => e?.type?.name === visitTypes.ADULTINITIAL);
    if (Array.isArray(adlIntl?.obs)) {
      adlIntl?.obs.forEach(obs => {
        if (!isFollowUp)
          isFollowUp = obs?.value_text?.toLowerCase?.()?.includes?.("follow up");
      });
    }
    return isFollowUp ? visitTypes.FOLLOW_UP : visitTypes.NEW;
  }

  /**
  * Get awaiting visits for a given page number
  * @param {number} page - Page number
  * @return {void}
  */
  getAwaitingVisits(page: number = 1): void {
    this.loadVisitData(page, this.awaitingVisits, this.visitService.getAwaitingVisits);
  }

  /**
  * Get inprogress visits for a given page number
  * @param {number} page - Page number
  * @return {void}
  */
  getInProgressVisits(page: number = 1): void {
    this.loadVisitData(
      page, 
      this.inProgressVisits, 
      this.visitService.getInProgressVisits,
      visitTypes.VISIT_NOTE,
      this.sortInProgressVisits.bind(this)
    );
  }

  /**
  * Get priority visits for a given page number
  * @param {number} page - Page number
  * @return {void}
  */
  getPriorityVisits(page: number = 1): void {
    this.loadVisitData(page, this.priorityVisits, this.visitService.getPriorityVisits, visitTypes.FLAGGED);
  }

  /**
   * Get completed visits count
   * @return {void}
   */
  getCompletedVisits(page: number = 1): void {
    this.loadVisitData(page, this.completedVisits, this.visitService.getEndedVisits, visitTypes.COMPLETED_VISIT);
  }

  /**
  * Get follow-up visits for a logged-in doctor
  * @return {void}
  */
  getFollowUpVisit(page: number = 1): void {
    this.ngxLoader.startLoader('table-loader-' + this.pluginConfigObs.pluginConfigObsFlag);
    
    if (page === 1) {
      this.followUpVisits.length = 0;
      this.recordsFetched = 0;
    }
    
    this.visitService.getFollowUpVisits(this.specialization, page).subscribe({
      next: (res: ApiResponseModel) => {
        if (res.success) {
          this.totalRecords = res.totalCount;
          this.recordsFetched += this.pageSize;
          this.emitVisitsCount(this.totalRecords);
          
          const processedVisits = res.data
            .map(visit => this.processFollowUpVisitData(visit))
            .filter(visit => visit !== null);
          
          this.followUpVisits.push(...processedVisits);
          this.updateDataSources(this.followUpVisits, processedVisits);
        }
      },
      complete: () => {
        this.ngxLoader.stopLoader('table-loader-' + this.pluginConfigObs.pluginConfigObsFlag);
        this.scrollToTop();
      }
    });
  }

  /**
  * Get encounter datetime for a given encounter type
  * @param {CustomVisitModel} visit - Visit
  * @param {string} encounterName - Encounter type
  * @return {string} - Encounter datetime
  */
  getEncounterObs(encounters: CustomEncounterModel[], encounterName: string, conceptId: number) {
    let obs: CustomObsModel;
    encounters.forEach((encounter: CustomEncounterModel) => {
      if (encounter.type?.name === encounterName) {
        obs = encounter?.obs?.find((o: CustomObsModel) => o.concept_id == conceptId);
      }
    });
    return obs;
  }
  
  /**
   * Renders HTML content for a column, sanitized for security
   * @param {any} column - Column definition
   * @param {any} element - Data element to render
   * @return {SafeHtml | string} - Formatted HTML or element value
   */
  renderHtmlContent(column: any, element: any): import('@angular/platform-browser').SafeHtml | string {
    return column.formatHtml && typeof column.formatHtml === 'function' ? this.sanitizer.bypassSecurityTrustHtml(column.formatHtml(element)) : element[column.key];
  }
    
  /**
   * Returns a string of CSS classes for the column
   * @param {any} column - Column definition
   * @return {string} - Space-separated class names
   */
  getClasses(column: any, element: any): string {
    let classList = [];

    // If column has a static classList (array or string), add it
    if (column.classList) {
      classList = typeof column.classList === "function" ? column.classList(element) : column.classList;
    }

    return classList.join(" ");
  }



  /**
   * Formats the follow-up date by cleaning up time details
   * @param {string} value - Follow-up date string
   * @return {string} - Formatted date
   */
  processFollowUpDate(value: string): string {
    if(this.isBrandName === "NAS") {
      return value ? value.split(',').length > 1 ? `${value.split(',')[0]}` : value : '';
    }
    return value ? value.split(',').length > 1 ? `${value.split(',')[0]} ${value.split(',')[1].replace("Time:", "")}` : value : '';
  };

  /**
   * Executes the action based on its label (Reschedule or Cancel)
   * @param {any} action - Action object
   * @param {any} element - Element to perform the action on
   */
  handleAction(action: any, element: any) {
    const isValidationRequired = action.validationRequired !== undefined ? action.validationRequired : true;
    
    if (action.label === 'Reschedule') {
      this.reschedule(element, isValidationRequired);
    } else if (action.label === 'Cancel') {
      this.cancel(element, isValidationRequired);
    }
  }

  /**
   * Opens a WhatsApp chat with the given phone number
   * @param {MouseEvent} event - The click event to prevent row navigation
   * @param {string} telephone - Phone number for WhatsApp
   */
  openWhatsApp(event: MouseEvent, telephone: string): void {
    event.stopPropagation(); // Prevent row navigation
    const whatsappLink = `https://wa.me/${telephone}`;
    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
  }

  /**
   * Emits the visits count data with the given table tag name and count
   * @param {number} visitsCount - The total visits count for the specific table
   */
  emitVisitsCount(visitsCount: number): void {
    const visitsCountData = {
      tableTagName: this.pluginConfigObs.pluginConfigObsFlag,
      visitsCount: visitsCount
    };
    this.visitsCountDate.emit(visitsCountData);
  }


  public getData(event?:PageEvent){
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.itemsPerPage = event.pageSize;
    
    // If filters are active, disable pagination and don't make API calls
    if (this.isFilterActive || this.paginationDisabled) {
      this.scrollToTop();
      return event;
    }
    
    const requiredRecords = (this.pageIndex + 1) * this.pageSize;
    
    // Check if we need to fetch more data from API
    if (requiredRecords > this.recordsFetched) {
      this.fetchMoreData();
    } else {
      // Data is already present, handle client-side pagination
      this.handleClientSidePagination();
    }
    
    // Scroll to top when pagination changes
    this.scrollToTop();
    
    return event;
  }

  /**
   * Fetch more data from API based on current plugin type
   */
  private fetchMoreData(): void {
    const nextPage = (this.recordsFetched + this.pageSize) / this.pageSize;
    
    switch(this.pluginConfigObs?.pluginConfigObsFlag) {
      case "Awaiting":
        this.getAwaitingVisits(nextPage);
        break;
      case "Priority":
        this.getPriorityVisits(nextPage);
        break;
      case "InProgress":
        this.getInProgressVisits(nextPage);
        break;
      case "Completed":
        this.getCompletedVisits(nextPage);
        break;
      case "FollowUp":
        this.getFollowUpVisit(nextPage);
        break;
    }
  }

  /**
   * Handle client-side pagination for already loaded data
   */
  private handleClientSidePagination() {
    // Ensure filteredDataSource has all the data from originalData
    if (this.filteredDataSource.length < this.originalData.length) {
      this.filteredDataSource = [...this.originalData];
    }
    
    // Apply pagination to the filtered data
    this.applyPagination(); 
    
    // Update paginator length to show correct total
    if (this.tempPaginator) {
      this.tempPaginator.length = this.totalRecords;
    }
  }

  /**
   * Handle sorting for current page data only
   * @param {string} column - Column to sort by
   * @param {string} direction - Sort direction ('asc' or 'desc')
   */
  handleSort(column: string, direction: string): void {
    if (!column || !direction) return;
    
    // Sort only the current page data
    this.paginatedDataSource.sort((a: any, b: any) => {
      let aValue = this.getSortValue(a, column);
      let bValue = this.getSortValue(b, column);
      
      // Convert to string for comparison if needed
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      return direction === 'asc' 
        ? (aValue < bValue ? -1 : aValue > bValue ? 1 : 0)
        : (aValue > bValue ? -1 : aValue < bValue ? 1 : 0);
    });
  }

  /**
   * Get sort value for an item based on column
   */
  private getSortValue(item: any, column: string): any {
    if (column === 'patient_name') {
      return (item.patient_name?.given_name || '') + ' ' + (item.patient_name?.family_name || '');
    }
    return item[column];
  }

  /**
   * Process visit data with common fields
   */
  private processVisitData(visit: any, encounterType?: string): any {
    visit.cheif_complaint = this.getCheifComplaint(visit);
    visit.visit_created = visit?.date_created 
      ? this.getCreatedAt(visit.date_created.replace('Z','+0530')) 
      : this.getEncounterCreated(visit, encounterType || visitTypes.ADULTINITIAL);
    visit.person.age = this.calculateAge(visit.person.birthdate);
    visit.location = visit?.location?.name;
    visit.age = visit?.person?.age + ' ' + this.translateService.instant('y');
    
    // Add specific fields based on visit type
    if (encounterType === visitTypes.VISIT_NOTE) {
      visit.prescription_started = this.getEncounterCreated(visit, visitTypes.VISIT_NOTE);
    }
    if (encounterType === visitTypes.COMPLETED_VISIT) {
      visit.completed = visit?.date_created 
        ? this.getCreatedAt(visit.date_created.replace('Z', '+0530')) 
        : this.getEncounterCreated(visit, visitTypes.VISIT_COMPLETE);
    }
    if (encounterType === visitTypes.FLAGGED) {
      visit.visit_created = visit?.date_created 
        ? this.getCreatedAt(visit.date_created.replace('Z','+0530')) 
        : this.getEncounterCreated(visit, visitTypes.FLAGGED);
    }
    
    // Add common fields
    visit.TMH_patient_id = this.getAttributeData(visit, "TMH Case Number")?.value;
    visit.patient_type = this.getDemarcation(visit?.encounters);
    
    return visit;
  }

  /**
   * Generic data loading method
   */
  private loadVisitData(
    page: number, 
    visitArray: any[], 
    serviceMethod: (specialization: string, page: number) => any,
    encounterType?: string,
    customSorting?: (visits: any[]) => any[]
  ): void {
    this.ngxLoader.startLoader('table-loader-' + this.pluginConfigObs.pluginConfigObsFlag);
    
    if (page === 1) {
      visitArray.length = 0; // Clear array efficiently
      this.recordsFetched = 0;
    }
    
    serviceMethod.call(this.visitService, this.specialization, page).subscribe({
      next: (res: ApiResponseModel) => {
        if (res.success) {
          this.totalRecords = res.totalCount;
          this.recordsFetched += this.pageSize;
          this.emitVisitsCount(this.totalRecords);
          
          const processedVisits = res.data.map(visit => this.processVisitData(visit, encounterType));
          
          // Apply custom sorting if provided
          const sortedVisits = customSorting ? customSorting(processedVisits) : processedVisits;
          
          // Add to visit array
          visitArray.push(...sortedVisits);
          
          // Update data sources
          this.updateDataSources(visitArray, sortedVisits);
        }
      },
      complete: () => {
        this.ngxLoader.stopLoader('table-loader-' + this.pluginConfigObs.pluginConfigObsFlag);
        this.scrollToTop();
      }
    });
  }

  /**
   * Update all data sources with new data
   */
  private updateDataSources(visitArray: any[], sortedVisits?: any[]): void {
    this.dataSource = sortedVisits ? [...sortedVisits] : [...visitArray];
    this.originalData = [...visitArray];
    this.filteredDataSource = [...visitArray];
    this.applyPagination();
  }

  /**
   * Custom sorting for in-progress visits by prescription time
   */
  private sortInProgressVisits(visits: any[]): any[] {
    return visits.sort((a, b) => {
      const parseTime = (value: string) => {
        if (value.includes("minutes ago")) {
          return { type: "minutes", time: parseInt(value) };
        }
        if (value.includes("Hours ago")) {
          return { type: "hours", time: parseInt(value) * 60 };
        }
        return { type: "date", time: moment(value, "DD MMM, YYYY").valueOf() };
      };

      const visitA = parseTime(a.prescription_started);
      const visitB = parseTime(b.prescription_started);
      
      // Sort minutes first (ascending)
      if (visitA.type === "minutes" && visitB.type === "minutes") {
        return visitA.time - visitB.time;
      }
      // Sort hours first (ascending)
      if (visitA.type === "hours" && visitB.type === "hours") {
        return visitA.time - visitB.time;
      }
      // Sort dates (descending)
      if (visitA.type === "date" && visitB.type === "date") {
        return visitB.time - visitA.time;
      }
      // Prioritize minutes over hours, and hours over dates
      if (visitA.type === "minutes") return -1;
      if (visitB.type === "minutes") return 1;
      if (visitA.type === "hours") return -1;
      if (visitB.type === "hours") return 1;

      return 0;
    });
  }

  /**
   * Process follow-up visit data with special handling
   */
  private processFollowUpVisitData(visit: any): any {
    if (!visit?.encounters?.length) return null;
    
    visit.cheif_complaint = this.getCheifComplaint(visit);
    visit.visit_created = visit?.date_created 
      ? this.getCreatedAt(visit.date_created.replace('Z', '+0530')) 
      : this.getEncounterCreated(visit, visitTypes.COMPLETED_VISIT);
    visit.person.age = this.calculateAge(visit.person.birthdate);
    visit.completed = this.getEncounterCreated(visit, visitTypes.VISIT_COMPLETE);
    visit.followUp = this.processFollowUpDate(
      this.getEncounterObs(visit.encounters, visitTypes.VISIT_NOTE, TableGridComponent.FOLLOW_UP_CONCEPT_ID)?.value_text
    );
    visit.location = visit?.location?.name;
    visit.age = visit?.person?.age + ' ' + this.translateService.instant('y');
    
    return visit;
  }

  /**
   * Scroll to top of the table container
   */
  private scrollToTop() {
    // Find the table container and scroll to top using unique component ID
    const tableContainer = document.querySelector('#table-container-' + this.componentId);
    if (tableContainer) {
      tableContainer.scrollTop = 0;
    }
  }

  /**
   * Add data-test-ids to datepicker calendar navigation buttons and date cells
   */
  addCalendarNavigationTestIds() {
    setTimeout(() => {
      // Add test IDs to navigation buttons
      const prevButton = document.querySelector('.mat-calendar-previous-button');
      const nextButton = document.querySelector('.mat-calendar-next-button');

      if (prevButton && !prevButton.getAttribute('data-test-id')) {
        prevButton.setAttribute('data-test-id', 'calendarNavPrevious');
      }

      if (nextButton && !nextButton.getAttribute('data-test-id')) {
        nextButton.setAttribute('data-test-id', 'calendarNavNext');
      }

      // Add test IDs to all date cells
      const dateCells = document.querySelectorAll('.mat-calendar-body-cell');
      dateCells.forEach((cell: Element) => {
        if (!cell.getAttribute('data-test-id')) {
          const dateButton = cell.querySelector('.mat-calendar-body-cell-content');
          if (dateButton) {
            const dateValue = dateButton.textContent?.trim();
            if (dateValue) {
              cell.setAttribute('data-test-id', `calendarDate-${dateValue}`);
            }
          }
        }
      });
    }, 0);
  }
}

