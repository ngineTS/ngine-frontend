import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericComponent } from './generic.component';

describe('GenericComponent', () => {
  let component: GenericComponent;
  let fixture: ComponentFixture<GenericComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
