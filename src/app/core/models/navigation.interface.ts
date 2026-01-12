import { NavigationType } from "./navigation-type.interface";
import { HeaderBar } from "./header-bar.interface";
import { PermissionName } from "./permission.interface";
import { ContainerLayout } from "./container-layout.interface";
import { TypographyStyle } from "./typography-style.interface";
import { ContainerStyle } from "./container-style.interface";
import { Menu } from "./menu.interface";

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
    navigationTypeId: string;
    navigationType: NavigationType;
    icon: string;
    menu: Menu;
    containerLayout?: ContainerLayout;
    containerStyle?: ContainerStyle;
    typographyStyle?: TypographyStyle;
    children?: Navigation[];
    parent?: Navigation;
    permissionName?: PermissionName;
    createdDate: Date;
    createdBy: string;
    updatedDate: Date;
    updatedBy: string;
    deletedDate: Date;
    deletedBy: string;
}