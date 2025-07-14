import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestTextComponent } from './test-text.component';

describe('TestTextComponentComponent', () => {
  let component: TestTextComponent;
  let fixture: ComponentFixture<TestTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestTextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
