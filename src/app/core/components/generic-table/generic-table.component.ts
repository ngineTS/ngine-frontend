import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DeepFormConfig, DropdownInputConfig, StandardInputConfig } from '../../models/form-input.interface';
import { CustomFormInput, TableViz } from '../../models/content-management.interface';
import { ValidatorFn, Validators } from '@angular/forms';
import { MediaService } from '../../services/media.service';
import { ContainerStyle } from '../../models/container-style.interface';
import { FormContainerComponent } from '../form-container/form-container.component';


@Component({
  selector: 'app-generic-table',
  imports: [
    MatFormFieldModule, 
    MatInputModule, 
    MatTableModule, 
    MatSortModule, 
    MatPaginatorModule,
    MatButton,
  ],
  templateUrl: './generic-table.component.html',
  styleUrl: './generic-table.component.scss'
})
export class GenericTableComponent<T extends Record<string, any>> {

  displayedColumns: Array<string> = [];
  dataSource!: MatTableDataSource<T>;
  validatorsMap: Map<string, ValidatorFn> = new Map(); //map object used to get form valifator functions from input configuration

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Input() content!: Array<T>; //table content as array of objects of type T
  @Input() tableConfig!: TableViz; //table and input configurations used for editing
  @Input() canAdd: boolean | undefined; //user permission
  @Input() canEdit: boolean | undefined; //user permission
  @Input() canDelete: boolean | undefined; //user permission
  @Input() containerStyle?: ContainerStyle | undefined; //container style
  
  @Output() contentChanged: EventEmitter<null> = new EventEmitter(); //event emitter to inform parent about table change

  constructor(
    private _matDialog: MatDialog,
    private _mediaService: MediaService
  ) { }

  /**
   * On init store required and email validators fn which are the only handled for now.
   */
  ngOnInit() {
    this.validatorsMap.set('required', Validators.required);
    this.validatorsMap.set('email', Validators.email);
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges["content"] && this.tableConfig.customFormInputs) {
      this.displayedColumns = [];
      for (const inputConfig of this.tableConfig.customFormInputs) {
        this.displayedColumns.push(inputConfig.columnName);
      }
      if (this.canEdit) {
        this.displayedColumns.push('edit');
      }
      this.dataSource = new MatTableDataSource(this.content);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }, 50);
  }

  /**
   * Filter table on search input keyup.
   * @param event The value emited by keyup output.
   */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Create generic form inputs object (of type DeepFormConfig<...>)
   * based on input configurations then open form to add item. 
   */
  addItem() {
    const payload = {} as DeepFormConfig<Record<string, any>>;
    for (const inputConfig of this.tableConfig.customFormInputs) {
      const validators: Array<ValidatorFn> = [];
      for (let validatorName of inputConfig.validators) {
        const validatorFn = this.validatorsMap.get(validatorName);
        if(validatorFn) {
          validators.push(validatorFn);
        }
      }
      if (this.isStandardInput(inputConfig)) {
        payload[inputConfig.columnName] = {
          type: inputConfig.inputType,
          alias: inputConfig.inputLabel,
          value: null,
          validators: validators
        } as StandardInputConfig<any>
      }
      else {
        payload[inputConfig.columnName] = {
          type: inputConfig.inputType,
          alias: inputConfig.inputLabel,
          value: inputConfig.isList ? [] : null,
          validators: validators,
          dropdownConfig: { //TODO: Handle dropdown route name
            items: inputConfig.dropdownItems!.split(',')
          }
        } as DropdownInputConfig<any, typeof inputConfig.dropdownItems>
      }
    }
  
    const dialogRef = this._matDialog.open(FormContainerComponent, {
      data: {
        payloadId: null, //id null therefore generic form understand it has to insert a record
        navigationId: null,
        controllerName: `custom-table/${this.tableConfig.tableName}`,
        formConfig: payload,
        formTitle: this.tableConfig.tableLabel
      }
    });

    dialogRef.afterClosed().subscribe(resp => {
      if (resp === 'added') {
        this.contentChanged.emit();
      }
    });
  }

  /**
   * Create generic form inputs object (of type DeepFormConfig<...>)
   * based on input configurations then open form to edit row.
   * 
   * @param row The object (of type T) to edit.
   */
  editItem(row: T) {
    const payload = {} as DeepFormConfig<Record<string, any>>;
    for (const [key, value] of Object.entries(row)) { 
      const inputConfig = this.tableConfig.customFormInputs.find(obj => obj.columnName === key);
      if (inputConfig) {
        const validators: Array<ValidatorFn> = [];
        for (let validatorName of inputConfig.validators) {
          const validatorFn = this.validatorsMap.get(validatorName);
          if(validatorFn) {
            validators.push(validatorFn);
          }
        }
        if (this.isStandardInput(inputConfig)) {
          payload[key] = {
            type: inputConfig.inputType,
            alias: inputConfig.inputLabel,
            value: value,
            validators: validators
          } as StandardInputConfig<any>
        }
        else { 
          payload[key] = {
            type: inputConfig.inputType,
            alias: inputConfig.inputLabel,
            value: value,
            validators: validators,
            dropdownConfig: { //TODO: Handle dropdown route name
              items: inputConfig.dropdownItems!.split(',')
            }
          } as DropdownInputConfig<any, typeof inputConfig.dropdownItems>
        }
      }
    }

    const dialogRef = this._matDialog.open(FormContainerComponent, {
      data: {
        payloadId: row["id"], //assign id therefore generic form understand it has to update record
        navigationId: null,
        controllerName: `custom-table/${this.tableConfig.tableName}`,
        formConfig: payload,
        formTitle: this.tableConfig.tableLabel,
        hasDeleteButton: this.canDelete
      }
    });

    dialogRef.afterClosed().subscribe(resp => {
      if (resp === 'edited' || resp === 'deleted') {
        this.contentChanged.emit();
      }
    });
  }

  /**
   * Check if input is a standard input (i.e not a dropdown).
   * 
   * @param inputConfig The input to check.
   */
  isStandardInput(inputConfig: CustomFormInput): boolean {
    if(inputConfig.inputType && inputConfig.inputType !== 'dropdown') {
      return true;
    }
    return false;
  } 

  /**
   * Check if input is a dropdown input.
   * @param inputConfig The input to check.
   */
  isDropdownInput(inputConfig: CustomFormInput): boolean {
    if(inputConfig.inputType && inputConfig.inputType === 'dropdown') {
      return true;
    }
    return false;
  } 

  redirectToS3File(fileName: string) {
    this._mediaService.getFileUrl(fileName).subscribe(resp => window.open(resp));
  }

}