export interface ContainerLayout {
    id: string;
    refId: string;
	width: number | null;
	height: number;
	marginTop: number | null;
	marginRight: number | null;
	marginBottom: number | null;
	marginLeft: number | null;
	paddingTop: number | null;
	paddingRight: number | null;
	paddingBottom: number | null;
	paddingLeft: number | null;
	gap: number;
}