import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerManagementComponent } from './banner-management.component';

describe('BannerManagementComponent', () => {
  let component: BannerManagementComponent;
  let fixture: ComponentFixture<BannerManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BannerManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
