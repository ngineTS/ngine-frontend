import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ContainerLayout } from "../models/container-layout.interface";
import { TypeORMUpdateResponseType } from "../models/typeorm-update-response.interface";
import { environment } from "../../../environments/environment";
import { DeepFormConfig } from "../models/form-input.interface";
import { Validators } from "@angular/forms";


@Injectable({
    providedIn: 'root',
})
export class ContainerLayoutService { 

  constructor(private _http: HttpClient) {}

  /**
   * Update container layout.
   * 
   * @param id The container layout id.
   * @param containerLayoutProps The containerLayout properties to update.
   * @returns 
   */
  updateContainerLayout(id: string, containerLayoutProps: Partial<ContainerLayout>) {
    return this._http.patch<TypeORMUpdateResponseType>(`${environment.APIURL}container-layout/${id}`, containerLayoutProps);
  }

  setUpContainerLayoutForm (
    containerLayout: ContainerLayout,
    wishedProperties?: Array<keyof ContainerLayout>
  ): DeepFormConfig<Partial<ContainerLayout>> {
    
    const containerLayoutFormConfig: DeepFormConfig<Partial<ContainerLayout>> = {
      heightFitContent: {
        value: containerLayout.heightFitContent,
        alias: 'Fit content',
        order: 0,
        type: 'checkbox',
        validators: []
      },
      width: {
        value: containerLayout.width ? Math.round(containerLayout.width * 100) / 100 : null,
        alias: 'Width',
        order: 1,
        type: 'number',
        validators: []
      },
      height: {
        value: containerLayout.height ? Math.round(containerLayout.height * 100) / 100 : null,
        alias: 'Height',
        order: 2,
        type: 'number',
        validators: []
      },
      xPos: {
        value: containerLayout.xPos ?? null,
        alias: 'X Position',
        order: 3,
        type: 'number',
        validators: []
      },
      yPos: {
        value: containerLayout.yPos ?? null,
        alias: 'Y Position',
        order: 4,
        type: 'number',
        validators: []
      },
      zIndex: {
        value: containerLayout.zIndex,
        alias: 'Z Index',
        order: 5,
        type: 'number',
        validators: [Validators.min(0)]
      },
      marginTop: {
        value: containerLayout.marginTop ?? null,
        alias: 'Margin Top',
        order: 6,
        type: 'number',
        validators: []
      },
      marginRight: {
        value: containerLayout.marginRight ?? null,
        alias: 'Margin Right',
        order: 7,
        type: 'number',
        validators: []
      },
      marginBottom: {
        value: containerLayout.marginBottom ?? null,
        alias: 'Margin Bottom',
        order: 8,
        type: 'number',
        validators: []
      },
      marginLeft: {
        value: containerLayout.marginLeft ?? null,
        alias: 'Margin Left',
        order: 9,
        type: 'number',
        validators: []
      },
      paddingTop: {
        value: containerLayout.paddingTop ?? null,
        alias: 'Padding Top',
        order: 10,
        type: 'number',
        validators: []
      },
      paddingRight: {
        value: containerLayout.paddingRight ?? null,
        alias: 'Padding Right',
        order: 11,
        type: 'number',
        validators: []
      },
      paddingBottom: {
        value: containerLayout.paddingBottom ?? null,
        alias: 'Padding Bottom',
        order: 12,
        type: 'number',
        validators: []
      },
      paddingLeft: {
        value: containerLayout.paddingLeft ?? null,
        alias: 'Padding Left',
        order: 13,
        type: 'number',
        validators: []
      },
    }


    let filteredContainerLayoutFormConfig: typeof containerLayoutFormConfig = {};
    if (!wishedProperties) {
        filteredContainerLayoutFormConfig = containerLayoutFormConfig;
    }
    wishedProperties?.forEach(prop => {
        filteredContainerLayoutFormConfig[prop] = containerLayoutFormConfig[prop];
    });

    return filteredContainerLayoutFormConfig;
  }

}