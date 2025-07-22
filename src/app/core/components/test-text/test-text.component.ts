import { Component, Input, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Navigation } from '../../models/navigation.interface';
import { HttpClient } from '@angular/common/http';
import { TestText } from '../../models/test-text.interface';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-test-text',
  imports: [CommonModule],
  templateUrl: './test-text.component.html',
  styleUrl: './test-text.component.scss',
})
export class TestTextComponent implements OnInit {

  constructor(private _http: HttpClient) {}

  @Input() navigation!: Navigation;
  content!: TestText;

  ngOnInit() {
    this._http.get<TestText>(`${environment.APIURL}test-text/navigation/${this.navigation.id}`).subscribe(resp => {
      this.content = resp;
    });
  }

  ngAfterViewInit(){
  
  }

  ngOnDestroy() {
  }

  onSpanClick() {
  }

}
