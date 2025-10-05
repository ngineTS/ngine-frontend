import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationBaseComponent } from './navigation-base.component';

describe('NavigationBaseComponent', () => {
  let component: NavigationBaseComponent;
  let fixture: ComponentFixture<NavigationBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationBaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavigationBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
