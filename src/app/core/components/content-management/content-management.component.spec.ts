import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentManagementComponent } from './content-management.component';

describe('ContentManagementComponent', () => {
  let component: ContentManagementComponent;
  let fixture: ComponentFixture<ContentManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
