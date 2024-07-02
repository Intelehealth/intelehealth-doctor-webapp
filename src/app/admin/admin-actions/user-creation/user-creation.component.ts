import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { RolesModel, UserModel } from 'src/app/model/model';
import { AuthService } from 'src/app/services/auth.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-user-creation',
  templateUrl: './user-creation.component.html',
  styleUrls: ['./user-creation.component.scss']
})
export class UserCreationComponent {
  displayedColumns : string[] = ['id', 'person_name', 'dateCreated', 'role', 'username', 'edit', 'delete'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  usersData : UserModel[];
  @ViewChild('searchInput', { static: true }) searchElement: ElementRef;

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.dataSource.filterPredicate = (data, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat((data?.patient_name.middle_name? ' ' + data?.patient_name.middle_name : '') + ' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
    this.getUsers();
  }

  /**
  * Get doctor specialities.
  * @return {void}
  */
  getUsers(): void {
    this.authService.getUsers().subscribe(res=>{
      this.usersData = res.data.filter(e=>e.roles.length <= 2 && e.roles.filter(r=>["Organizational: Doctor","Organizational: Nurse"].includes(r.display)).length).map((obj:any)=>{
        obj.person_name = obj.person.display + ( obj.person.gender ? " (" + obj.person.gender + ")" : "" );
        obj.role = this.getRole(obj.roles);
        return obj;
      });
      this.dataSource = new MatTableDataSource(this.usersData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
  * Add User
  * @return {void}
  */
  addUser(): void {
    this.router.navigate(["admin/actions/user-creation/add"]);
  }

  /**
  * Clear filter from a given datasource
  * @return {void}
  */
  clearFilter() {
    this.dataSource.filter = null;
    this.searchElement.nativeElement.value = "";
  }

  
  /**
  * Clear filter from a datasource 2
  * @return {void}
  */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.paginator.firstPage();
  }

  getRole(roles: RolesModel[]): string{
    return roles.filter(r=>r.display.includes("Doctor")).length ? "Doctor" : "HW";
  }
}
