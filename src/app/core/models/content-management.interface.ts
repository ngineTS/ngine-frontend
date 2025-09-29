import { InputType } from "./form-input.interface";
import { Navigation } from "./navigation.interface";

export interface TableViz {
    id: string;
    navigationId: Navigation["id"];
    tableName: string;
    tableLabel: string;
    isEditable: boolean;
    customFormInputs: Array<CustomFormInput>;
}

export interface CustomFormInput {
    id: string;
    tableId: string;
    columnName: string;
    columnType: string;
    inputType: InputType;
    inputLabel: string;
    validators: Array<string>;
    isList: boolean;
    bindValue: string;
    bindLabel: string;
    dropdownItems: string;
    dropdownRouteName: string;
}