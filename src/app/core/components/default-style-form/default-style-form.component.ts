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
import { MatDialogRef } from '@angular/material/dialog';
import { GenericFormComponent } from '../generic-form/generic-form.component';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-default-style-form',
  imports: [FormsModule, MatButton, GenericFormComponent],
  templateUrl: './default-style-form.component.html',
  styleUrl: './default-style-form.component.scss'
})
export class DefaultStyleFormComponent {

  constructor(
    private _containerStyleService: ContainerStyleService,
    private _typographyStyleService: TypographyStyleService,
    private _appSettingsService: AppSettingsService,
    private _matDialogRef: MatDialogRef<DefaultStyleFormComponent>
  ) { }
  
  step = 1;
  appBackgroundColor!: string;
  styleFormConfiguration!: GenericFormDialogData<Partial<StylePayload>>;
  defaultContainerStyle: ContainerStyle | undefined;
  defaultTypographyStyle: TypographyStyle | undefined;

  ngOnInit() {
    this.appBackgroundColor = this._appSettingsService.getCurrentAppBackgroundColor();
    this._containerStyleService.getDefaultContainerStyle()
      .pipe(switchMap(x => {
        this.defaultContainerStyle = x
        return this._typographyStyleService.getDefaultTypographyStyle()
      }))
      .subscribe(y => {
        this.defaultTypographyStyle = y;
        this.setStyleForm();
      });
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

  onAppBackgroundColorChange() {
    console.log(event);
    this._appSettingsService.setAppBackgroundColor(this.appBackgroundColor);
  }

   setStyleForm() {
    const stylePayload: DeepFormConfig<Partial<StylePayload>> = {
      containerStyle: this._containerStyleService.setUpContainerStyleForm(
        this.defaultContainerStyle!,
        ['backgroundImage']
      ),
      typographyStyle: this._typographyStyleService.setUpTypographyStyleForm(
        this.defaultTypographyStyle!
      )
    };

    console.log(stylePayload);

    this.styleFormConfiguration = {
      hasDeleteButton: false,
      formConfig: stylePayload,
      payloadId: this.defaultContainerStyle!.refId,
      controllerName: 'menu',
    };
  }

  action(event: 'added' | 'edited' | 'deleted') {
    console.log(event);
    this._matDialogRef.close(event);
  }

  onFormValueChange(event: Record<string, any>) {
    console.log(event);
  }
}
