import { Navigation } from "./navigation.interface";
import { Permission } from "./permission.interface";

export interface RoleNavigationPermission {
    id: string;
    roleId: string;
    navigationId: string;
    permissionId: string;
    createdDate: Date;
    createdBy: string;
    updatedDate: Date;
    updatedBy: string;
    deletedDate: Date;
    deletedBy: string;
    navigation?: Navigation;
    permission?: Permission;
}