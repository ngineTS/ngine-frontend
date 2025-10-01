import { Component, Input } from '@angular/core';
import { Navigation } from '../../models/navigation.interface';
import { CustomFormInput, TableViz } from '../../models/content-management.interface';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { retry, switchMap, take } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { MatTooltipModule } from '@angular/material/tooltip';

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
export class ContentVisualizationComponent {

  constructor(private _http: HttpClient) {}

  @Input() navigation!: Navigation; //the component instance navigation
  content!: Array<object>; //the content reprensenting the table sample
  tableConfig!: TableViz | undefined; //the table and columns/inputs configuration 
  tableNames: Array<string> | null = []; //the list of table names used as dropdown items

  ngOnInit() {
    this.getTableNames().subscribe(resp => this.tableNames = resp);
    this.getContentInformation();
  }
  
  /**
   * Get table configuration and content for given navigation.
   * 
   * If no table configuration exist then do nothing.
   * 
   */
  getContentInformation() {
    this._http.get<TableViz>(`${environment.APIURL}table-viz/navigation/${this.navigation.id}`)
      .pipe(
        retry(2),
        take(1),
        switchMap(tableViz => {
          console.log(tableViz);
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
          this.buildFakeInputsConfig(this.tableConfig!, resp[0]);
        }
      });
  }

  /**
   * Method triggered when table names dropdown selection changes.
   * 
   * Get table content from table name selected and build table configuration.
   * @param event The MatSelectChange event containing table name selected.
   */
  onSelectTable(event: MatSelectChange) {
    this._http.get<Array<object>>(`${environment.APIURL}table-viz/table-content/${event.value}`)
      .pipe(
        retry(2),
        take(1)
      )
      .subscribe(resp => {
        if (resp && resp.length > 0) {
          this.content = resp;
          this.tableConfig = {
            id: null,
            navigationId: this.navigation.id,
            tableName: event.value,
            tableLabel: event.value,
            isEditable: false, //Inform it's only a visualization content
            customFormInputs: []
          }
          this.buildFakeInputsConfig(this.tableConfig, resp[0]);
        }
      });
  }

  /**
   * Define Fake Input configuration to be passed to generic table component.
   * 
   * @param tableViz The table configuration. 
   * @param contentRow The table row sample used to get column names.
   */
  buildFakeInputsConfig(tableConfig: TableViz, contentRow: object) {
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
   * Save table configuration into database.
   */
  onSaveSelectionClick() {
    let {customFormInputs, ...tableConfigPayload} = this.tableConfig!;
    this._http.post<TableViz>(`${environment.APIURL}table-viz`, tableConfigPayload)
    .pipe(
      retry(2),
      take(1)
    )
    .subscribe(resp => {
      this.getContentInformation();
    });
  }

  /**
   * Get application table
   * @returns An array of table names.
   */
  getTableNames() {
    return this._http.get<Array<string>>(`${environment.APIURL}table-viz/table-names`)
      .pipe(
        retry(2),
        take(1)
      )
  }

  onChangeVisualizationClick() {
    this.tableConfig = undefined;
  }
  

}
