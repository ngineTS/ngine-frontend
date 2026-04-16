import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleShapeComponent } from './simple-shape.component';

describe('SimpleShapeComponent', () => {
  let component: SimpleShapeComponent;
  let fixture: ComponentFixture<SimpleShapeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleShapeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleShapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
