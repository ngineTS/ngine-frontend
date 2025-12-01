import { Component } from '@angular/core';
import { MediaService } from '../../../core/services/media.service';
import { Media } from '../../../core/models/media.interface';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SnackBarService } from '../../../core/services/snackbar.service';

@Component({
  selector: 'app-media-library',
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './media-library.component.html',
  styleUrl: './media-library.component.scss'
})
export class MediaLibraryComponent {

  files: Array<Media> = [];
  fileIdS3UrlMap: Record<string, Observable<string>> = {};

  constructor(private _mediaService: MediaService,
              private _snackbarService: SnackBarService
  ) { }

  ngOnInit() {
    this._mediaService.getAllMedias().subscribe(resp => this.files = resp);
  }

  onDefaultImageMouseEnter(fileName: string) {
    if (!this.fileIdS3UrlMap[fileName]) {
      this.fileIdS3UrlMap[fileName] = this._mediaService.getS3ObjectSignedUrl(fileName);
    }
  }

  onFullSizeClick(media: Media) {
    console.log(media);
  }

  onDeleteClick(media: Media) {
    console.log(media.id);
    if (confirm(`Are you sure to delete ${media.name} ?`)) { 
      this._mediaService.deleteMedia(media.id).subscribe(() => {
        this._snackbarService.showSuccessSnackBar(`Media ${media.name} has been deleted successfully.`);
        this.files = this.files.filter(obj => obj.id !== media.id);
      });
    }
  }

}
