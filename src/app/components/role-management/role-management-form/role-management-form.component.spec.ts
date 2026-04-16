import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleManagementFormComponent } from './role-management-form.component';

describe('RoleManagementFormComponent', () => {
  let component: RoleManagementFormComponent;
  let fixture: ComponentFixture<RoleManagementFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleManagementFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleManagementFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
