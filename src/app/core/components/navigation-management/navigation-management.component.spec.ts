import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationManagementComponent } from './navigation-management.component';

describe('NavigationManagementComponent', () => {
  let component: NavigationManagementComponent;
  let fixture: ComponentFixture<NavigationManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavigationManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
