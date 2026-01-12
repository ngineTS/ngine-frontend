import { ContainerLayout } from "./container-layout.interface";
import { ContainerStyle } from "./container-style.interface";
import { TypographyStyle } from "./typography-style.interface";

export interface Menu {
    id: string;
    navigationId: string;
    containerLayout: ContainerLayout;
    containerStyle: ContainerStyle;
    typographyStyle: TypographyStyle;
    permissionName?: string;  
}

export type MenuPayload = {
    containerLayout: Omit<ContainerLayout, 'id' | 'refId'>;
    containerStyle: Omit<ContainerStyle, 'id' | 'refId'>;
    typographyStyle: Omit<TypographyStyle, 'id' |'refId'>;
}