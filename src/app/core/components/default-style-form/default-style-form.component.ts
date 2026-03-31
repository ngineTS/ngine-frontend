import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { DeepFormConfig, GenericFormDialogData } from '../../models/form-input.interface';
import { StylePayload } from '../../models/menu.interface';
import { ContainerStyleService } from '../../services/container-style.service';
import { TypographyStyleService } from '../../services/typography-style.service';
import { ContainerStyle } from '../../models/container-style.interface';
import { TypographyStyle } from '../../models/typography-style.interface';
import { AppSettingsService } from '../../services/app-settings.service';

@Component({
  selector: 'app-default-style-form',
  imports: [FormsModule, MatButton],
  templateUrl: './default-style-form.component.html',
  styleUrl: './default-style-form.component.scss'
})
export class DefaultStyleFormComponent {

  constructor(
    private _containerStyleService: ContainerStyleService,
    private _typographyStyleService: TypographyStyleService,
    private _appSettingsService: AppSettingsService,
  ) { }
  
  step = 1;
  appBackgroundColor!: string;
  styleFormConfiguration: GenericFormDialogData<Partial<StylePayload>> | undefined;
  defaultContainerStyle: ContainerStyle | undefined;
  defaultTypographyStyle: TypographyStyle | undefined;

  ngOnInit() {
    this.appBackgroundColor = this._appSettingsService.getCurrentAppBackgroundColor();
  }

  onNextClick(): void {
    this.saveAppBackgroundColor();
    this.step = 2;
  }
  
  saveAppBackgroundColor(): void {
    this._appSettingsService.saveAppSetting({
      settingName: 'backgroundColor',
      settingValue: this.appBackgroundColor
    }).subscribe(resp => console.log(resp));
  }

  setStyleForm() {
    /*const stylePayload: DeepFormConfig<Partial<StylePayload>> = {
      containerStyle: this._containerStyleService.setUpContainerStyleForm(this._navigation.containerStyle),
      typographyStyle: this._typographyStyleService.setUpTypographyStyleForm(this._navigation.typographyStyle)
    };

    this.styleFormConfiguration = {
      hasDeleteButton: false,
      formConfig: stylePayload,
      payloadId: '000...',
      controllerName: 'menu',
    };*/
  }

  onAppBackgroundColorChange() {
    console.log(event);
    this._appSettingsService.setAppBackgroundColor(this.appBackgroundColor);
  }
}
