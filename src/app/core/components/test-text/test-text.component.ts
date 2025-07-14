import { Component, Input, OnInit } from '@angular/core';
import { TestText } from './models/test-text.interface';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Navigation } from '../navigation/models/navigation.interface';

@Component({
  selector: 'app-test-text',
  imports: [CommonModule],
  templateUrl: './test-text.component.html',
  styleUrl: './test-text.component.scss'
})
export class TestTextComponent implements OnInit {

  constructor(private _route: ActivatedRoute) {}

  @Input() navigation!: Navigation;

  ngOnInit() {
  }

  ngAfterViewInit() {
    console.log("CONTENT", this.navigation);
  }

  ngOnDestroy() {
    console.log("AAAAAAAAA");
  }

  onSpanClick(){
  }

}
