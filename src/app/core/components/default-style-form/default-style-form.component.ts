import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { DeepFormConfig, FormValueEvent, GenericFormDialogData } from '../../models/form-input.interface';
import { StylePayload } from '../../models/menu.interface';
import { ContainerStyleService } from '../../services/container-style.service';
import { TypographyStyleService } from '../../services/typography-style.service';
import { ContainerStyle } from '../../models/container-style.interface';
import { TypographyStyle } from '../../models/typography-style.interface';
import { AppSettingsService } from '../../services/app-settings.service';
import { MatDialogRef } from '@angular/material/dialog';
import { GenericFormComponent } from '../generic-form/generic-form.component';
import { switchMap } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-default-style-form',
  imports: [
    FormsModule,
    MatButton,
    GenericFormComponent,
    MatTooltipModule
  ],
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
  
  /** The step use to switch between two pages. */
  step = 1;
  /** Initial app background color. */
  initialAppBackgoundColor!: string;
  /** Real time app background color. */
  appBackgroundColor!: string;
  /** Generic form configuration use to define default component style. */
  styleFormConfiguration!: GenericFormDialogData<Partial<StylePayload>>;
  /** Default container style */
  defaultContainerStyle: ContainerStyle | undefined;
  /** Default typography style. */
  defaultTypographyStyle: TypographyStyle | undefined;
  /** Boolean used to display color/activeColor of example square. */
  isMouseOverExampleSquare = false;

  /**
   * Lifecycle hook called after component has been initialized.
   * - get app background color
   * - get default style
   * - setup component style form
   */
  ngOnInit() {
    this.appBackgroundColor = this._appSettingsService.getCurrentAppBackgroundColor();
    this.initialAppBackgoundColor = JSON.parse(JSON.stringify((this.appBackgroundColor)));

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

  /**
   * Method called on 'Continue' button click'.
   * 
   * Save app background color and switch page.
   */
  onNextClick(): void {
    this.saveAppBackgroundColor();
    this.step = 2;
  }
  
  /**
   * Save app background color.
   */
  saveAppBackgroundColor(): void {
    this._appSettingsService.saveAppSetting({
      settingName: 'backgroundColor',
      settingValue: this.appBackgroundColor
    }).subscribe(() => 
      this.initialAppBackgoundColor = JSON.parse(JSON.stringify((this.appBackgroundColor)))
    );
  }

  /**
   * Method called when app background color form control changes.
   * 
   * Update in real time app background color.
   */
  onAppBackgroundColorChange() {
    this._appSettingsService.setAppBackgroundColor(this.appBackgroundColor);
  }

  /**
   * Set style form for component default style page.
   */
  setStyleForm() {
    const stylePayload: DeepFormConfig<Partial<StylePayload>> = {
      containerStyle: this._containerStyleService.setUpContainerStyleForm(
        this.defaultContainerStyle!,
        [
         'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderTopLeftRadius', 'borderTopRightRadius',
         'borderColor', 'borderStyle', 'borderWidth', 'isBorderBottomHidden', 'isBorderLeftHidden',
         'isBorderRightHidden', 'isBorderTopHidden', 'backgroundColor', 'isBackgroundTransparent'
        ]
      ),
      typographyStyle: this._typographyStyleService.setUpTypographyStyleForm(
        this.defaultTypographyStyle!
      )
    };

    this.styleFormConfiguration = {
      hasDeleteButton: false,
      formConfig: stylePayload,
      payloadId: this.defaultContainerStyle!.refId,
      controllerName: 'menu',
    };
  }

  /**
   * Method called when user makes action on generic form.
   * Close popup.
   * 
   * @param event The action made by the user.
   */
  action(event: 'added' | 'edited' | 'deleted') {
    console.log(event);
    this._matDialogRef.close(event);
  }

  /**
   * Methods called when generic form control value changes.
   * 
   * @param event The form control name and value event.
   */
  onFormValueChange(event: FormValueEvent) {
    if (event.formGroupName = 'containerStyle') {
      this.defaultContainerStyle![`${event.formControlName}`] = event.formControlValue;
    }
    if (event.formGroupName = 'typographyStyle') {
      this.defaultTypographyStyle![`${event.formControlName}`] = event.formControlValue;
    }
  }

  /**
   * Method called on top right 'X' button click.
   * 
   * Apply the last saved app background color and save.
   */
  onCloseClick() {
    this._appSettingsService.setAppBackgroundColor(this.initialAppBackgoundColor);
    this._matDialogRef.close();
  }

}
