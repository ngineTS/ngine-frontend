import { InputType } from "./form-input.interface";
import { Navigation } from "./navigation.interface";

export interface TableViz {
    id: string | null;
    navigationId: Navigation["id"];
    tableName: string;
    tableLabel: string;
    isEditable: boolean;
    customFormInputs: Array<CustomFormInput>;
}

export interface CustomFormInput {
    id: string | null;
    tableId: string;
    columnName: string;
    columnType: string;
    inputType: InputType;
    inputLabel: string;
    validators: Array<string>;
    isList: boolean;
    bindValue: string | null;
    bindLabel: string | null;
    dropdownItems: string | null;
    dropdownRouteName: string | null;
}