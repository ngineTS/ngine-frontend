import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { GenericFormComponent } from '../generic-form/generic-form.component';
import { DeepFormConfig, StandardInputConfig } from '../../models/form-input.interface';
import { CustomFormInput, TableViz } from '../../models/content-management.interface';


@Component({
  selector: 'app-generic-table',
  imports: [
    MatFormFieldModule, 
    MatInputModule, 
    MatTableModule, 
    MatSortModule, 
    MatPaginatorModule,
    MatButton
  ],
  templateUrl: './generic-table.component.html',
  styleUrl: './generic-table.component.scss'
})
export class GenericTableComponent<T extends Record<string, any>> {

  displayedColumns: Array<string> = [];
  dataSource!: MatTableDataSource<T>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Input() content!: Array<T>; //the data in JSON format
  @Input() tableConfig!: TableViz; //The table and input config used for editing
  @Input() canAdd!: boolean;
  @Input() canEdit!: boolean;
  @Output() contentChanged: EventEmitter<null> = new EventEmitter();

  constructor(private _matDialog: MatDialog) { }

  ngOnInit() {}

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges["content"]) {
      this.displayedColumns = [];
      for (const key in this.content[0]) {
        this.displayedColumns.push(key);
      }
      if (this.canEdit) {
        this.displayedColumns.push('edit');
      }
      this.dataSource = new MatTableDataSource(this.content);
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addItem() {
    const payload = {} as DeepFormConfig<Record<string, any>>;
    for (const inputConfig of this.tableConfig.customFormInputs) {
      if (this.isStandardInput(inputConfig)) {
        payload[inputConfig.columnName] = {
          type: inputConfig.inputType,
          value: null,
          validators: []
        } as StandardInputConfig<any>
      }
      //TODO: Handle dropdown case
    }
  
    const dialogRef = this._matDialog.open(GenericFormComponent<T>, {
      data: {
        id: null,
        navigationId: null,
        controllerName: `auto-generated-content/${this.tableConfig.tableName}`,
        formConfig: payload
      }
    });

    dialogRef.afterClosed().subscribe(resp => {
      if (resp === 'added') {
        this.contentChanged.emit();
      }
    });
  }

  editItem() {
    /*this._matDialog.open(GenericFormComponent<T>, {
      data: {
        id: null,
        navigationId: null,
        controllerName: 'sjss',
        formConfig: 's'
      }
    });*/
  }

  isStandardInput(inputConfig: CustomFormInput): boolean {
    if(inputConfig.inputType && inputConfig.inputType !== 'dropdown') {
      return true;
    }
    return false;
  } 

}

