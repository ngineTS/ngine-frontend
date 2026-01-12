export interface ContainerStyle {
    id: string;
    refId: string;
    backgroundColor: string;
    borderColor: string | null;
    borderStyle: string | null;
    borderWidth: number | null;
    borderTopLeftRadius: number;
    borderTopRightRadius: number;
    borderBottomLeftRadius: number;
    borderBottomRightRadius: number;
    isBorderTopHidden: boolean;
    isBorderRightHidden: boolean;
    isBorderBottomHidden: boolean;
    isBorderLeftHidden: boolean;
}