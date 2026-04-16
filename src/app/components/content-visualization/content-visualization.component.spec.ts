import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentVisualizationComponent } from './content-visualization.component';

describe('ContentVisualizationComponent', () => {
  let component: ContentVisualizationComponent;
  let fixture: ComponentFixture<ContentVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentVisualizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
