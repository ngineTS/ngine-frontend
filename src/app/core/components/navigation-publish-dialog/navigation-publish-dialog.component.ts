import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../models/navigation.interface';

@Component({
  selector: 'app-navigation-publish-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './navigation-publish-dialog.component.html',
  styleUrl: './navigation-publish-dialog.component.scss'
})
export class NavigationPublishDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { navigations: Navigation[] },
    private _dialogRef: MatDialogRef<NavigationPublishDialogComponent>
  ) {}

  get navigations(): Navigation[] {
    return this.data?.navigations ?? [];
  }

  onPublish(navigation: Navigation): void {
    // Placeholder for future API implementation.
    console.log('Publish navigation', navigation.displayLabel);
  }

  onCancel(navigation: Navigation): void {
    // Placeholder for future API implementation.
    console.log('Cancel navigation', navigation.displayLabel);
  }

  onPublishAll(): void {
    // Placeholder for future API implementation.
    this.navigations.forEach((navigation) => console.log('Publish all', navigation.displayLabel));
  }

  close(): void {
    this._dialogRef.close();
  }
}
