export interface Permission {
    id: string;
    name: PermissionName;
    priority: number;
    createdDate: Date;
    createdBy: string;
    updatedDate: Date;
    updatedBy: string;
    deletedDate: Date;
    deletedBy: string;
}

export type PermissionName = 'Can view' | 'Can add' | 'Can add and edit' | 'Can add, edit and delete';