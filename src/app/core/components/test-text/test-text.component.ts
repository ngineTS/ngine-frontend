import { Component, Input, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Navigation } from '../../models/navigation.interface';
import { HttpClient } from '@angular/common/http';
import { TestText } from '../../models/test-text.interface';
import { environment } from '../../../../environments/environment';
import { DropdownInputConfig, StandardInputConfig } from '../../models/form-input.interface';
import { GenericFormService, Person } from '../../services/generic-form.service';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GenericFormComponent } from '../generic-form/generic-form.component';

@Component({
  selector: 'app-test-text',
  imports: [CommonModule],
  templateUrl: './test-text.component.html',
  styleUrl: './test-text.component.scss',
})
export class TestTextComponent implements OnInit {

  constructor(private _http: HttpClient,
              private _genericFormService: GenericFormService,
              private _matDialog: MatDialog) {}

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

  openGenericForm(){
    const items = ["oooo", "eeee", "fffff"];
    const inputs = [
      this._genericFormService.defineInputFormat(
        this._genericFormService.lucas, 
        'age', 
        [Validators.required], 
        'number',
      ),
      this._genericFormService.defineInputFormat(
        this._genericFormService.lucas, 
        'book', 
        [Validators.required], 
        'dropdown',
        {
          items: items
        }
      ),
      this._genericFormService.defineInputFormat(
        this._genericFormService.lucas, 
        'job', 
        [Validators.required], 
        'dropdown',
        {
          bindLabel: 'b',
          bindValue: 'a',
          items: [{a: 'a', b: 'b'}, {a: 'a2', b: 'b2'}, {a: 'a3', b: 'b3'}]
        }
      ),
    ];
    console.log("Inputs", inputs);
    this._matDialog.open<GenericFormComponent, typeof inputs>(
      GenericFormComponent,
      { data: inputs }
    );
  }

}
