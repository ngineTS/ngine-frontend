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
    skipedProperties?: Array<keyof ContainerLayout>
  ): DeepFormConfig<Partial<ContainerLayout>> {
    
    const containerLayoutFormConfig: DeepFormConfig<Partial<ContainerLayout>> = {
      width: {
          value: containerLayout.width ?? null,
          alias: 'Width',
          type: 'number',
          validators: []
      },
      height: {
          value: containerLayout.height ?? 50,
          alias: 'Height',
          type: 'number',
          validators: [Validators.required]
      },
      marginTop: {
          value: containerLayout.marginTop ?? null,
          alias: 'Margin Top',
          type: 'number',
          validators: []
      },
      marginRight: {
          value: containerLayout.marginRight ?? null,
          alias: 'Margin Right',
          type: 'number',
          validators: []
      },
      marginBottom: {
          value: containerLayout.marginBottom ?? null,
          alias: 'Margin Bottom',
          type: 'number',
          validators: []
      },
      marginLeft: {
          value: containerLayout.marginLeft ?? null,
          alias: 'Margin Left',
          type: 'number',
          validators: []
      },
      paddingTop: {
          value: containerLayout.paddingTop ?? null,
          alias: 'Padding Top',
          type: 'number',
          validators: []
      },
      paddingRight: {
          value: containerLayout.paddingRight ?? null,
          alias: 'Padding Right',
          type: 'number',
          validators: []
      },
      paddingBottom: {
          value: containerLayout.paddingBottom ?? null,
          alias: 'Padding Bottom',
          type: 'number',
          validators: []
      },
      paddingLeft: {
          value: containerLayout.paddingLeft ?? null,
          alias: 'Padding Left',
          type: 'number',
          validators: []
      },
      xPos: {
          value: containerLayout.xPos ?? null,
          alias: 'X Position',
          type: 'number',
          validators: []
      },
      yPos: {
          value: containerLayout.yPos ?? null,
          alias: 'Y Position',
          type: 'number',
          validators: []
      },
      zIndex: {
          value: containerLayout.zIndex,
          alias: 'Z Index',
          type: 'number',
          validators: []
      },
    }

    if (skipedProperties) {
      skipedProperties.forEach(key => delete containerLayoutFormConfig[key]);
    }

    return containerLayoutFormConfig;
  }

}