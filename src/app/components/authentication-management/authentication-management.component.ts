import { Component } from '@angular/core';
import { ManagementBaseComponent } from '../../core/components/management-base/management-base.component';
import { AuthPack } from './auth-pack.interface';
import { Validators } from '@angular/forms';
import { RoleService } from '../../core/services/role.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-authentication-management',
  templateUrl: './authentication-management.component.html',
  styleUrls: ['./authentication-management.component.scss'],
})
export class AuthenticationManagementComponent extends ManagementBaseComponent<AuthPack> {

  constructor(private _roleService: RoleService) { super(); }

  async ngOnInit() {
    this._tableName = 'auth_pack'
    this._sortConfiguration = { orderBy: 'order', order: 'ASC' };
    this._loadItems();
    this._formInputsConfiguration = {
      name: {
        type: 'text',
        alias: 'Name',
        value: '',
        validators: [Validators.required],
        order: 0
      },
      description: {
        type: 'text',
        alias: 'Description',
        value: '',
        validators: [Validators.required],
        order: 1
      },
      order: {
        type: 'number',
        alias: 'Order',
        value: 0,
        validators: [Validators.required, Validators.min(0)],
        order: 2
      },
      roleId: {
        type: 'dropdown',
        dropdownConfig: {
          bindValue: 'id',
          bindLabel: 'displayLabel',
          items: await firstValueFrom(this._roleService.getAllRoles())
        },
        alias: 'Role',
        value: '',
        validators: [Validators.required],
        order: 3
      },
      stripePriceId: {
        type: 'text',
        alias: 'Stripe Price ID',
        value: '',
        validators: [],
        order: 4
      },
      price: {
        type: 'number',
        alias: 'Price',
        value: 0,
        validators: [],
        order: 5
      },
      currency: {
        type: 'text',
        alias: 'Currency',
        value: '',
        validators: [],
        order: 6
      },
      isRecurringPayment: {
        type: 'checkbox',
        alias: 'Is Recurring Payment',
        value: false,
        validators: [],
        order: 7
      },
      interval: {
        type: 'dropdown',
        dropdownConfig: {
          items: ['Week', 'Month', 'Year']
        },
        alias: 'Interval',
        value: '',
        validators: [],
        order: 8
      },
      isFree: {
        type: 'checkbox',
        alias: 'Is Free',
        value: false,
        validators: [],
        order: 9
      }
    }
  }
}
