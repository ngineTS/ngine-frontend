import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReusableCardListComponent } from './reusable-card-list.component';

describe('ReusableCardListComponent', () => {
  let component: ReusableCardListComponent;
  let fixture: ComponentFixture<ReusableCardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReusableCardListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReusableCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
