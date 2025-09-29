import { FormGroup } from "@angular/forms";

export interface FormFile {
    formGroup: FormGroup;
    formControlName: string;
    formFile: FormData;
    hasChanged: boolean;
    fileId: string; 
}