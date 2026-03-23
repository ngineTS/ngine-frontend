import { Component } from '@angular/core';
import { NavigationBaseComponent } from '../navigation-base/navigation-base.component';
import { HttpClient } from '@angular/common/http';
import { QuillEditorContent } from '../../models/quill-editor.interface';
import { environment } from '../../../../environments/environment';
import { take } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { SnackBarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-simple-shape',
  imports: [FormsModule, MatButtonModule],
  templateUrl: './simple-shape.component.html',
  styleUrl: './simple-shape.component.scss'
})
export class SimpleShapeComponent extends NavigationBaseComponent {

  content!: QuillEditorContent;

  constructor(
    private _http: HttpClient,
    private _snackbarService: SnackBarService,
  ) { super(); }

  ngOnInit() {
    this._http.get<QuillEditorContent>(`${environment.APIURL}quill-editor/navigation/${this._navigation.id}`)
      .pipe(take(this._takeCount))
      .subscribe(resp => {
        this.content = resp;
      }
    );
  }

  onSaveClick() {
    console.log(this.content);
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