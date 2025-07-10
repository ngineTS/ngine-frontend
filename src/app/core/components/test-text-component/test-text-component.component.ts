import { Component, Input, OnInit } from '@angular/core';
import { TestText } from './models/test-text.interface';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-test-text-component',
  imports: [CommonModule],
  templateUrl: './test-text-component.component.html',
  styleUrl: './test-text-component.component.scss'
})
export class TestTextComponentComponent implements OnInit {

  constructor(private _route: ActivatedRoute) {}

  @Input() content!: TestText;

  ngOnInit() {
  }

  ngAfterViewInit() {
    console.log("CONTENT", this.content);
  }

  ngOnDestroy() {
    console.log("AAAAAAAAA");
  }

  onSpanClick(){
    this.content.message = 'agdd';
  }

}
