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
}

export type CalendarPayload = Omit<Calendar, "id" | "navigationId" | "fileId">;