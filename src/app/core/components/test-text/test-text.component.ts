import { AfterViewInit, Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { TestText } from '../../models/test-text.interface';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../models/navigation.interface';

@Component({
  selector: 'app-test-text',
  imports: [CommonModule],
  templateUrl: './test-text.component.html',
  styleUrl: './test-text.component.scss'
})
export class TestTextComponent implements AfterViewInit, OnDestroy {

  constructor() {}

  @Input() navigation!: Navigation;

  ngAfterViewInit() {
    console.log("CONTENT", this.navigation);
  }

  ngOnDestroy() {
    console.log("AAAAAAAAA");
  }

  onSpanClick() {
  }

}
