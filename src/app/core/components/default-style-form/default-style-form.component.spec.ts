import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultStyleFormComponent } from './default-style-form.component';

describe('DefaultStyleFormComponent', () => {
  let component: DefaultStyleFormComponent;
  let fixture: ComponentFixture<DefaultStyleFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultStyleFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefaultStyleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
