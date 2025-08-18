import { Navigation } from "./navigation.interface";

export interface TableViz {
    id: string;
    navigationId: Navigation["id"];
    tableName: string;
    tableLabel: string;
    isEditable: boolean
}

export interface CustomFormInput {
    id: string;
    tableId: string;
    columnName: string;
    columnType: string;
    inputType: string;
    inputLabel: string;
    bindValue: string;
    bindLabel: string;
    validators: Array<string>
}