import { HttpClient, HttpParams } from "@angular/common/http";
import { DeepFormConfig, GenericFormDialogData } from "../../models/form-input.interface";
import { environment } from "../../../../environments/environment";
import { FormContainerComponent } from "../form-container/form-container.component";
import { NavigationBaseComponent } from "../navigation-base/navigation-base.component";
import { Component, inject } from "@angular/core";
import { retry, take } from "rxjs";

/**
 * Generic class that provides basic management functionalities (add, edit, delete) for items of type T.
 * 
 * To use this class, extend it and set the `formInputsConfiguration` and `tableName` properties.
 * Then, you can call the `loadItems()`, `addItem()` and `editItem()` methods to manage the items.
 * 
 * Important: The type T has to match database table structure and must contain `id` and `navigationId` properties,
 * otherwise the class will not work properly.
 */
@Component({
  selector: 'app-management-base',
  template: '',
  imports: []
})
export class ManagementBaseComponent<
  T extends {
    [prop: string]: any;
    id: string;
    navigationId: string;
  }
> extends NavigationBaseComponent {

  constructor() { super(); }

  /** The http client. */
  protected _http = inject(HttpClient);
  /** The backend url. */
  protected readonly _baseUrl = environment.APIURL;
  /** The items to be managed. */
  protected _items: Array<T> = [];
  /** The name of the database table. */
  protected _tableName: string = '';
  /** The form inputs configuration. */
  protected _formInputsConfiguration: DeepFormConfig<Omit<T, 'id' | 'navigationId'>> | undefined;
  /** The sorting configuration. */
  protected _sortConfiguration : { orderBy: keyof T, order: 'ASC' | 'DESC' } | null = null;

  /** 
   * Load items by navigation id.
   * 
   * If sortConfiguration is set, the items will be sorted accordingly.
   * `tableName` must be set before calling this method.
   */
  _loadItems() {
    if(this._sortConfiguration) {
      const params = new HttpParams()
        .set('orderBy', this._sortConfiguration.orderBy as string)
        .set('order', this._sortConfiguration.order);

      this._http.get<Array<T>>(`${this._baseUrl}custom-table/${this._tableName}/${this._navigation.id}`, { params })
      .pipe(retry(this._retryCount), take(this._takeCount))
      .subscribe(resp => this._items = resp);
    }
    else {
      this._http.get<Array<T>>(`${this._baseUrl}custom-table/${this._tableName}/${this._navigation.id}`)
      .pipe(retry(this._retryCount), take(this._takeCount))
      .subscribe(resp => this._items = resp);
    }
  }

  /**
   * Open form to add a new item.
   * 
   * `formInputsConfiguration` and `tableName` must be set before calling this method,
   *  otherwise the form will not be able to create the new item.
   */
  _addItem() {
    if (this._formInputsConfiguration && this._canAdd) {
      const dialogData: GenericFormDialogData<Omit<T, 'id' | 'navigationId'>> = {
        formTitle: 'Add item',
        formConfig: this._formInputsConfiguration,
        payloadId: null,
        navigationId: this._navigation.id,
        controllerName: `custom-table/${this._tableName}`,
        hasDeleteButton: false
      }

      const matDialogRef = this._matDialog.open(
        FormContainerComponent,
        { data: dialogData }
      );

      matDialogRef.afterClosed().subscribe(resp => {
        if (resp === 'added') {
          this._loadItems();
        }
      });
    }
  }
   
  /**
   * Open form to edit an item.
   * 
   * `formInputsConfiguration` and `tableName` must be set before calling this method,
   *  otherwise the form will not be able to edit the item.
   * 
   * @param item The item to be edited.
   */
  _editItem(item: T) {
    if (this._formInputsConfiguration && this._canEdit) {
      const formInputsConfigurationForEdit = Object.fromEntries(
        Object.entries(this._formInputsConfiguration).map(([key, field]) => [
          key,
          { ...field, value: item[key] ?? field.value }
        ])
      ) as DeepFormConfig<Omit<T, 'id' | 'navigationId'>>;

      const dialogData: GenericFormDialogData<Omit<T, 'id' | 'navigationId'>> = {
        formTitle: 'Edit item',
        formConfig: formInputsConfigurationForEdit,
        payloadId: item.id,
        navigationId: this._navigation.id,
        controllerName: `custom-table/${this._tableName}`,
        hasDeleteButton: this._canDelete
      }

      const matDialogRef = this._matDialog.open(
        FormContainerComponent,
        { data: dialogData }
      );

      matDialogRef.afterClosed().subscribe(resp => {
        if (resp === 'edited' || resp === 'deleted') {
          this._loadItems();
        }
      });
    }
  }

}