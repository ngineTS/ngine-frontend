import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StripeSetupGuideComponent } from './stripe-setup-guide.component';

describe('StripeSetupGuideComponent', () => {
  let component: StripeSetupGuideComponent;
  let fixture: ComponentFixture<StripeSetupGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StripeSetupGuideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StripeSetupGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
