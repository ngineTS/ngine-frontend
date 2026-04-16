import { Component } from '@angular/core';
import { CustomFormInput, TableViz } from '../../core/models/content-management.interface';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { retry, switchMap, take, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { GenericTableComponent } from '../../core/components/generic-table/generic-table.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationBaseComponent } from '../../core/components/navigation-base/navigation-base.component';

@Component({
  selector: 'app-content-visualization',
  imports: [
    GenericTableComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatButton,
    MatTooltipModule
  ],
  templateUrl: './content-visualization.component.html',
  styleUrl: './content-visualization.component.scss'
})
export class ContentVisualizationComponent extends NavigationBaseComponent {

  constructor(private _http: HttpClient) { super(); }

  content!: Array<object>; // The content reprensenting the table sample.
  tableConfig!: TableViz; // The table and columns/inputs configuration.
  tableVizPayload: Omit<TableViz, 'id' | 'customFormInputs'> | undefined; // The tableViz payload used to save or update.
  tableNames: Array<string> | null = []; // The list of table names used as dropdown items.

  ngOnInit() {
    this.getTableNames().subscribe(resp => this.tableNames = resp);
    this.getContentInformation();
  }
  
  /**
   * Get table configuration.
   * If it exists then get table content and build dummy input configuration 
   * (needed for generic table component), else do nothing.
   */
  getContentInformation() {
    this._http.get<TableViz>(`${environment.APIURL}table-viz/navigation/${this._navigation.id}`)
      .pipe(
        retry(2),
        take(1),
        switchMap(tableViz => {
          if (tableViz) {
            this.tableConfig = tableViz;
            return this._http.get<Array<object>>(`${environment.APIURL}table-viz/table-content/${tableViz.tableName}`)
            .pipe(
              retry(2),
              take(1)
            )
          }
          else {
            return of(null);
          }
        })
      )
      .subscribe(resp => {
        if (resp) {
          this.content = resp;
          this.buildDummyInputsConfig(this.tableConfig, resp[0]);
        }
      });
  }

  /**
   * Method triggered when table names dropdown selection changes.
   * - Get table content from selected table name.
   * - Build table configuration (needed for generic table component).
   * 
   * @param event The MatSelectChange event (table name selected).
   */
  onSelectTable(event: MatSelectChange) {
    this.tableVizPayload = {
      navigationId: this._navigation.id,
      tableName: event.value,
      tableLabel: event.value,
      isEditable: false
    }
  }

  /**
   * Define dummy inputs configuration to be passed to generic table component.
   * 
   * @param tableViz The table configuration.
   * @param contentRow The table row sample used to get column names.
   */
  buildDummyInputsConfig(tableConfig: TableViz, contentRow: object) {
    const inputConfigs: Array<CustomFormInput> = [];
    for (const key in contentRow) {
      inputConfigs.push({
        id: null,
        tableId: '',
        columnName: key,
        columnType: '',
        inputType: 'text',
        inputLabel: key,
        validators: [],
        isList: false,
        dropdownItems: null,
        dropdownRouteName: null,
        bindLabel: null,
        bindValue: null
      })
    }
    tableConfig.customFormInputs = inputConfigs;
  }

  /**
   * Upsert table configuration into database.
   */
  onSaveSelectionClick() {
    if (this.tableConfig) {
      this._http.patch<TableViz>(`${environment.APIURL}table-viz/${this.tableConfig.id}`, this.tableVizPayload)
      .pipe(take(1), tap(() => this.getContentInformation()))
      .subscribe(() => this._stopEditing.emit(true));
    }
    else {
      this._http.post<TableViz>(`${environment.APIURL}table-viz`, this.tableVizPayload)
      .pipe(take(1), tap(() => this.getContentInformation()))
      .subscribe(() => this._stopEditing.emit(true));
    }
  }

  /**
   * Get application table names.
   * 
   * @returns An array of table names.
   */
  getTableNames() {
    return this._http.get<Array<string>>(`${environment.APIURL}table-viz/table-names`)
      .pipe(
        retry(2),
        take(1)
      )
  }

}
