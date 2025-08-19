import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { TableViz } from '../../models/content-management.interface';
import { Navigation } from '../../models/navigation.interface';
import { MatDialog } from '@angular/material/dialog';
import { ContentManagementFormComponent } from './content-management-form/content-management-form.component';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { of, retry, switchMap, take } from 'rxjs';

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
  content!: Array<object> | null; 

  ngOnInit() {
     /*this._http.get<TableViz>(`${environment.APIURL}table-viz/navigation/${this.navigation.id}`).subscribe(resp => {
      console.log(resp);
      //this._http.get(`${environment.APIURL}auto-generated-content/table/${resp.tableName}`).subscribe(result => console.log(result));
      if (!resp) {
        this._matDialog.open(ContentManagementFormComponent,
          {
            data: { navigationId: this.navigation.id }
          }
        );
      }
    })*/
   this.getContentInformation();
  }

  getContentInformation() {
    this._http.get<TableViz>(`${environment.APIURL}table-viz/navigation/${this.navigation.id}`)
      .pipe(
        retry(2),
        take(1),
        switchMap(tableViz => {
          if(!tableViz) {
            this._matDialog.open(ContentManagementFormComponent,
              { data: { navigationId: this.navigation.id } }
            );
            return of(null);
          }
          else {
            return this._http.get<Array<object>>(`${environment.APIURL}auto-generated-content/table/${tableViz.tableName}`)
              .pipe(take(1))
          }
        })
      )
      .subscribe(resp => {
        console.log(resp);
        this.content = resp;
      });
  }

}
