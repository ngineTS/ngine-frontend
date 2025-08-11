export interface Calendar {
    id: string;
    navigationId: string;
    title: string;
    startDate: Date;
    endDate: Date;
    description: string;
    fileId: string;
    category: string;
    url: string;
    allDay: boolean;
}

export type CalendarPayload = {
    title: string;
    startDate: Date;
    endDate?: Date;
    description: string;
    category: string;
    url: string;
    allDay?: boolean;
}
