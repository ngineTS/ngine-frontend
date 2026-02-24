export interface ContainerLayout {
    id: string;
    refId: string;
	width: number | null;
	height: number | null;
	marginTop: number | null;
	marginRight: number | null;
	marginBottom: number | null;
	marginLeft: number | null;
	paddingTop: number | null;
	paddingRight: number | null;
	paddingBottom: number | null;
	paddingLeft: number | null;
	gap: number;
	xPos: number | null;
	yPos: number | null;
}