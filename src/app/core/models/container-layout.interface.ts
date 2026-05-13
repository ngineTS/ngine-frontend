export interface ContainerLayout extends Record<string, string | number | boolean | null> {
    id: string;
    refId: string;
	width: number | null; // /!\ stored as a string in db due to DECIMAL(5, 2) type transfo
	height: number | null; // /!\ stored as a string in db due to DECIMAL(5, 2) type transfo
	marginTop: number | null;
	marginRight: number | null;
	marginBottom: number | null;
	marginLeft: number | null;
	paddingTop: number | null;
	paddingRight: number | null;
	paddingBottom: number | null;
	paddingLeft: number | null;
	xPos: number | null; // /!\ stored as a string in db due to DECIMAL(5, 2) type transfo
	yPos: number | null; // /!\ stored as a string in db due to DECIMAL(5, 2) type transfo
	zIndex: number | null;
	heightFitContent: boolean | null;
}