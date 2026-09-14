import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StripeSuccessComponent } from './stripe-success.component';

describe('StripeSuccessComponent', () => {
  let component: StripeSuccessComponent;
  let fixture: ComponentFixture<StripeSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StripeSuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StripeSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
