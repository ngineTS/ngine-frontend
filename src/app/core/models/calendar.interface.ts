import { Media } from "./media.interface";

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
    media?: Media
}

export type CalendarPayload = {
    title: string;
    startDate: Date | null;
    endDate?: Date | null;
    description: string;
    category: string;
    url: string;
    allDay?: boolean;
    fileId: string;
}
