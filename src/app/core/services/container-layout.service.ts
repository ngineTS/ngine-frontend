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
    containerLayout: ContainerLayout
  ): DeepFormConfig<Omit<ContainerLayout, 'id' | 'refId'>> {
    return {
      width: {
          value: containerLayout.width ?? null,
          type: 'number',
          validators: []
      },
      height: {
          value: containerLayout.height ?? 50,
          type: 'number',
          validators: [Validators.required]
      },
      marginTop: {
          value: containerLayout.marginTop ?? 0,
          type: 'number',
          validators: []
      },
      marginRight: {
          value: containerLayout.marginRight ?? 0,
          type: 'number',
          validators: []
      },
      marginBottom: {
          value: containerLayout.marginBottom ?? 0,
          type: 'number',
          validators: []
      },
      marginLeft: {
          value: containerLayout.marginLeft ?? 0,
          type: 'number',
          validators: []
      },
      paddingTop: {
          value: containerLayout.paddingTop ?? 0,
          type: 'number',
          validators: []
      },
      paddingRight: {
          value: containerLayout.paddingRight ?? 0,
          type: 'number',
          validators: []
      },
      paddingBottom: {
          value: containerLayout.paddingBottom ?? 0,
          type: 'number',
          validators: []
      },
      paddingLeft: {
          value: containerLayout.paddingLeft ?? 0,
          type: 'number',
          validators: []
      },
      xPos: {
          value: containerLayout.xPos ?? null,
          type: 'number',
          validators: []
      },
      yPos: {
          value: containerLayout.yPos ?? null,
          type: 'number',
          validators: []
      },
    }
  }

}