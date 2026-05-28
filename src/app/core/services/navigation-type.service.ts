import { Injectable } from "@angular/core";
import { DeepFormConfig, GenericFormDialogData } from "../models/form-input.interface";
import { Validators } from "@angular/forms";
import { NavigationType } from "../models/navigation-type.interface";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { retry, take } from "rxjs";


@Injectable({
    providedIn: 'root',
})
export class NavigationTypeService { 

    constructor(private _http: HttpClient) {}

    /**
     * Get all navigation types.
     * 
     * @returns An observable of navigation types.
     */
    getNavigationTypes() {
      return this._http.get<NavigationType[]>(`${environment.APIURL}navigation-type`)
        .pipe(take(1), retry(1));
    }

    /**
     * Setup navigation type form.
     * 
     * @returns The form config.
     */
    setupNavigationTypeForm(): GenericFormDialogData<Omit<NavigationType, 'id'>> {
      const inputsConfiguration: DeepFormConfig<Omit<NavigationType, 'id'>> = {
        name: {
          type: 'text',
          value: '',
          alias: 'Name',
          info: `IMPORTANT: Name has to match the key of the component store.`,
          order: 1,
          validators: [Validators.required],
        },
        displayLabel: {
          type: 'text',
          value: '',
          alias: 'Display label',
          order: 2,
          validators: [Validators.required],
        },
        description: {
          type: 'textarea',
          value: '',
          alias: 'Description',
          order: 3,
          validators: [Validators.required],
        },
        thumbnailImage: {
          type: 'file',
          value: '',
          alias: 'Thumbnail image',
          order: 4,
          validators: [],
        }
      }

      const formConfiguration: GenericFormDialogData<Omit<NavigationType, 'id'>> = {
        formTitle: 'Add Component Type',
        formConfig: inputsConfiguration,
        controllerName: 'navigation-type',
        payloadId: null,
        hasDeleteButton: false,
      }

      return formConfiguration;
    }
}