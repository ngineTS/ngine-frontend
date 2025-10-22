import { Role } from "./role.interface";

export interface UserRole {
    id: string;
    roleId: string;
    userId: string;
    role?: Role;
}