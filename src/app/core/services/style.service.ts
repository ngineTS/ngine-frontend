import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { StylePayload } from "../models/menu.interface";
import { Navigation } from "../models/navigation.interface";

@Injectable({
    providedIn: 'root',
})
export class StyleService {

    constructor(private _http: HttpClient) { }

    isCopyingStyle = false;
    styleToCopy: StylePayload | null = null;

    copyStyle(navigation: Navigation): void {
        const { xPos, yPos, ...containerLayout } = navigation.containerLayout;

        this.isCopyingStyle = true;
        this.styleToCopy = {
            containerLayout,
            containerStyle: navigation.containerStyle,
            typographyStyle: navigation.typographyStyle,
        };
        document.body.classList.add('copy-style-mode');
    }

}