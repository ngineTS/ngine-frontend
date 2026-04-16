import { Component, TemplateRef } from '@angular/core';
import { MediaService } from '../../services/media.service';
import { Media } from '../../models/media.interface';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SnackBarService } from '../../services/snackbar.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SorterComponent } from '../sorter/sorter.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NavigationBaseComponent } from '../navigation-base/navigation-base.component';

@Component({
  selector: 'app-media-library',
  imports: [
    CommonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    SorterComponent,
    MatDialogModule
  ],
  templateUrl: './media-library.component.html',
  styleUrl: './media-library.component.scss'
})
export class MediaLibraryComponent extends NavigationBaseComponent {

  /* List of medias. */
  files: Array<Media> = [];
  /* Filtered list of medias. Used for search engine. */
  filteredFiles: Array<Media> = [];
  /* Mapping object of media id and his S3 URL. */
  fileIdS3UrlMap: Record<string, Observable<string>> = {};

  constructor(
    private _mediaService: MediaService,
    private _snackbarService: SnackBarService,
  ) { 
    super(); 
  }

  /**
   * Lifecycle hook called after the component has been initialized.
   * Retrieve all media metadata.
   */
  ngOnInit() {
    this._mediaService.getAllMedias().subscribe(resp => {
      this.files = resp;
      this.filteredFiles = resp;
    });
  }

  /**
   * Methods triggered on default image mouseenter.
   * Get file temporary URL and assign it to mapping object.
   * 
   * @param fileName The name of the media hovered.
   */
  onDefaultImageMouseEnter(fileName: string) {
    if (!this.fileIdS3UrlMap[fileName]) {
      this.fileIdS3UrlMap[fileName] = this._mediaService.getS3ObjectSignedUrl(fileName);
    }
  }

  /**
   * Methods triggered on "full size" top left corner icon click.
   * Open media in full size.
   * 
   * @param media The media to open in full size.
   * @param template The template used to display full size.
   */
  onFullSizeClick(media: Media, template: TemplateRef<unknown>) {
    this._matDialog.open(template, { data: media });
  }

  /**
   * Methods triggered on "trash" top right corner icon click.
   * Delete file from S3 and soft delete media record.
   * 
   * @param media The media to delete.
   */
  onDeleteClick(media: Media) {
    if (confirm(`Are you sure to delete ${media.name} ?`)) { 
      this._mediaService.deleteMedia(media.name).subscribe(() => {
        this._snackbarService.showSuccessSnackBar(`Media ${media.name} has been deleted successfully.`);
        this.files = this.files.filter(obj => obj.id !== media.id);
      });
    }
  }

  /**
   * Apply filter on file name on search input keyup.
   * 
   * @param event The keyup event.
   */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLocaleLowerCase();
    if (filterValue === '') {
      this.filteredFiles = this.files;
    }
    else {
      this.filteredFiles = this.files.filter(obj => 
        obj.name.trim().toLocaleLowerCase().includes(filterValue)
      );
    }
  }

  /**
   * Sort event. Methods triggered on sort value selection.
   * Get sort selection and call API to retrieve medias sorted by this selection.
   * 
   * @param event 
   */
  onSort(event: { key: keyof Media; sortDirection: 'ASC' | 'DESC'} ) {
    this._mediaService.getAllMedias(event.key, event.sortDirection).subscribe(resp => {
      this.files = resp;
      this.filteredFiles = resp;
    });
  }
}
