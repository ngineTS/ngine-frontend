import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { TableViz } from '../../models/content-management.interface';
import { ContentManagementFormComponent } from './content-management-form/content-management-form.component';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { of, retry, switchMap, take } from 'rxjs';
import { SnackBarService } from '../../services/snackbar.service';
import { NavigationBaseComponent } from '../navigation-base/navigation-base.component';

@Component({
  selector: 'app-content-management',
  imports: [GenericTableComponent],
  templateUrl: './content-management.component.html',
  styleUrl: './content-management.component.scss'
})
export class ContentManagementComponent extends NavigationBaseComponent implements OnInit {

  constructor(private _http: HttpClient,
              private _snackbarService: SnackBarService) { 
                super(); 
              }
  
  content!: Array<object> | null; //the content reprensenting the table sample
  tableConfig!: TableViz; //the table and columns/inputs configuration 

  ngOnInit() {
    this.getContentInformation();
  }

  /**
   * Get table configuration and content for given navigation and set 'content' and 'tableViz' prop accordingly.
   * If no configuration exist then open configuration form to create new table.
   * Else return table content by calling GET custom-table table API.
   */
  getContentInformation() {
    this._http.get<TableViz>(`${environment.APIURL}table-viz/navigation/${this._navigation.id}`)
      .pipe(
        retry(2),
        take(1),
        switchMap(tableViz => {
          if (!tableViz) {
            const dialogRef = this._matDialog.open(ContentManagementFormComponent,
              { 
                maxWidth: '700px',
                disableClose: true,
                data: { navigationId: this._navigation.id } 
              }
            );
            dialogRef.afterClosed().subscribe(resp => {
              if(resp) {
                this._snackbarService.showSuccessSnackBar(resp);
                this.getContentInformation();
              }
            })
            return of(null);
          }
          else {
            this.tableConfig = tableViz;
            return this._http.get<Array<object>>(`${environment.APIURL}custom-table/table/${tableViz.tableName}`)
              .pipe(
                retry(2),
                take(1)
              )
          }
        })
      )
      .subscribe(resp => this.content = resp);
  }

  /**
   * Get new contet value when child (generic table) emits Output event after content modification.
   */
  onContentChange() {
    this.getContentInformation();
  }

}
