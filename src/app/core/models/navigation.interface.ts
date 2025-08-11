import { TestText } from "./test-text.interface";
import { NavigationType } from "./navigation-type.interface";

export interface Navigation {
    id: string;
    parentId: string;
    name: string;
    displayLabel: string;
    order: number;
    color: string;
    width: number;
    height: number;
    isDisabled: string;
    createdDate: Date;
    createdBy: string;
    updatedDate: Date;
    updatedBy: string;
    deletedDate: Date;
    deletedBy: string;
    navigationTypeId: string;
    navigationType: NavigationType;
    children?: Navigation[];
    parent?: Navigation;
    testText?: TestText;
}