import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Navigation } from '../../models/navigation.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NavigationManagementComponent } from '../navigation-management/navigation-management.component';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-menu-button',
  imports: [MatMenuModule, MatButtonModule, NgTemplateOutlet],
  templateUrl: './menu-button.component.html',
  styleUrl: './menu-button.component.scss'
})
export class MenuButtonComponent {

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _matDialog: MatDialog,
  ) {}

  @Input() navigation!: Navigation;

  ngOnInit() {
    console.log('NAAAAV', this.navigation);
  }

  /**
   * Navigate to given route name.
   * @param navigationName The name of the route.
   */
  navigateTo(navigationName: string) {
    console.log('navName', navigationName);
    this._router.navigate([navigationName], { relativeTo: this._route });
  }

  /**
   * Methods triggered on '+' menu option click.
   * 
   * Open form to add a redirect-button.
   */
  openFormToAddButton(navigationId: string, type: 'redirect-button' | 'menu-button') {
    this._matDialog.open(NavigationManagementComponent, {
      data: {
        navigation: undefined, // undefined as it is 'add' case.
        type: type,
        parentId: navigationId,
      }
    });
  }

}
