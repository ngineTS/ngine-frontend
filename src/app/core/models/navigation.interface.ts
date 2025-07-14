import { TestText } from "./test-text.interface";
import { NavigationType } from "./navigation-type.interface";

export interface Navigation {
    id: string;
    parentId: string;
    name: string;
    displayLabel: string;
    order: number;
    navigationTypeId: string;
    navigationType: NavigationType;
    children?: Navigation[];
    parent?: Navigation;
    testText?: TestText;
}