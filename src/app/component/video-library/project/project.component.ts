import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {

  displayColumns: any[] = [
    {
      title: 'Test1',
      key: 'id'
    }
  ];
  dataSource: any;
  constructor() { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource([
      {
        "id": 251,
        "name": "famHist.json",
        "keyName": "afiekaltest2021",
        "createdAt": "2022-07-27T13:29:10.000Z",
        "updatedAt": "2022-07-27T13:29:10.000Z"
      },
      {
        "id": 252,
        "name": "patHist.json",
        "keyName": "afiekaltest2021",
        "createdAt": "2022-07-27T13:29:18.000Z",
        "updatedAt": "2022-07-27T13:29:18.000Z"
      },
    ])
  }

}
