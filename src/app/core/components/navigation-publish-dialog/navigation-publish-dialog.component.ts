import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../models/navigation.interface';
import { NavigationService } from '../../services/navigation.service';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppService } from '../../services/app.service';

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
    private _http: HttpClient,
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
    this.data.navigations = this.data.navigations.filter(obj => obj.id !== navigation.id)
  }

  onDelete(navigation: Navigation): void {
    if (confirm('Are you sure to delete this item? It will also delete sub items if there are.')) {
      
    }
  }

  async onPublishAll() {
    this.isSaving = true;
    if (confirm('This will publish all items. Are you sure to continue?')) {
      for (const navigation of this.navigations) {
        await firstValueFrom(this._http.get<{ message: string }>(`${environment.APIURL}navigation/publish/${navigation.groupId}`));
        navigation.unpublishedChanges = [];
        this._navigationService.navigationsWithChangesList.delete(navigation.id);
      }
      this.isSaving = false;
      this._dialogRef.close();
    }
  }

  close(): void {
    this._dialogRef.close();
  }
}
