import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyDialogComponent } from './empty-dialog.component';

describe('EmptyDialogComponent', () => {
  let component: EmptyDialogComponent;
  let fixture: ComponentFixture<EmptyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmptyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
