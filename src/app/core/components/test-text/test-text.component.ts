import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../models/navigation.interface';
import { HttpClient } from '@angular/common/http';
import { TestText } from '../../models/test-text.interface';
import { environment } from '../../../../environments/environment';
import { GenericFormService, Person } from '../../services/generic-form.service';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GenericFormComponent } from '../generic-form/generic-form.component';
import { DropdownConfig, FormConfig } from '../../models/form-input.interface';
import { isPrimitive } from 'util';

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
    const items: number[] = [1, 2, 3];
    const personInputs: FormConfig<Person> = {
      numberArray: {
        value: null,
        validators: [],
        type: 'dropdown',
        dropdownConfig: {
          isPrimitive: true,
          items: items
        }
      }
      /*this._genericFormService.defineInputFormat(
        this._genericFormService.lucas, 
        "numberArray",
        [],
        "dropdown",
        {
          isPrimitive: true,
          items: items
        }
      )*/,
      job: this._genericFormService.defineInputFormat(
        this._genericFormService.lucas,
        "job",
        [],
        'dropdown',
        {
          isPrimitive: false,
          bindLabel: 'a',
          bindValue: 'a',
          items: [{a: 'a', b: 1, c: 'c'}, {a: 'a2', b: 2, c: 'c'}, {a: 'a3', b: 3, c: 'c'}]
        }
      ),
      /*{
        value: null,
        validators: [Validators.required], 
        type: 'dropdown',
        dropdownConfig: {
          isPrimitive: false,
          bindLabel: "a",
          bindValue: "c",
          items: [{a: 'a', b: 1}, {a: 'a2', b: 2}, {a: 'a3', b: 3}]
        }
      }*/
      child: {
        a: {
          value: this._genericFormService.lucas.child["a"],
          validators: [],
          type: 'dropdown',
          dropdownConfig: {
            isPrimitive: true,
            items: items
          }
        },
        b: {
          value: this._genericFormService.lucas.child["b"],
          validators: [],
          type: 'text'
        }
      }
    }

    this._matDialog.open<GenericFormComponent<Person>, FormConfig<Person>>(
      GenericFormComponent,
      { data: personInputs }
    );
    /*const inputs: InputsArray<Person> = [
      this._genericFormService.defineInputFormat(
        this._genericFormService.lucas, 
        'book', 
        [Validators.required], 
        'dropdown',
        {
          isPrimitive: true,
          items: items
        }
      ),
      this._genericFormService.defineInputFormat(
        this._genericFormService.lucas, 
        'job', 
        [Validators.required], 
        'dropdown',
        {
          isPrimitive: false,
          bindLabel: 'b',
          bindValue: 'a',
          items: [{a: 'a', b: 'b'}, {a: 'a2', b: 'b2'}, {a: 'a3', b: 'b3'}]
        }
      ),
      { child: [
          this._genericFormService.defineInputFormat(
            this._genericFormService.lucas.child, 
            'message', 
            [Validators.required], 
            'dropdown',
            {isPrimitive: true, items: items}
          ),
          this._genericFormService.defineInputFormat(
            this._genericFormService.lucas.child, 
            'name', 
            [Validators.required], 
            'dropdown',
            {
              isPrimitive: false, 
              items: [{azerty: 'azertyValue', qwerty: 'qwertyValue'}],
              bindLabel: 'azerty',
              bindValue: 'qwerty'}
          ),
        ],
      } 
    ];
    console.log("Inputs", inputs);
    */
  }

}