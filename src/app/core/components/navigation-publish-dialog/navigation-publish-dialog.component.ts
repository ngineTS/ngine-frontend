import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../models/navigation.interface';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-navigation-publish-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './navigation-publish-dialog.component.html',
  styleUrl: './navigation-publish-dialog.component.scss'
})
export class NavigationPublishDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { navigations: Array<Navigation> },
    private _dialogRef: MatDialogRef<NavigationPublishDialogComponent>,
    private _navigationService: NavigationService,
  ) {}

  isSaving = false;

  get navigations(): Navigation[] {
    return this.data?.navigations ?? [];
  }

  onPublish(navigation: Navigation): void {
    this._navigationService.publishNavigationChanges(navigation);
    this.data.navigations = this.data.navigations.filter(obj => obj.id !== navigation.id)
  }

  onCancel(navigation: Navigation): void {
    this._navigationService.cancelNavigationChanges(navigation);
    this.data.navigations = this.data.navigations.filter(obj => obj.id !== navigation.id);
  }

  onPublishAll() {
    const navigationGroupIds: Array<string> = [];
    this.isSaving = true;
    if (confirm('This will publish all items. Are you sure to continue?')) {
      for (const navigation of this.navigations) {
        navigationGroupIds.push(navigation.groupId);
      }
      this._navigationService.publishAllNavigations(navigationGroupIds)
        .subscribe(() => {
          this.navigations.forEach(nav => nav.unpublishedChanges = []);
          this.isSaving = false;
          this._dialogRef.close();
        });
    }
  }

  close(): void {
    this._dialogRef.close();
  }
}
