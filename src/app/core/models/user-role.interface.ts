import { Role } from "./role.interface";

export interface UserRole {
    id: string;
    roleId: string;
    userId: string;
    isCancelled: boolean;
    createdDate: Date;
    createdBy: string;
    updatedDate: Date;
    updatedBy: string;
    deletedDate: Date;
    deletedBy: string;
    role?: Role;
}

export type UserRolePayload = Pick<UserRole, 'roleId' | 'userId'>