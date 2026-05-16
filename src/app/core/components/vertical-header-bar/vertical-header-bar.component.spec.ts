import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalHeaderBarComponent } from './vertical-header-bar.component';

describe('VerticalHeaderBarComponent', () => {
  let component: VerticalHeaderBarComponent;
  let fixture: ComponentFixture<VerticalHeaderBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerticalHeaderBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerticalHeaderBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
