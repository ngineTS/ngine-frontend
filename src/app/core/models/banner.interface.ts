import { Navigation } from "./navigation.interface";

export interface Banner {
    id: string;
    navigationId: string;
    description: string;
    startDate: Date;
    endDate: Date;
    backgroundColor: string;
    textColor: string;
    url: string;
    navigation?: Navigation;
}