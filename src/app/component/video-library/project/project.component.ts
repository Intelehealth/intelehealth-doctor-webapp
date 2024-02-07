import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { videoLibrary } from "src/app/services/video-library.service";
import { ModalsComponent } from "../../ayu/modals/modals.component";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-project",
  templateUrl: "./project.component.html",
  styleUrls: ["./project.component.scss"],
})
export class ProjectComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayColumns: string[] = [
    "id",
    "name",
    "packageId",
    "lastUpdate",
    "action",
    "manage-video",
  ];
  dataSource: any;

  constructor(
    private videoLibararySvc: videoLibrary,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getAllProjects();
  }

  getAllProjects() {
    this.videoLibararySvc.getAllProjects().subscribe({
      next: (res: any) => {
        this.dataSource = new MatTableDataSource(res.data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
    });
  }

  addProject(): void {
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: { title: "Add Project" },
      width: "40%",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const payload = {
          name: result?.Name,
          packageId: result?.ProjectId,
        };

        this.videoLibararySvc.creatProject(payload).subscribe({
          next: () => {
            this.snackbar.open("project added successfully", null, {
              duration: 2500,
            });
            this.getAllProjects();
          },
        });
      }
    });
  }

  updateProject(id) {
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: { title: "Update Project" },
      width: "40%",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const payload = {
          name: result?.Name,
          packageId: result?.ProjectId,
        };
        this.videoLibararySvc.updateProject(payload, id).subscribe({
          next: () => {
            this.snackbar.open("Project updated successfully", null, {
              duration: 2500,
            });
            this.getAllProjects();
          },
        });
      }
    });
  }

  delete(id): void {
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: { title: "Delete Project" },
      width: "250px",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.videoLibararySvc.deleteProject(id).subscribe({
          next: (res) => {
            if (res) {
              this.snackbar.open("Project deleted successfully", null, {
                duration: 2500,
              });
              this.getAllProjects();
            }
          },
        });
      }
      this.getAllProjects();
    });
    this.getAllProjects();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
