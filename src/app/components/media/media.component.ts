import { Component } from '@angular/core';
import { NavigationBaseComponent } from '../../core/components/navigation-base/navigation-base.component';
import { QuillEditorContent } from '../../core/models/quill-editor.interface';
import { HttpClient } from '@angular/common/http';
import { SnackBarService } from '../../core/services/snackbar.service';
import { environment } from '../../../environments/environment';
import { firstValueFrom, map, Observable, take } from 'rxjs';
import { MediaService } from '../../core/services/media.service';
import { Media } from '../../core/models/media.interface';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-media',
  imports: [
    MatButtonModule,
    AsyncPipe,
    MatProgressSpinnerModule
  ],
  templateUrl: './media.component.html',
  styleUrl: './media.component.scss'
})
export class MediaComponent extends NavigationBaseComponent {

  content: QuillEditorContent | undefined;
  mediaUrl$: Observable<SafeUrl> | undefined;
  media: Media | undefined;
  formFile = new FormData();
  isLoading = false;
  
  constructor(
    private _http: HttpClient,
    private _snackbarService: SnackBarService,
    private _mediaService: MediaService,
    private _sanitizer: DomSanitizer
  ) { super(); }
  
  /**
   * Lifecycle hook called after component has been initialized.
   * 
   * Get navigation content then retrieve media metadata and mediaUrl associated.
   */
  async ngOnInit() {
    this.isLoading = true;
    this.content = await firstValueFrom(
      this._http.get<QuillEditorContent>(`${environment.APIURL}quill-editor/navigation/${this._navigation.id}`)
    );

    if (this.content?.fileName) {
      this._mediaService.getMediaByFileName(this.content.fileName).subscribe(resp => {
        console.log('media table', resp);
        this.media = resp
      })
      this.mediaUrl$ = this._mediaService.getS3ObjectSignedUrl(this.content.fileName)
        .pipe(map(url => this._sanitizer.bypassSecurityTrustResourceUrl(url)));
    }
    this.isLoading = false;
  }

  /**
   * Methods called when file is uploaded.
   * - delete existing file from S3
   * - update new file to S3, retrieve his URL then save navigation content
   * 
   * @param event The file upoad event.
   */
  async onFileSelection(event: any) {
    this.isLoading = true;
    const fileUploaded: File = event.target.files[0];
    /* 1. Delete existing file. */
    this.formFile.delete('file');
    if (this.media) {
      await firstValueFrom(this._mediaService.deleteMedia(this.media.name));
      this.media = undefined;
      this.mediaUrl$ = undefined;
    }
    /* 2. Upload new file. */
    this.formFile.append('file', fileUploaded);
    this.media = await firstValueFrom(this._mediaService.uploadFileToS3(this.formFile));
    if (this.media) {
      this.mediaUrl$ = this._mediaService.getS3ObjectSignedUrl(this.media.name)
        .pipe(map(url => this._sanitizer.bypassSecurityTrustResourceUrl(url)));
      this.saveContent(this.media.name);
      this.isLoading = false;
    }
  }

  /**
   * Save file name in quill_editor table with navigation id.
   * 
   * @param fileName The file name.
   */
  saveContent(fileName: string) {
    //edit
    if (this.content?.id) {
      this._http.patch(`${environment.APIURL}quill-editor/${this.content.id}`, {
        navigationId: this._navigation.id,
        fileName: fileName
      }).pipe(take(this._takeCount))
        .subscribe(() => {
          this.content!.fileName = fileName;
          this._snackbarService.showSuccessSnackBar('Content edited successfully.');
          this._stopEditing.emit(true);
        });
    }
    //add
    else {
      this._http.post<QuillEditorContent>(`${environment.APIURL}quill-editor`, {
        navigationId: this._navigation.id,
        fileName: fileName
      }).pipe(take(this._takeCount))
        .subscribe(resp => {
          this.content = resp;
          this._stopEditing.emit(true);
          this._snackbarService.showSuccessSnackBar('Content added successfully.');
        });
    }
  }
}
