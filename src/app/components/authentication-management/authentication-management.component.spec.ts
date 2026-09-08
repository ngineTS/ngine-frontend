import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthenticationManagementComponent } from './authentication-management.component';

describe('AuthenticationManagementComponent', () => {
  let component: AuthenticationManagementComponent;
  let fixture: ComponentFixture<AuthenticationManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuthenticationManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthenticationManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
