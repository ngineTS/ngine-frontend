import { Navigation } from "./navigation.interface";

export interface TableViz {
    id: string;
    navigationId: Navigation["id"];
    tableName: string;
}

export interface CustomFormInput {
    id: string;
    tableId: string;
    columnName: string;
    inputType: string;
    inputLabel: string;
    validators: Array<string>
}