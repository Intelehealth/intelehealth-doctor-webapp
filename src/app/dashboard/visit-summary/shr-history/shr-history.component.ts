import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, Subscription, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ShrConcept, ShrFamilyHistoryItem, ShrHistoryFilters, ShrHistoryItem, ShrHistoryPatient, ShrHistoryResponse, ShrHistoryService } from 'src/app/services/shr-history.service';

@Component({
  selector: 'app-shr-history',
  templateUrl: './shr-history.component.html',
  styleUrls: ['./shr-history.component.scss']
})
export class ShrHistoryComponent implements OnInit, OnChanges, OnDestroy {
  @Input() patientUuid: string;
  @Input() active = false;

  filterForm: FormGroup;
  recordTypes = [
    { value: 'Encounter', label: 'Encounter' },
    { value: 'Condition', label: 'Condition' },
    { value: 'MedicationRequest', label: 'MedicationRequest' },
    { value: 'Observation', label: 'Observation' },
    { value: 'DocumentReference', label: 'DocumentReference' },
    { value: 'FamilyMemberHistory', label: 'FamilyMemberHistory' },
    { value: 'ServiceRequest', label: 'ServiceRequest' }
  ];
  limitOptions = [10, 25, 50];
  statusList = [
    { value: 'all', label: 'All statuses' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'final', label: 'Final' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'provisional', label: 'Provisional' },
    { value: 'current', label: 'Current' }
  ];
  conceptSuggestions: ShrConcept[] = [];
  selectedConcept: ShrConcept;
  records: ShrHistoryItem[] = [];
  nextUrl: string;
  previousUrl: string;
  totalCount = 0;
  currentPage = 1;
  pageSize = 3;
  loading = false;
  downloading = false;
  patientNotFound = false;
  patient: ShrHistoryPatient;
  errorMessage = '';
  private conceptSearch$ = new Subject<string>();
  private subscriptions = new Subscription();
  private lastFilters: ShrHistoryFilters;
  private hasLoaded = false;

