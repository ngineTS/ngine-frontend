import { HttpClient } from "@angular/common/http";
import { DeepFormConfig, GenericFormDialogData } from "./form-input.interface";
import { environment } from "../../../environments/environment";
import { FormContainerComponent } from "../components/form-container/form-container.component";
import { SnackBarService } from "../services/snackbar.service";
import { NavigationBaseComponent } from "../components/navigation-base/navigation-base.component";
import { Component } from "@angular/core";

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
@Component({
  selector: 'app-management-base',
  template: '',
  imports: []
})
export class ManagementBase<
  T extends Record<string, any> 
  & { id: string; navigationId: string; }
> extends NavigationBaseComponent {

  constructor (
    private _http: HttpClient,
    private _snackBarService: SnackBarService
  ) { super(); }

  /** The backend url. */
  baseUrl = environment.APIURL;
  /** The items to be managed. */
  items: Array<T> = [];
  /** The name of the database table. */
  tableName: string = '';
  /** The form inputs configuration. */
  formInputsConfiguration = {} as DeepFormConfig<Omit<T, 'id' | 'navigationId'>> & Record<string, any>;

  /** 
   * Load the items by navigation id.
   */
  loadItems() {
    this._http.get<Array<T>>(`${this.baseUrl}custom-table/${this.tableName}/${this._navigation.id}`)
      .subscribe(resp => {
        console.log(resp);
        this.items = resp
      });
  }

  /**
   * Open form to add a new item.
   * 
   * `formInputsConfiguration` and `tableName` must be set before calling this method,
   *  otherwise the form will not be able to create the new item.
   */
  addItem() {
    const dialogData: GenericFormDialogData<Omit<T, 'id' | 'navigationId'>> = {
      formTitle: 'Add item',
      formConfig: this.formInputsConfiguration,
      payloadId: null,
      navigationId: this._navigation.id,
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
   */
  editItem(item: T) {
    const {id, navigationId, ...itemWithoutId} = item;
    for (const [key, value] of Object.entries(itemWithoutId)) {
      if (value) {
        this.formInputsConfiguration[key].value = value;
      }
    }

    const dialogData: GenericFormDialogData<Omit<T, 'id' | 'navigationId'>> = {
      formTitle: 'Edit item',
      formConfig: this.formInputsConfiguration,
      payloadId: item.id,
      navigationId: this._navigation.id,
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