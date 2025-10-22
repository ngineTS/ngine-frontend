import { RoleNavigationPermission } from "./role-navigation-permission.interface";

export interface Role {
    id: string;
    name: string;
    displayLabel: string;
    description: string;
    isDisabled: boolean;
    createdDate: Date;
    createdBy: string;
    updatedDate: Date;
    updatedBy: string;
    deletedDate: Date;
    deletedBy: string;
    roleNavigationPermissions?: Array<RoleNavigationPermission>;
}

export type RolePayload = Pick<Role, 'displayLabel' | 'description' | 'isDisabled'>