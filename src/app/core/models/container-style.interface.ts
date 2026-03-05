export interface ContainerStyle {
    id: string;
    refId: string;
    backgroundColor: string | null;
    borderColor: string | null;
    borderStyle: string | null;
    borderWidth: number | null;
    borderTopLeftRadius: number | null;
    borderTopRightRadius: number | null;
    borderBottomLeftRadius: number | null;
    borderBottomRightRadius: number | null;
    isBorderTopHidden: boolean | null;
    isBorderRightHidden: boolean | null;
    isBorderBottomHidden: boolean | null;
    isBorderLeftHidden: boolean | null;
}