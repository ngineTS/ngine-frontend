import { Component, Input } from '@angular/core';
import Quill from 'quill';
import { QuillModule, QuillConfigModule } from 'ngx-quill'
import "quill/dist/quill.core.css";
import { Navigation } from '../../models/navigation.interface';



@Component({
  selector: 'app-my-quill-editor',
  imports: [QuillModule],
  templateUrl: './my-quill-editor.component.html',
  styleUrl: './my-quill-editor.component.scss'
})
export class MyQuillEditorComponent {

  @Input() navigation!: Navigation;

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      ['link'],
      ['clean'],
    ],
    
  }

  
  ngOnInit() {
    
  }

  ngAfterViewInit() {
    /*setTimeout(() => {
      const quill = new Quill(`#${this.navigation.id}`, {
        modules: {
          //toolbar: true,
        },
        placeholder: 'Compose an epic...',
        theme: 'snow'
    });
    }, 1000)*/
  }

}
