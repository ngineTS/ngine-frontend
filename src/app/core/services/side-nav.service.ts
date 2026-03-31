import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { DeepFormConfig, FormValueEvent, GenericFormDialogData } from "../models/form-input.interface";
import { StylePayload } from "../models/menu.interface";

@Injectable({
  providedIn: 'root',
})
export class SideNavService {

    constructor() { }

    stopSubscriptions = new Subject<void>();
    initalFormContent: Record<string, any> | null = null;
    formValueEvent = new Subject<FormValueEvent>();
    formConfiguration = new Subject<
      GenericFormDialogData<Exclude<typeof this.initalFormContent, null>> | null
    >();
    
    /**
     * Reset side nav form and stop listeners.
     */
    resetSideNavContent() {
      this.formValueEvent.next({
        formGroupName: 'close',
        formControlName: 'close',
        formControlValue: 'close',
      });

      this.initalFormContent = null;
      this.formConfiguration.next(null);
      this.stopSubscriptions.next();
    }

    /**
     * Open style form with style form configuration.
     * 
     * @param stylePayload The form configuration.
     * @param refId The refId.
     * @param formTitle The form title.
     */
    openStyleForm(
        stylePayload: DeepFormConfig<Partial<StylePayload>>,
        refId: string,
        formTitle?: string
    ) {
        const formConfiguration: GenericFormDialogData<Partial<StylePayload>> = {
            hasDeleteButton: false,
            formConfig: stylePayload,
            payloadId: refId,
            controllerName: 'menu',
            formTitle: formTitle
        };

        this.formConfiguration.next(formConfiguration);
    }
    
}