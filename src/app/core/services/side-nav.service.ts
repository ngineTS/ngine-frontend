import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { FormValueEvent, GenericFormDialogData } from "../models/form-input.interface";

@Injectable({
  providedIn: 'root',
})
export class SideNavService {

    constructor() { }

    initalFormContent: Record<string, any> | null = null;

    formValueEvent = new Subject<FormValueEvent>();
    
    formConfiguration = new Subject<
      GenericFormDialogData<Exclude<typeof this.initalFormContent, null>> | null
    >();
    
    stopSubscriptions = new Subject<void>();
    
}