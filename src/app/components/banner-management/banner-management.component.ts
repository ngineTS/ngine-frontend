import { Component } from '@angular/core';
import { NavigationBaseComponent } from '../../core/components/navigation-base/navigation-base.component';
import { DeepFormConfig, GenericFormDialogData } from '../../core/models/form-input.interface';
import { Banner } from '../../core/models/banner.interface';
import { Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { GenericFormComponent } from '../../core/components/generic-form/generic-form.component';
import { BannerService } from '../../core/services/banner.service';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormContainerComponent } from '../../core/components/form-container/form-container.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-banner-management',
  imports: [
    DatePipe,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './banner-management.component.html',
  styleUrl: './banner-management.component.scss'
})
export class BannerManagementComponent extends NavigationBaseComponent {

  constructor(
    private _bannerService: BannerService
  ) {
    super();
  }

  banners: Array<Banner> = [];
  bannerFormConfig!: DeepFormConfig<Omit<Banner, 'id'>>;

  async ngOnInit() {
    this.bannerFormConfig = {
      startDate: {
        value: new Date(),
        alias: 'Start Date (UTC)',
        order: 2,
        validators: [Validators.required],
        type: 'date-and-time'
      },
      endDate: {
        value: new Date(),
        alias: 'End Date (UTC)',
        order: 3,
        validators: [Validators.required],
        type: 'date-and-time'
      },
      description: {
        value: '',
        alias: 'Description',
        order: 0,
        validators: [Validators.required],
        type: 'textarea'
      },
      navigationId: {
        value: '',
        alias: 'Navigation',
        order: 1,
        validators: [Validators.required],
        type: 'dropdown',
        dropdownConfig: {
          items: await firstValueFrom(this._navigationService.getAllRedirectButtons()),
          bindValue: 'id',
          bindLabel: 'displayLabel'
        }
      },
      url: {
        value: '',
        alias: 'URL (View more button)',
        order: 6,
        validators: [],
        type: 'text'
      },
      backgroundColor: {
        value: '',
        alias: 'Background Color',
        order: 4,
        validators: [],
        type: 'color'
      },
      textColor: {
        value: '',
        alias: 'Text Color',
        order: 5,
        validators: [],
        type: 'color'
      },
    }

    this._bannerService.getAllBanners().subscribe(resp => this.banners = resp);
  }

  async addBanner() {
    this.bannerFormConfig.description.value = '';
    this.bannerFormConfig.navigationId.value = '';
    this.bannerFormConfig.startDate.value = new Date();
    this.bannerFormConfig.endDate.value = new Date();
    this.bannerFormConfig.backgroundColor.value = '';
    this.bannerFormConfig.textColor.value = '';
    this.bannerFormConfig.url.value = '';

    const dialogData: GenericFormDialogData<Omit<Banner, 'id'>> = {
      formTitle: 'New banner',
      formConfig: this.bannerFormConfig,
      payloadId: null,
      controllerName: 'banner',
      hasDeleteButton: false,
    }

    const matDialogRef = this._matDialog.open(FormContainerComponent, { data: dialogData });
    matDialogRef.afterClosed().subscribe(result => {
      if (result === 'added') {
        this._bannerService.getAllBanners().subscribe(resp => this.banners = resp);
      }
    })
  }

  editBanner(banner: Banner) {
    this.bannerFormConfig.description.value = banner.description;
    this.bannerFormConfig.navigationId.value = banner.navigationId;
    this.bannerFormConfig.startDate.value = banner.startDate;
    this.bannerFormConfig.endDate.value = banner.endDate;
    this.bannerFormConfig.backgroundColor.value = banner.backgroundColor;
    this.bannerFormConfig.textColor.value = banner.textColor;
    this.bannerFormConfig.url.value = banner.url;

    const dialogData: GenericFormDialogData<Omit<Banner, 'id'>> = {
      formTitle: 'Edit banner',
      formConfig: this.bannerFormConfig,
      payloadId: banner.id,
      controllerName: 'banner',
      hasDeleteButton: true,
    }

    const matDialogRef = this._matDialog.open(FormContainerComponent, { data: dialogData });
    matDialogRef.afterClosed().subscribe(result => {
      if (result === 'edited' || result === 'deleted') {
        this._bannerService.getAllBanners().subscribe(resp => this.banners = resp);
      }
    });
  }
}
