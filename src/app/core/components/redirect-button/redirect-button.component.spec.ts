import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedirectButtonComponent } from './redirect-button.component';

describe('RedirectButtonComponent', () => {
  let component: RedirectButtonComponent;
  let fixture: ComponentFixture<RedirectButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedirectButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedirectButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
