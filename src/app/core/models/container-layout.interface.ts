export interface ContainerLayout extends Record<string, string | number | boolean | null> {
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
	xPos: number | null;
	yPos: number | null;
	zIndex: number | null;
	heightFitContent: boolean | null;
}