import { Injectable } from "@angular/core";
import { DeepFormConfig, GenericFormDialogData } from "../models/form-input.interface";
import { Validators } from "@angular/forms";
import { NavigationType } from "../models/navigation-type.interface";

@Injectable({
    providedIn: 'root',
})
export class NavigationTypeService { 

    constructor() {}

    setupNavigationTypeForm(): GenericFormDialogData<Omit<NavigationType, 'id'>> {
      const inputsConfiguration: DeepFormConfig<Omit<NavigationType, 'id'>> = {
        name: {
          type: 'text',
          value: '',
          alias: 'Name',
          validators: [Validators.required],
        },
        displayLabel: {
          type: 'text',
          value: '',
          alias: 'Display label',
          validators: [Validators.required],
        },
        description: {
          type: 'text',
          value: '',
          alias: 'Description',
          validators: [Validators.required],
        },
        thumbnailImage: {
          type: 'file',
          value: '',
          alias: 'Thumbnail image',
          validators: [Validators.required],
        }
      }

      const formConfiguration: GenericFormDialogData<Omit<NavigationType, 'id'>> = {
        formTitle: 'Add navigation type (Important: Name has to ',
        formConfig: inputsConfiguration,
        controllerName: 'navigation-type',
        payloadId: null,
        hasDeleteButton: false,
      }

      return formConfiguration;
    }
}