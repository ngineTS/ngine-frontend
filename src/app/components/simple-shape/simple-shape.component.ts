import { Component, ElementRef, SimpleChanges, ViewChild } from '@angular/core';
import { NavigationBaseComponent } from '../../core/components/navigation-base/navigation-base.component';
import { HttpClient } from '@angular/common/http';
import { QuillEditorContent } from '../../core/models/quill-editor.interface';
import { environment } from '../../../environments/environment';
import { take } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { SnackBarService } from '../../core/services/snackbar.service';

@Component({
  selector: 'app-simple-shape',
  imports: [FormsModule, MatButtonModule],
  templateUrl: './simple-shape.component.html',
  styleUrl: './simple-shape.component.scss'
})
export class SimpleShapeComponent extends NavigationBaseComponent {

  content!: QuillEditorContent;
  @ViewChild('textArea') textArea!: ElementRef<HTMLTextAreaElement>;

  constructor(
    private _http: HttpClient,
    private _snackbarService: SnackBarService,
  ) { super(); }

  ngOnInit() {
    this._http.get<QuillEditorContent>(`${environment.APIURL}quill-editor/navigation/${this._navigation.id}`)
      .pipe(take(this._takeCount))
      .subscribe(resp => {
        if (resp) {
          this.content = resp;
        }
        else {
          this.content = {
            content: '',
            fileName: '',
            navigationId: this._navigation.id
          } as QuillEditorContent;
        }
      }
    );
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['_isEditing']?.currentValue === true) {
      setTimeout(() => this.textArea?.nativeElement.focus(), 100);
    }
    else {
      this.textArea?.nativeElement.blur();
    }
  }

  onSaveClick() {
    //edit
    if (this.content?.id) {
      this._http.patch(`${environment.APIURL}quill-editor/${this.content.id}`, {
        navigationId: this._navigation.id,
        content: this.content.content
      }).pipe(take(this._takeCount))
        .subscribe(() => {
          this._snackbarService.showSuccessSnackBar('Content edited successfully.');
          this._stopEditing.emit(true);
        });
    }
    //add
    else {
      this._http.post(`${environment.APIURL}quill-editor`, {
        navigationId: this._navigation.id,
        content: this.content.content
      }).pipe(take(this._takeCount))
        .subscribe(() => {
          this._stopEditing.emit(true);
          this._snackbarService.showSuccessSnackBar('Content added successfully.');
        });
    }
  }
}