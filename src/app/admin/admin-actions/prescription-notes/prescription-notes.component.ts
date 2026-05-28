import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { PrescriptionNotesModel } from 'src/app/model/model';
import { ConfigService } from 'src/app/services/config.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';
import { PrescriptionNotesEditComponent } from 'src/app/modal-components/prescription-notes-edit/prescription-notes-edit.component';

@Component({
  selector: 'app-prescription-notes',
  templateUrl: './prescription-notes.component.html',
  styleUrls: ['./prescription-notes.component.scss'],
})
export class PrescriptionNotesComponent implements OnInit {
  displayedColumns: string[] = ['id', 'specialty', 'notes', 'platform', 'updatedAt', 'edit', 'is_enabled'];
  dataSource = new MatTableDataSource<PrescriptionNotesModel>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  data: PrescriptionNotesModel[] = [];
  sectionData: { id: number; key: string; name: string; is_enabled: boolean } | null = null;

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private toastr: ToastrService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: 'Admin Actions', imgUrl: 'assets/svgs/admin-actions.svg' });
    this.getPrescriptionNotes();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  get sectionEnabled(): boolean {
    return !!this.sectionData?.is_enabled;
  }

  getPrescriptionNotes(): void {
    this.configService.getPrescriptionNotes().subscribe((res) => {
      this.sectionData = res?.prescription_notes_section ?? null;
      this.data = res?.prescription_notes ?? [];
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.paginator = this.paginator;
    });
  }

  /**
   * Flip the section-level master toggle (mst_features.prescription_notes_section).
   */
  updateSectionStatus(id: number, status: boolean): void {
    this.configService.updateFeatureEnabledStatus(id, status).subscribe(
      () => {
        this.toastr.success(
          this.translateService.instant('Prescription Notes section updated.'),
          this.translateService.instant('Update successful!'),
        );
        this.getPrescriptionNotes();
      },
      () => {
        this.getPrescriptionNotes();
      },
    );
  }

  /**
   * Toggle the per-specialty is_enabled flag.
   */
  updateStatus(id: number, status: boolean): void {
    this.configService.updatePrescriptionNoteEnabledStatus(id, status).subscribe(
      () => {
        this.toastr.success(
          this.translateService.instant('Prescription notes status updated.'),
          this.translateService.instant('Update successful!'),
        );
        this.getPrescriptionNotes();
      },
      () => {
        this.getPrescriptionNotes();
      },
    );
  }

  /**
   * Open the edit dialog to replace the specialty's notes array.
   */
  openEdit(row: PrescriptionNotesModel): void {
    const dialogRef = this.dialog.open(PrescriptionNotesEditComponent, {
      panelClass: 'modal-md',
      hasBackdrop: true,
      disableClose: true,
      data: {
        id: row.id,
        specialty: row.specialty,
        notes: [...(row.notes || [])],
      },
    });

    dialogRef.componentInstance.onSubmit.subscribe((notes: string[]) => {
      this.configService.updatePrescriptionNotesContent(row.id, notes).subscribe(
        () => {
          dialogRef.close();
          this.toastr.success(
            this.translateService.instant('Prescription notes updated.'),
            this.translateService.instant('Update successful!'),
          );
          this.getPrescriptionNotes();
        },
        (err) => {
          dialogRef.close();
          this.toastr.error(err?.error?.error?.message || err?.message || 'Unable to update notes');
        },
      );
    });
  }

  /**
   * Short preview of the first note for the table cell.
   */
  notesPreview(notes: string[] | undefined): string {
    if (!notes || !notes.length) return '';
    const first = notes[0];
    const more = notes.length - 1;
    const trimmed = first.length > 80 ? `${first.slice(0, 80)}…` : first;
    return more > 0 ? `${trimmed}  (+${more} more)` : trimmed;
  }

  onPublish(): void {
    this.configService.publishConfig().subscribe(() => {
      this.toastr.success(
        this.translateService.instant('Prescription notes changes published successfully!'),
        this.translateService.instant('Changes published!'),
      );
    });
  }
}
