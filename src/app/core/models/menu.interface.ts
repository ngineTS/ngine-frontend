import { ContainerLayout } from "./container-layout.interface";
import { ContainerStyle } from "./container-style.interface";
import { TypographyStyle } from "./typography-style.interface";

export interface Menu extends Record<string, any> {
    id: string;
    navigationId: string;
    isVertical: boolean;
    containerLayout: ContainerLayout;
    containerStyle: ContainerStyle;
    typographyStyle: TypographyStyle;
    permissionName?: string;  
}

export type StylePayload = {
    containerLayout: Partial<ContainerLayout>;
    containerStyle: Partial<ContainerStyle>;
    typographyStyle: Partial<TypographyStyle>;
}