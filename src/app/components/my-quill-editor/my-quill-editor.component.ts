import { Component, Input } from '@angular/core';
import { QuillModule } from 'ngx-quill'
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { retry, take } from 'rxjs';
import { QuillEditorContent } from '../../core/models/quill-editor.interface';
import { MatButton } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationBaseComponent } from '../../core/components/navigation-base/navigation-base.component';


@Component({
  selector: 'app-my-quill-editor',
  imports: [
    QuillModule,
    FormsModule,
    MatButton
  ],
  templateUrl: './my-quill-editor.component.html',
  styleUrl: './my-quill-editor.component.scss'
})
export class MyQuillEditorComponent extends NavigationBaseComponent {

  constructor(private _http: HttpClient, private _snackBar: MatSnackBar) { 
                super();
              }

  content!: string;
  myQuillEditor!: QuillEditorContent;
  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      ['link', 'image', 'video', 'formula'],
      ['clean'],
    ],
  }
  
  ngOnInit() {
    this._http.get<QuillEditorContent>(`${environment.APIURL}quill-editor/navigation/${this._navigation.id}`)
      .pipe(take(this._takeCount))
      .subscribe(resp => {
        this.myQuillEditor = resp;
        this.content = resp?.content;
      }
    );
  }

  onSaveClick() {
    //edit
    if (this.myQuillEditor?.id) {
      this._http.patch(`${environment.APIURL}quill-editor/${this.myQuillEditor.id}`, {
        navigationId: this._navigation.id,
        content: this.content
      }).pipe(take(this._takeCount))
        .subscribe(() => {
          this.showSuccessSnackBar('updated');
          this._stopEditing.emit(true);
        });
    }
    //add
    else {
      this._http.post(`${environment.APIURL}quill-editor`, {
        navigationId: this._navigation.id,
        content: this.content
      }).pipe(take(this._takeCount))
        .subscribe(() => {
          this._stopEditing.emit(true);
          this.showSuccessSnackBar('saved');
        });
    }
  }

  showSuccessSnackBar(action: string) {
    this._snackBar.open(`Blog ${action} successfully`, 'Close', {
      verticalPosition: 'top',
      duration: 10000
    });
  }

}
