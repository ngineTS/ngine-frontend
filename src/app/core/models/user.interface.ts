import { UserRole } from "./user-role.interface";

export interface User {
    id: string;
    name: string;
    lastName: string;
    emailAddress: string;
    password?: string;
    isDisabled: boolean;
    createdDate: Date;
    createdBy: string;
    updatedDate: Date;
    updatedBy: string;
    deletedDate: Date;
    deletedBy: string;
    userRoles?: Array<UserRole>
}

export type UserSignUpPayload = Pick<User, 
    "name" 
    | "lastName" 
    | "emailAddress" 
    | "password"
>;

export type UserSignInPayload = Pick<User,
    "emailAddress"
    | "password"
>