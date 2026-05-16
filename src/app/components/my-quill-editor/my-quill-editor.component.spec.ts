import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyQuillEditorComponent } from './my-quill-editor.component';

describe('MyQuillEditorComponent', () => {
  let component: MyQuillEditorComponent;
  let fixture: ComponentFixture<MyQuillEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyQuillEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyQuillEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
