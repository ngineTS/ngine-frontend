import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { StylePayload } from "../models/menu.interface";
import { Navigation } from "../models/navigation.interface";
import { NavigationService } from "./navigation.service";

@Injectable({
    providedIn: 'root',
})
export class StyleService {

    constructor(
        private _http: HttpClient,
        private _navigationService: NavigationService
    ) { }

    baseURL = environment.APIURL;

    isCopyingStyle = false;
    styleToCopy: StylePayload | null = null;

    copyStyle(navigation: Navigation): void {
        setTimeout(() => {
            const { xPos, yPos, id: id_, refId: refId_, ...containerLayout } = navigation.containerLayout;
            const { id: id__, refId: refId__, ...containerStyle } = navigation.containerStyle;
            const { id: id___, refId: refId___, ...typographyStyle } = navigation.typographyStyle;

            this.isCopyingStyle = true;
            this.styleToCopy = {
                containerLayout,
                containerStyle,
                typographyStyle,
            };

            document.body.classList.add('copy-style-mode');
        }, 100);
    }

    updateStyle(refId: string, stylePayload: StylePayload) {
        return this._http.patch(`${this.baseURL}menu/${refId}`, stylePayload);
    }

    pasteStyle(event: MouseEvent, navigation: Navigation): void {
        if (this.isCopyingStyle && this.styleToCopy) {
            event.stopPropagation();
            event.preventDefault();

            this.updateStyle(navigation.id, this.styleToCopy).subscribe(() => {
                navigation.unpublishedChanges.push('containerLayout', 'containerStyle', 'typographyStyle');
                this._navigationService.navigationsWithChangesList.set(navigation.id, navigation);
            });

            for (const key in this.styleToCopy.containerLayout) {
                navigation.containerLayout[key] = this.styleToCopy.containerLayout[key]!;
            }
            for (const key in this.styleToCopy.containerStyle) {
                navigation.containerStyle[key] = this.styleToCopy.containerStyle[key]!;
            }
            for (const key in this.styleToCopy.typographyStyle) {
                navigation.typographyStyle[key] = this.styleToCopy.typographyStyle[key]!;
            }
            
            this.isCopyingStyle = false;
            this.styleToCopy = null;
            document.body.classList.remove('copy-style-mode');
        }
    }

}