import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class HeaderBarService {

    constructor() { }

    activeVerticalBarsNumber: number = 0;

}