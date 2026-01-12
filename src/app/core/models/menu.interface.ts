import { ContainerLayout } from "./container-layout.interface";
import { ContainerStyle } from "./container-style.interface";
import { TypographyStyle } from "./typography-style.interface";

export interface Menu {
    id: string;
    navigationId: string;
    containerLayout: ContainerLayout;
    containerStyle: ContainerStyle;
    typographyStyle: TypographyStyle;
}