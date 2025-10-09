export interface HeaderBar {
    id: string;
    navigationId: string;
    imageName: string;
    backgroundColor: string;
    borderBottom: number;
    gap: number;
    fontFamily: string;
    fontSize: number;
    color: string;
    activeColor: string;
    height: number;
    isVisibleDuringNavigation: boolean;
    createdBy: string;
    createdDate: Date;
    updatedBy: string;
    updatedDate: Date;
    deletedBy: string;
    deletedDate: Date;
}

export type HeaderBarPayload = Omit<HeaderBar,
    "id" |
    "navigationId" |
    "createdBy" |
    "createdDate" |
    "updatedBy" |
    "updatedDate" |
    "deletedBy" |
    "deletedDate"
>
 