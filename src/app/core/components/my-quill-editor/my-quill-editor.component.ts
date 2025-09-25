import { Component, Input } from '@angular/core';
import { QuillModule } from 'ngx-quill'
import { Navigation } from '../../models/navigation.interface';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { take } from 'rxjs';
import { QuillEditorContent } from '../../models/quill-editor.interface';
import { MatButton } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';


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
export class MyQuillEditorComponent {

  constructor(private _http: HttpClient, private _snackBar: MatSnackBar) {}

  @Input() navigation!: Navigation;
  content!: string;
  myQuillEditor!: QuillEditorContent;
  canEdit = false;

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
    this._http.get<QuillEditorContent>(`${environment.APIURL}quill-editor/navigation/${this.navigation.id}`).pipe(take(1)).subscribe(resp => {
      this.myQuillEditor = resp;
      this.content = resp?.content;
      console.log(this.myQuillEditor);
    });
    
  }

  onSaveClick() {
    //edit
    if (this.myQuillEditor?.id) {
      this._http.patch(`${environment.APIURL}quill-editor/${this.myQuillEditor.id}`, {
        navigationId: this.navigation.id,
        content: this.content
      }).subscribe(resp => {
        console.log(resp);
        this.showSuccessSnackBar('updated');
      });
    }
    //add
    else {
      this._http.post(`${environment.APIURL}quill-editor`, {
        navigationId: this.navigation.id,
        content: this.content
      }).subscribe(resp => {
        console.log(resp);
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
