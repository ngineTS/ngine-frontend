import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentManagementFormComponent } from './content-management-form.component';

describe('ContentManagementFormComponent', () => {
  let component: ContentManagementFormComponent;
  let fixture: ComponentFixture<ContentManagementFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentManagementFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentManagementFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
