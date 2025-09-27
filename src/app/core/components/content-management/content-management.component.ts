import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { TableViz } from '../../models/content-management.interface';
import { Navigation } from '../../models/navigation.interface';
import { MatDialog } from '@angular/material/dialog';
import { ContentManagementFormComponent } from './content-management-form/content-management-form.component';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { of, retry, switchMap, take } from 'rxjs';
import { SnackBarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-content-management',
  imports: [GenericTableComponent],
  templateUrl: './content-management.component.html',
  styleUrl: './content-management.component.scss'
})
export class ContentManagementComponent implements OnInit {

  constructor(private _http: HttpClient,
              private _matDialog: MatDialog,
              private _snackbarService: SnackBarService) {}
  
  @Input() navigation!: Navigation; //the component instance navigation
  content!: Array<object> | null; //the content reprensenting the table sample
  tableConfig!: TableViz; //the table and columns/inputs configuration 

  ngOnInit() {
    this.getContentInformation();
  }

  /**
   * Get table and columns configuration for given navigation.
   * 
   * If no configuration exist then open configuration form to create new table.
   * 
   * Else return table content by calling auto-genereated table API.
   * 
   * @returns The table content of unknown type.
   */
  getContentInformation() {
    this._http.get<TableViz>(`${environment.APIURL}table-viz/navigation/${this.navigation.id}`)
      .pipe(
        retry(2),
        take(1),
        switchMap(tableViz => {
          if(!tableViz) {
            const dialogRef = this._matDialog.open(ContentManagementFormComponent,
              { 
                disableClose: true,
                data: { navigationId: this.navigation.id } 
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
            return this._http.get<Array<object>>(`${environment.APIURL}auto-generated-content/table/${tableViz.tableName}`)
              .pipe(take(1))
          }
        })
      )
      .subscribe(resp => this.content = resp);
  }

  /**
   * Methods called when child (generic table) emits Output event after content modification 
   */
  onContentChange() {
    this.getContentInformation();
  }

}
