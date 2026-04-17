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
          info: `
            It has to be the kebab-case of the Angular component name it represents.
            For example, if component name is "MyComponent", the navigation type name must be "my-component".
          `,
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
          validators: [Validators.required],
        }
      }

      const formConfiguration: GenericFormDialogData<Omit<NavigationType, 'id'>> = {
        formTitle: 'Add Navigation Type',
        formConfig: inputsConfiguration,
        controllerName: 'navigation-type',
        payloadId: null,
        hasDeleteButton: false,
      }

      return formConfiguration;
    }
}