  constructor(private shrHistoryService: ShrHistoryService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    const defaultFilters = this.shrHistoryService.getDefaultFilters();
    this.lastFilters = defaultFilters;
    this.filterForm = new FormGroup({
      fromDate: new FormControl(defaultFilters.fromDate),
      toDate: new FormControl(defaultFilters.toDate),
      recordTypes: new FormControl(defaultFilters.recordTypes),
      status: new FormControl(defaultFilters.status),
      snomedText: new FormControl(''),
      sort: new FormControl(defaultFilters.sort),
      limit: new FormControl(defaultFilters.limit)
    });

    this.subscriptions.add(
      this.conceptSearch$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => term && term.length >= 2
          ? this.shrHistoryService.searchConcepts(term).pipe(catchError(() => of([])))
          : of([])
        )
      ).subscribe(results => {
        this.conceptSuggestions = results;
      })
    );

    if (this.active) {
      this.loadDefaultHistory();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.active && this.active && this.filterForm && !this.hasLoaded) {
      this.loadDefaultHistory();
      return;
    }

    if (changes.patientUuid && !changes.patientUuid.firstChange && this.filterForm && this.active) {
      this.loadDefaultHistory();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadDefaultHistory(): void {
    const defaultFilters = this.shrHistoryService.getDefaultFilters();
    this.filterForm?.patchValue(defaultFilters);
    this.selectedConcept = null;
    this.conceptSuggestions = [];
    this.lastFilters = defaultFilters;
    this.hasLoaded = true;
    this.fetchHistory();
  }

  search(): void {
    this.lastFilters = this.getFiltersFromForm();
    this.fetchHistory();
  }

  goToPage(url: string): void {
    if (!url) {
      return;
    }
    this.fetchHistory(url);
  }

  getPageCount(): number {
    return Math.max(Math.ceil(this.totalCount / this.pageSize), 1);
  }

  getRecordTypeClass(recordType: string): string {
    return `type-${(recordType || 'Encounter').toLowerCase()}`;
  }

  getRecordTypeLabel(recordType: string): string {
    return this.recordTypes.find(type => type.value === recordType)?.label || recordType;
  }

  getStatusClass(status: string): string {
    return `status-${status || 'final'}`;
  }

  getRecordsSummary(): string {
    return `${this.records.length} of ${this.totalCount} records`;
  }

  getSortSummary(): string {
    return this.lastFilters?.sort === 'oldest' ? 'Sorted by oldest' : 'Sorted by newest';
  }

  downloadAllRecords(): void {
    if (this.downloading || !this.patientUuid) {
      return;
    }

    this.downloading = true;
    const exportFilters = { ...this.lastFilters, limit: 50 };
    this.shrHistoryService.getHistory(this.patientUuid, exportFilters).subscribe(response => {
      this.shrHistoryService.downloadPdf(response.patient, response.results);
      this.downloading = false;
    }, () => {
      this.downloading = false;
    });
  }

  onRecordTypeChange(type: string, checked: boolean): void {
    const recordTypes = this.filterForm.get('recordTypes').value || [];
    const nextRecordTypes = checked
      ? Array.from(new Set([...recordTypes, type]))
      : recordTypes.filter(item => item !== type);

    this.filterForm.get('recordTypes').setValue(nextRecordTypes);
  }

  isRecordTypeSelected(type: string): boolean {
    return (this.filterForm?.get('recordTypes')?.value || []).includes(type);
  }

  onConceptSearch(term: string): void {
    this.selectedConcept = null;
    this.conceptSearch$.next(term);
  }

  selectConcept(concept: ShrConcept): void {
    this.selectedConcept = concept;
    this.filterForm.get('snomedText').setValue(`${concept.display} (${concept.code})`);
    this.conceptSuggestions = [];
  }

  clearConcept(): void {
    this.selectedConcept = null;
    this.filterForm.get('snomedText').setValue('');
    this.conceptSuggestions = [];
  }

  trackByRecordId(index: number, record: ShrHistoryItem): string {
    return record.id;
  }

  formatClinicalNote(note: string): SafeHtml {
    if (!note) { return this.sanitizer.bypassSecurityTrustHtml(''); }

    // Split on section markers (►)
    const sections = note.split(/(?=►)/).map(s => s.trim()).filter(Boolean);
    let html = '';

    sections.forEach(section => {
      // Extract section title and body
      const sectionMatch = section.match(/^►\s*(.+?)\s*[:\-]\s*(.*)$/s);
      if (sectionMatch) {
        const title = sectionMatch[1].trim();
        const body = sectionMatch[2].trim();
        html += `<div class="cn-section">`;
        html += `<span class="cn-section-title">${this.escapeHtml(title)}</span>`;
        if (body) {
          html += this.parseBullets(body);
        }
        html += `</div>`;
      } else {
        // No section header — just bullets or plain text
        const body = section.replace(/^►\s*/, '').trim();
        html += `<div class="cn-section">${this.parseBullets(body)}</div>`;
      }
    });

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private parseBullets(text: string): string {
    if (!text) { return ''; }
    // Split on bullet markers (•)
    const parts = text.split(/•/).map(p => p.trim()).filter(Boolean);
    if (!parts.length) { return `<p class="cn-plain">${this.escapeHtml(text)}</p>`; }
    let out = '<ul class="cn-bullets">';
    parts.forEach(part => {
      out += `<li>${this.escapeHtml(part)}</li>`;
    });
    out += '</ul>';
    return out;
  }

  private escapeHtml(text: string): string {
    return (text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private fetchHistory(pageUrl?: string): void {
    this.loading = true;
    this.patientNotFound = false;
    this.errorMessage = '';
    this.currentPage = this.getPageFromUrl(pageUrl);
    this.pageSize = Number(this.lastFilters?.limit) || 3;
    this.shrHistoryService.getHistory(this.patientUuid, this.lastFilters, pageUrl).subscribe((response: ShrHistoryResponse) => {
      this.records = response.results || [];
      this.nextUrl = response.next;
      this.previousUrl = response.previous;
      this.totalCount = response.count || 0;
      this.patient = response.patient;
      this.loading = false;
      this.patientNotFound = response.patient?.shrPatientFound === false;
    }, error => {
      this.loading = false;
      this.patientNotFound = error?.status === 404;
      this.errorMessage = this.getErrorMessage(error);
      this.records = [];
      this.nextUrl = null;
      this.previousUrl = null;
      this.totalCount = 0;
      this.patient = null;
    });
  }

  private getErrorMessage(error: any): string {
    if (error?.status === 401) {
      return 'Your OpenMRS session has expired. Sign in again to view SHR history.';
    }
    if (error?.status === 403) {
      return 'You do not have permission to view this patient\'s SHR history.';
    }
    if (error?.status === 404) {
      return '';
    }
    return error?.error?.message || 'SHR history could not be loaded. Please try again.';
  }

  private getPageFromUrl(url: string): number {
    const match = (url || '').match(/[?&]page=(\d+)/);
    return match ? Number(match[1]) : 1;
  }

  private getFiltersFromForm(): ShrHistoryFilters {
    const formValue = this.filterForm?.value || {};

    return {
      fromDate: formValue.fromDate,
      toDate: formValue.toDate,
      recordTypes: formValue.recordTypes || [],
      status: formValue.status,
      snomedCode: this.selectedConcept?.code,
      sort: formValue.sort,
      limit: Number(formValue.limit) || 10
    };
  }
}
