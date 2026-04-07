import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Navigation } from '../../models/navigation.interface';
import { MatDialog } from '@angular/material/dialog';
import { EmptyDialogComponent } from '../empty-dialog/empty-dialog.component';

@Component({
  selector: 'app-custom-button',
  imports: [MatTooltipModule],
  templateUrl: './custom-button.component.html',
  styleUrl: './custom-button.component.scss'
})
export class CustomButtonComponent {

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _matDialog: MatDialog
  ) {}

  @Input() navigation!: Navigation
  @Input() iconOnTop? = false;
  isMouseOver = false;

  /**
   * Trigger an action on button click depending of the navigation type.
   * 
   * @param navigation The navigation.
   */
  actionClick(navigation: Navigation) {
    switch (navigation.navigationType.name) {
      /* redirect to navigation url */
      case 'redirect-button':
        this._router.navigate([navigation.name], { relativeTo: this._route });
        break;
      /* open mat dialog */
      case 'dialog-button':
        this._matDialog.open(EmptyDialogComponent, {
          data: { navigation: navigation },
          width: '90%',
        });
        break;
      /* open url on new tab */
      case 'external-link-button':
        window.open(navigation.url, '_blank', 'noopener,noreferrer');
        break;
    }
  }

  /**
   * Check if user is in this navigation or not (used in case button is in navigation bar).
   * 
   * @param navigationName The navigation name to check.
   * @returns true or false.
   */
  isRouteActive(navigationName: string) {
    const urlList = this._router.url.split('/');
    return urlList.includes(navigationName);
  }

}
