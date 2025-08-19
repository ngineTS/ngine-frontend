import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { TableViz } from '../../models/content-management.interface';
import { Navigation } from '../../models/navigation.interface';
import { MatDialog } from '@angular/material/dialog';
import { ContentManagementFormComponent } from './content-management-form/content-management-form.component';
import { FormArray } from '@angular/forms';
import { GenericTableComponent } from '../generic-table/generic-table.component';

@Component({
  selector: 'app-content-management',
  imports: [GenericTableComponent],
  templateUrl: './content-management.component.html',
  styleUrl: './content-management.component.scss'
})
export class ContentManagementComponent implements OnInit {

  constructor(private _http: HttpClient,
              private _matDialog: MatDialog) {}
  
  @Input() navigation!: Navigation;

  ngOnInit() {
     this._http.get<TableViz>(`${environment.APIURL}table-viz/navigation/${this.navigation.id}`).subscribe(resp => {
      console.log(resp);
      //this._http.get(`${environment.APIURL}auto-generated-content/table/${resp.tableName}`).subscribe(result => console.log(result));
      if (!resp) {
        this._matDialog.open(ContentManagementFormComponent,
          {
            data: { navigationId: this.navigation.id }
          }
        );
      }
     })
  }

}
