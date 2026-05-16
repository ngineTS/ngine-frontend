import { Injectable } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { DeepFormConfig, FormValueEvent, GenericFormDialogData } from "../models/form-input.interface";
import { Menu, StylePayload } from "../models/menu.interface";
import { Navigation } from "../models/navigation.interface";

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

    /**
     * Setup listener on sidenav to update navigation style in real time.
     * If sidenav is closed without saving then assign back initial style.
     */
    setSideNavFormListener(object: Navigation | Menu) {
      //navigation case
      const initialFormContent = {
        containerLayout: JSON.parse(JSON.stringify(object.containerLayout)),
        containerStyle: JSON.parse(JSON.stringify(object.containerStyle)),
        typographyStyle: JSON.parse(JSON.stringify(object.typographyStyle)),
      }
  
      this.formValueEvent
        .pipe(takeUntil(this.stopSubscriptions))
        .subscribe(formValueEvent => {
          if (formValueEvent.formControlValue === 'close') {
            object.containerLayout = this.initalFormContent!['containerLayout'];
            object.containerStyle = this.initalFormContent!['containerStyle'];
            object.typographyStyle = this.initalFormContent!['typographyStyle'];
          }
          else {
            object[`${formValueEvent.formGroupName}`][`${formValueEvent.formControlName}`] = formValueEvent.formControlValue;
          }
        });

        this.initalFormContent = initialFormContent;
    }
    
}