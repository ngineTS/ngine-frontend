import { Component } from '@angular/core';
import { ManagementBaseComponent } from '../../core/components/management-base/management-base.component';
import { ReusableCard } from './reusable-card.interface';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-reusable-card-list',
  imports: [],
  templateUrl: './reusable-card-list.component.html',
  styleUrl: './reusable-card-list.component.scss'
})
export class ReusableCardListComponent extends ManagementBaseComponent<ReusableCard> {

  ngOnInit(): void {
    this._tableName = 'reusable_card';
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
      icon: {
        type: 'text',
        alias: 'Icon',
        value: '',
        validators: [],
        info: 'Find available icons here: https://icons.getbootstrap.com/',
        order: 1
      },
      description: {
        type: 'text',
        alias: 'Description',
        value: '',
        validators: [Validators.required],
        order: 2
      },
      order: {
        type: 'number',
        alias: 'Order',
        value: this._items.length + 1,
        validators: [Validators.required],
        order: 3
      }
    }
  }

}
