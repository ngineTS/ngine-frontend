export interface TableViz {
    id: string;
    navigationId: string;
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