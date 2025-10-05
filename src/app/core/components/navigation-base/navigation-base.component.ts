import { Component, inject, Input } from '@angular/core';
import { Navigation } from '../../models/navigation.interface';
import { MatDialog } from '@angular/material/dialog';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-navigation-base',
  imports: [],
  template: `
    ...
  `,
})
export class NavigationBaseComponent {

  @Input() _navigation!: Navigation;
  @Input() _canEdit!: boolean;
  @Input() _canAdd!: boolean;
  @Input({required: false}) _width!: number;
  @Input({required: false}) _heigth!: number;
  protected readonly _retryCount = 2;
  protected readonly _takeCount = 1;
  //_content: T | undefined;

  constructor() { }

  protected _matDialog = inject(MatDialog);
  protected _navigationService = inject(NavigationService);


}
