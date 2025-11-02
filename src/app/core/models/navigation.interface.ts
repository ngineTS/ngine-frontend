import { NavigationType } from "./navigation-type.interface";
import { HeaderBar } from "./header-bar.interface";
import { PermissionName } from "./permission.interface";

export interface Navigation {
    id: string;
    parentId: string;
    name: string;
    displayLabel: string;
    description: string;
    order: number;
    width: number;
    height: number;
    isDisabled: boolean;
    createdDate: Date;
    createdBy: string;
    updatedDate: Date;
    updatedBy: string;
    deletedDate: Date;
    deletedBy: string;
    navigationTypeId: string;
    navigationType: NavigationType;
    icon: string;
    headerBar: HeaderBar;
    children?: Navigation[];
    parent?: Navigation;
    permissionName?: PermissionName;
}