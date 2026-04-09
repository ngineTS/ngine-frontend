import { HttpClient } from "@angular/common/http";
import { DeepFormConfig, GenericFormDialogData } from "./form-input.interface";
import { environment } from "../../../environments/environment";
import { FormContainerComponent } from "../components/form-container/form-container.component";
import { MatDialog } from "@angular/material/dialog";
import { SnackBarService } from "../services/snackbar.service";

/**
 * Generic class that provides basic management functionalities (add, edit) for items of type T.
 * 
 * To use this class, extend it and set the `formInputsConfiguration` and `tableName` properties 
 * with the form configuration and table name for the items. Then, you can call the `loadItems`,
 * `addItem` and `editItem` methods to manage the items.
 * 
 * Important: The type T has to match database table structure and must contain an `id` property of type string,
 * otherwise the class will not work properly.
 */
export class ManagementBase<T extends Record<string, unknown> & { id: string }> {

  constructor(
    private _http: HttpClient,
    private _matDialog: MatDialog,
    private _snackBarService: SnackBarService
  ) { }

  /** The backend url. */
  baseUrl = environment.APIURL;
  /** The items to be managed. */
  items: Array<T> = [];
  /** The name of the database table. */
  tableName: string = '';
  /** The form inputs configuration. */
  formInputsConfiguration = {} as DeepFormConfig<T>;

  /** 
   * Load the items by navigation id.
   */
  loadItems(navigationId: string) {
    this._http.get<Array<T>>(`${this.baseUrl}/${this.tableName}/${navigationId}`)
      .subscribe(resp => this.items = resp);
  }

  /**
   * Open form to add a new item.
   * 
   * `formInputsConfiguration` and `tableName` must be set before calling this method,
   *  otherwise the form will not be able to create the new item.
   * 
   * @param navigationId The navigation id associated to the items.
   */
  addItem(navigationId: string) {
    const dialogData: GenericFormDialogData<T> = {
      formTitle: 'Add item',
      formConfig: this.formInputsConfiguration,
      payloadId: null,
      navigationId: navigationId,
      controllerName: `custom-table/${this.tableName}`,
      hasDeleteButton: false
    }

    const matDialogRef = this._matDialog.open(
      FormContainerComponent,
      { maxWidth: '700px', data: dialogData }
    );

    matDialogRef.afterClosed().subscribe(resp => {
      if (resp === 'added') {
        this._snackBarService.showSuccessSnackBar('Item added successfully');
      }
    });
  }
   
  /**
   * Open form to edit an item.
   * 
   * `formInputsConfiguration` and `tableName` must be set before calling this method,
   *  otherwise the form will not be able to edit the item.
   * 
   * @param item The item to be edited.
   * @param navigationId The navigation id associated to the items.
   */
  editItem(item: T, navigationId: string) {
    for (const [key, value] of Object.entries(item)) {
      if (value) {
        this.formInputsConfiguration[key].value = value;
      }
    }

    const dialogData: GenericFormDialogData<T> = {
      formTitle: 'Edit item',
      formConfig: this.formInputsConfiguration,
      payloadId: item.id,
      navigationId: navigationId,
      controllerName: `custom-table/${this.tableName}`,
      hasDeleteButton: true
    }

    const matDialogRef = this._matDialog.open(
      FormContainerComponent,
      { maxWidth: '700px', data: dialogData }
    );

    matDialogRef.afterClosed().subscribe(resp => {
      if (resp === 'edited') {
        this._snackBarService.showSuccessSnackBar('Item edited successfully');
      }
    });
  }
}