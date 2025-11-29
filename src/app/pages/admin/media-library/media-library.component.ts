import { Component } from '@angular/core';
import { MediaService } from '../../../core/services/media.service';
import { Media } from '../../../core/models/media.interface';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-media-library',
  imports: [CommonModule],
  templateUrl: './media-library.component.html',
  styleUrl: './media-library.component.scss'
})
export class MediaLibraryComponent {

  files: Array<Media> = [];
  fileIdS3UrlMap: Record<string, Observable<string>> = {};

  constructor(public _mediaService: MediaService) { }

  ngOnInit() {
    this._mediaService.getAllMedias().subscribe(resp => this.files = resp);
  }

  onDefaultImageMouseEnter(fileName: string) {
    if (!this.fileIdS3UrlMap[fileName]) {
      this.fileIdS3UrlMap[fileName] = this._mediaService.getS3ObjectSignedUrl(fileName);
    }
  }

}
